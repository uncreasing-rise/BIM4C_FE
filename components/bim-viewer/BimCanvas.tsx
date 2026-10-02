"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { useLanguage } from "@/lib/i18n/context";
import {
  createElementMesh,
  disposeObject,
  explodedPosition,
} from "./viewer-geometry";
import {
  PRESET_DIRECTIONS,
  clipRange,
  cubeCssMatrix,
  fitClipPlanes,
  easeInOutCubic,
  framePose,
  interpolatePose,
  pivotOnViewLine,
  safeViewDirection,
  turnDirection,
  type CubeTurn,
  type OrbitPose,
} from "./camera-motion";
import { BimViewCube } from "./BimViewCube";
import { timeSlicer } from "./yield";
import { PickIndex } from "./pick-index";
import { DetailCuller } from "./detail-culling";
import { FragmentsEngine, hydrateElements, cancelHydration, localIdOf, type ElementLook, type FrameAnchor } from "./fragments-engine";
import { entryPose, walkStep as stepWalk, type WalkWorld } from "./walk-physics";
import { boxMode, boxPicked, rectFrom } from "./box-select";
import {
  ENVIRONMENTS,
  ViewerPipeline,
  type DisplaySettings,
} from "./render-pipeline";
import {
  applySlotState,
  buildElementBatches,
  type ElementBatches,
} from "./render-batches";
import {
  distanceSummary,
  formatLength,
  sceneToWorld,
  worldToMap,
  type Vec3,
} from "./federation";
import { buildFeatureEdges, edgeKey, snapPoint, type SnapResult } from "./snapping";
import { placeElementMesh, syncPickingRoot } from "./model-meshes";
import { findCircles, type CircleFeature } from "./circles";
import type { MarkupShape } from "./markup";
import { addGridBubbles, declutterGridBubbles, gridKey, showOneCopyPerAxis } from "./grid-bubbles";
import { cutMeshPlane, drawingBounds, PLAN_CUT, sectionCut, type PlanDrawing, type PlanElementLines, type SheetCut } from "./plan-drawing";
import {
  accumulateSegments,
  angleArc,
  arcThrough,
  constrainPoint,
  constrainRay,
  formatMeasure,
  LOCK_SYMBOLS,
  lockConstraint,
  polygonMetrics,
  polylineLength,
  rubberBandAnchor,
  triangleMetrics,
} from "./measurement-math";
import { MeshBVH } from "three-mesh-bvh";
import {
  activeFaces,
  axisDragValue,
  clipFromBox,
  clipPivot,
  clipRotation,
  faceClip,
  localBounds,
  rotateClip,
  createSectionBoxGizmo,
  moveFace,
  planeIndex,
  type Axis,
  type Side,
} from "./section-box";
import type {
  BimBounds,
  BimSavedView,
  BimClipPlanes,
  BimDiscipline,
  BimElementData,
  BimMapConversion,
  BimModelDefinition,
  BimTool,
  BimViewPreset,
  MeasureLock,
  MeasureMode,
  MeasurePoint,
  MeasureUnits,
  Measurement,
  ModelPlacement,
  SnapKind,
  SnapSettings,
} from "./types";

import { ui } from "@/lib/i18n/ui";
/** A 2D sheet to cut: a floor plan, a section through a point, or at the active 3D section plane. */
export type SheetRequest =
  | { kind: "plan"; name: string; height: number; floor: number }
  | { kind: "section"; name: string; point: Vec3; view: Vec3 }
  | { kind: "clip"; name: string };

export interface CanvasModel {
  key: string;
  model: BimModelDefinition;
  visible: boolean;
  placement: ModelPlacement;
}

export interface ViewRequest {
  camera?: BimSavedView["camera"];
  revision: number;
  preset: BimViewPreset;
  /** Fit to one model instead of everything visible. */
  modelKey?: string;
  /** Fit to an explicit element selection instead of the whole scene. */
  elementIds?: string[];
  /** Keep the current viewing direction and only reframe (focus / zoom to). */
  keepDirection?: boolean;
}

export interface CanvasContextMenu {
  /** Pointer position relative to the canvas. */
  x: number;
  y: number;
  element: BimElementData | null;
}

export interface SectionFitRequest {
  revision: number;
  target: "selection" | "all" | "ids";
  /** For "ids": the elements to box. */
  ids?: string[];
}

export interface BimCanvasProps {
  onCameraChange: (camera: NonNullable<BimSavedView["camera"]>) => void;
  models: CanvasModel[];
  sceneBounds: BimBounds;
  sceneOrigin: Vec3;
  mapConversion?: BimMapConversion;
  activeTool: BimTool;
  selectedElementId: string | null;
  selectedElementIds: ReadonlySet<string>;
  hiddenElementIds: Set<string>;
  /** When set, every other element is drawn as a ghost and cannot be picked. */
  isolatedElementIds: ReadonlySet<string> | null;
  /** Per-element colours that replace the model's (version comparison). */
  colorOverrides: ReadonlyMap<string, string> | null;
  /** Per-element opacity (0–1) from the appearance tool; Fragments-drawn models only. */
  opacityOverrides?: ReadonlyMap<string, number> | null;
  onSelectElement: (element: BimElementData | null, append?: boolean) => void;
  onDoubleClick: (element: BimElementData | null) => void;
  /** Rectangle selection result; `append` adds to the current selection. */
  onSelectMany: (ids: string[], append: boolean) => void;
  onContextMenu: (menu: CanvasContextMenu) => void;
  onHome: () => void;
  /** A right-hand panel is open; the ViewCube moves out from under it. */
  rightPanelOpen?: boolean;
  display: DisplaySettings;
  visibleLayers: Record<BimDiscipline, boolean>;
  clipPlanes: BimClipPlanes;
  onClipPlanesChange: (clip: BimClipPlanes) => void;
  /** Next click on the model places a section plane on the clicked surface. */
  sectionFacePick?: boolean;
  onSectionFacePickDone?: () => void;
  sectionFitRequest: SectionFitRequest;
  explodeFactor: number;
  activeClashPoint: [number, number, number] | null;
  viewRequest: ViewRequest;
  snapshotRevision: number;
  onSnapshot: (data: string | null) => void;
  onStats: (stats: { bytes: number; triangles: number }) => void;
  measureMode: MeasureMode;
  snapSettings: SnapSettings;
  measurements: Measurement[];
  pendingPoint: MeasurePoint | null;
  pendingPoints: MeasurePoint[];
  onMeasurePoint: (point: MeasurePoint) => void;
  /** Shortest distance mode: the closest points between the two picked elements. */
  onMeasureShortest: (a: MeasurePoint, b: MeasurePoint) => void;
  measureLock: MeasureLock;
  measureUnits: MeasureUnits;
  /** Bumped to turn the measurements on screen into markup (see measurementRedline). */
  redlineRevision?: number;
  onRedline?: (shapes: MarkupShape[]) => void;
  /** A floor plan to cut from the model (2D sheets); answered through onPlan. */
  planRequest?: SheetRequest & { revision: number };
  onPlan?: (drawing: PlanDrawing) => void;
}

const SNAP_COLORS: Record<SnapKind, number> = {
  vertex: 0xf59e0b,
  center: 0xec4899,
  midpoint: 0xa855f7,
  edge: 0x06b6d4,
  face: 0x14b8a6,
};
const SNAP_TOLERANCE_PX = 16;
/** Measurement lines; shortest distances stand out in amber. */
const MEASURE_COLOR = 0x0f766e;
const SHORTEST_COLOR = 0xd97706;
/** Rubber band colour under an axis lock: X red, Y green, Z blue, as the section gizmo. */
const LOCK_COLORS: Partial<Record<NonNullable<MeasureLock>, number>> = { x: 0xef4444, y: 0x22c55e, z: 0x3b82f6, perpendicular: 0xf59e0b, parallel: 0xf59e0b };
/** Snap probes: rays this many pixels around the pointer find corners and edges just outside the silhouette. */
const SNAP_PROBES = Array.from({ length: 8 }, (_, i) => [
  Math.cos((i * Math.PI) / 4) * SNAP_TOLERANCE_PX * 0.75,
  Math.sin((i * Math.PI) / 4) * SNAP_TOLERANCE_PX * 0.75,
]);
const SNAP_PRIORITY: Record<SnapKind, number> = { vertex: 0, center: 1, midpoint: 2, edge: 3, face: 4 };
const NO_PLANES: THREE.Plane[] = [];
/** Looks of Fragments-drawn elements (see applyMeshState). */
const SELECTED_LOOK: ElementLook = { visible: true, color: "#06b6d4" };
const GHOST_LOOK: ElementLook = { visible: true, color: "#cbd5e1", opacity: 0.14 };
const HIDDEN_LOOK: ElementLook = { visible: false };
const DEFAULT_LOOK: ElementLook = { visible: true };
const CLICK_TOLERANCE_PX = 10;
/** Elements sampled to measure a converted model's frame shift (see FragmentsEngine.frameOffset). */
const FRAME_ANCHORS = 32;
/** Canvas pixel ratio cap while the view moves (see matchPixelRatio). */
const MOVING_PIXEL_RATIO = 1;
/** How often Fragments re-tiles while the view is moving. */
const FRAGMENTS_MOVING_MS = 300;
const FLIGHT_MS = 480;

interface ModelEntry {
  source: CanvasModel;
  group: THREE.Group;
  picking: THREE.Group;
  markers: THREE.Group;
  /** Per-element meshes: always used for picking, drawn only when isolated. */
  meshes: Map<string, THREE.Mesh>;
  /** What the GPU draws; null until built (the meshes draw meanwhile). */
  batches: ElementBatches | null;
  /**
   * Drawn by Fragments instead of batches (converted models). Its element
   * meshes are pick-only and appear as triangles arrive (hydration).
   */
  fragments: THREE.Object3D | null;
  /** Fragments models: every element's triangles have arrived. */
  hydrated: boolean;
  /** The file's column grids with bubbles, once asked for (Fragments models). */
  ifcGrids?: THREE.Object3D;
  gridsRequested?: boolean;
  ready: boolean;
}

// Layer 0 is drawn by the camera; layer 1 is pick-only.
const DRAWN_AND_PICKABLE = 0b11;
const PICK_ONLY = 0b10;

export function BimCanvas(props: BimCanvasProps) {
  const { locale } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const walkSpeedRef = useRef<HTMLSpanElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{
    update: (props: BimCanvasProps) => void;
    flyToDirection: (direction: [number, number, number]) => void;
    turn: (turn: CubeTurn) => void;
    walkPress: (key: string, pressed: boolean) => void;
    walkNudge: () => void;
  } | null>(null);
  const [walkGravity, setWalkGravity] = useState(true);
  const [walkCollision, setWalkCollision] = useState(true);
  const walkSettingsRef = useRef({ gravity: true, collision: true });
  useEffect(() => {
    walkSettingsRef.current = { gravity: walkGravity, collision: walkCollision };
    // Turning gravity back on mid-air starts the fall.
    engineRef.current?.walkNudge();
  }, [walkGravity, walkCollision]);
  const latestRef = useRef(props);
  const localeRef = useRef(locale);
  const [error, setError] = useState(false);
  const [building, setBuilding] = useState(0);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    latestRef.current = props;
    localeRef.current = locale;
    engineRef.current?.update(props);
  }, [props, locale]);

  useEffect(() => {
    const container = containerRef.current;
    const labels = labelsRef.current;
    const readout = readoutRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !labels || !readout || !tooltip) return;
    let disposed = false;
    let frame = 0;
    let current = latestRef.current;

    const scene = new THREE.Scene();
    const federation = new THREE.Group();
    const measurementGroup = new THREE.Group();
    const hoverGroup = new THREE.Group();
    const gizmo = createSectionBoxGizmo();
    scene.add(federation, measurementGroup, hoverGroup, gizmo.root);
    const entries = new Map<string, ModelEntry>();
    const materials = new Map<string, THREE.MeshStandardMaterial>();
    const primitiveGeometries = new Map<string, THREE.BufferGeometry>();
    const highlights = new Map<THREE.Material, THREE.MeshStandardMaterial>();
    const batchMaterials = new Map<number, THREE.MeshStandardMaterial>();
    const batchMaterial = (_color: string, opacity: number) => {
      if (!batchMaterials.has(opacity))
        batchMaterials.set(
          opacity,
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            opacity,
            transparent: opacity < 1,
            side: THREE.DoubleSide,
            roughness: 0.86,
            metalness: 0.02,
            clippingPlanes: activePlanes,
          }),
        );
      return batchMaterials.get(opacity)!;
    };
    // Batches drawn as context while something is isolated (tinted by the
    // instance colour, no depth writes so the isolated elements show through).
    const ghostBatch = new THREE.MeshBasicMaterial({
      color: 0xcbd5e1,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    // Isolation keeps the rest of the model as faint context, never pickable.
    const ghost = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });
    const featureEdges = new WeakMap<THREE.BufferGeometry, Set<string>>();
    const circles = new WeakMap<THREE.BufferGeometry, CircleFeature[]>();
    // Draws converted models; tiles arriving from its worker ask for a frame.
    const fragmentsEngine = new FragmentsEngine(() => {
      pipeline?.invalidate();
      // The worker's rebuilt tiles land over the next frames, not with the
      // promise that asked for them: keep drawing briefly to show them.
      fragmentsSettleUntil = performance.now() + 900;
      requestRender();
    });
    let fragmentsSettleUntil = 0;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    // The room environment (see ViewerPipeline) provides soft fill light;
    // a sky/ground hemisphere and a key light give the model form.
    const ambient = new THREE.AmbientLight(0xffffff, 0.48);
    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.28);
    const sun = new THREE.DirectionalLight(0xffffff, 0.82);
    scene.add(ambient, hemisphere, sun);
    /** Classic keeps the original lights and colours; the others use IBL. */
    const applyLighting = (environment: DisplaySettings["environment"]) => {
      const classic = environment === "classic";
      ambient.intensity = classic ? 0.48 : 0.06;
      hemisphere.color.set(classic ? 0xffffff : 0xf8fafc);
      hemisphere.groundColor.set(classic ? 0x64748b : 0x7c8594);
      hemisphere.intensity = classic ? 0.28 : 0.6;
      sun.intensity = classic ? 0.82 : 1.4;
      if (renderer) {
        renderer.toneMapping = classic ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = classic ? 1.0 : 1.08;
      }
    };
    let grid: THREE.GridHelper | null = null;

    // Six persistent planes: dragging mutates their constants in place, so
    // materials never need recompiling while the section box moves.
    const planes = [
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
      new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    ];
    const PLANE_NORMALS = planes.map((plane) => plane.normal.clone());
    let activePlanes: THREE.Plane[] = NO_PLANES;
    let activeKey = "";
    let clip: BimClipPlanes = current.clipPlanes;
    const turn = new THREE.Quaternion();
    const applyClip = (next: BimClipPlanes) => {
      clip = next;
      // A turned box turns the normals; the constants stay the same because
      // they are measured in the box's own frame (see BimClipPlanes.rotation).
      turn.copy(clipRotation(next));
      planes.forEach((plane, i) => plane.normal.copy(PLANE_NORMALS[i]).applyQuaternion(turn));
      planes[0].constant = next.x;
      planes[1].constant = -next.minX;
      planes[2].constant = next.y;
      planes[3].constant = -next.minY;
      planes[4].constant = next.z;
      planes[5].constant = -next.minZ;
      // A section box uses all six planes, a single section plane just one.
      const faces = activeFaces(next);
      const key = faces.map((f) => planeIndex(f.axis, f.side)).join(",");
      if (key !== activeKey) {
        activeKey = key;
        activePlanes = faces.length
          ? faces.map((f) => planes[planeIndex(f.axis, f.side)])
          : NO_PLANES;
        for (const m of [...materials.values(), ...highlights.values(), ...batchMaterials.values(), ...overrideMaterials.values(), ...seeThroughMaterials.values(), ghost, ghostBatch]) {
          m.clippingPlanes = activePlanes;
          m.needsUpdate = true;
        }
        fragmentsEngine.setClippingPlanes(activePlanes);
      } else if (activePlanes.length) void fragmentsEngine.update();
      gizmo.update(next, handleRadius);
    };

    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let observer: ResizeObserver;
    let center = new THREE.Vector3();
    let span = 10;
    const sceneBox = new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 5, 5));
    const maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    // Handles and the hover marker keep a constant on-screen size.
    let pipeline: ViewerPipeline;
    const screenScale = (p: THREE.Vector3) =>
      pipeline ? pipeline.screenScale(p, controls.target) : camera.position.distanceTo(p);
    const handleRadius = (p: THREE.Vector3) => Math.max(1e-3, screenScale(p) * 0.014);
    /** The camera that renders and picks: perspective or the synced ortho one. */
    const view = () => (pipeline ? pipeline.camera : camera);
    /** World length of `px` screen pixels at `p` (perspective or ortho). */
    const pxToWorld = (p: THREE.Vector3, px: number) =>
      (screenScale(p) * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * px) / viewport.height;
    // Markers are flat shapes facing the camera, a fixed number of pixels
    // across at any zoom (Autodesk style), re-sized every frame in render().
    const screenMarkers = new Set<THREE.Object3D>();
    const DISC = new THREE.CircleGeometry(1, 24);
    const OUTLINE = new THREE.RingGeometry(1, 1.4, 24);
    const markerMaterials = new Map<number, THREE.MeshBasicMaterial>();
    const markerMaterial = (color: number) => {
      if (!markerMaterials.has(color))
        markerMaterials.set(color, new THREE.MeshBasicMaterial({ color, depthTest: false, side: THREE.DoubleSide }));
      return markerMaterials.get(color)!;
    };
    const OUTLINE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, side: THREE.DoubleSide });
    /** Filled dot with a white rim, `px` pixels in radius. */
    const screenDot = (color: number, px: number) => {
      const dot = new THREE.Mesh(DISC, markerMaterial(color));
      dot.renderOrder = 4;
      const rim = new THREE.Mesh(OUTLINE, OUTLINE_MATERIAL);
      rim.renderOrder = 3;
      dot.add(rim);
      dot.userData.px = px;
      return dot;
    };
    // Fat lines: WebGL ignores line widths, so measurement lines use Line2.
    const lineMaterials = new Set<LineMaterial>();
    const fatLine = (points: THREE.Vector3[], color: number, width: number, material?: LineMaterial) => {
      const geometry = new LineGeometry();
      geometry.setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
      const lineMaterial = material ?? new LineMaterial({ color, linewidth: width, depthTest: false, transparent: true });
      lineMaterial.resolution.set(viewport.width, viewport.height);
      lineMaterials.add(lineMaterial);
      const line = new Line2(geometry, lineMaterial);
      line.computeLineDistances();
      line.renderOrder = 3;
      return line;
    };

    const requestRender = () => {
      if (!disposed && !frame && !document.hidden)
        frame = requestAnimationFrame(render);
    };
    // Updated on resize: reading the DOM rect per label per frame forces layout.
    const viewport = { width: 1, height: 1 };
    const toScreen = (p: THREE.Vector3): [number, number, boolean] => {
      const v = p.clone().project(view());
      return [
        ((v.x + 1) / 2) * viewport.width,
        ((1 - v.y) / 2) * viewport.height,
        v.z < 1 && v.z > -1,
      ];
    };
    /**
     * Places the measurement labels, keeping them from covering each other:
     * results before point coordinates, the newest first; a label that would
     * overlap one already placed moves up a step at a time, and is hidden
     * only when three steps are not enough (it shows again as the view changes).
     */
    function positionLabels() {
      const nodes = (Array.from(labels!.children) as HTMLElement[]).reverse();
      nodes.sort((a, b) => Number(b.dataset.priority ?? 0) - Number(a.dataset.priority ?? 0));
      const placed: [number, number, number, number][] = [];
      for (const node of nodes) {
        const [x, y, z] = (node.dataset.anchor ?? "0,0,0")
          .split(",")
          .map(Number);
        const [sx, sy, onScreen] = toScreen(new THREE.Vector3(x, y, z));
        if (!onScreen) {
          node.style.visibility = "hidden";
          continue;
        }
        // Sizes are measured once: reading layout every frame would be slow.
        if (!node.dataset.size) node.dataset.size = `${node.offsetWidth},${node.offsetHeight}`;
        const [w, h] = node.dataset.size.split(",").map(Number);
        const labelX = Math.max(w / 2 + 4, Math.min(viewport.width - w / 2 - 4, sx));
        let lift = 0;
        let spot: [number, number, number, number] | null = null;
        for (let step = 0; step < 4 && !spot; step++, lift += h + 3) {
          const top = Math.max(4, Math.min(viewport.height - h - 4, sy - 1.3 * h - lift));
          const box: [number, number, number, number] = [labelX - w / 2, top, labelX + w / 2, top + h];
          if (!placed.some((p) => box[0] < p[2] && box[2] > p[0] && box[1] < p[3] && box[3] > p[1])) spot = box;
        }
        node.style.visibility = spot ? "visible" : "hidden";
        if (!spot) continue;
        placed.push(spot);
        // The box's bottom is 0.3 h above the anchor when not lifted.
        node.style.transform = `translate(${labelX}px, ${spot[3] + 0.3 * h}px) translate(-50%, -130%)`;
      }
    }
    // ---- Camera flights -------------------------------------------------
    let flight: { from: OrbitPose; to: OrbitPose; start: number; duration: number } | null = null;
    const currentPose = (): OrbitPose => ({
      position: camera.position.toArray(),
      target: controls.target.toArray(),
    });
    const applyPose = (pose: OrbitPose) => {
      camera.up.set(0, 1, 0);
      camera.position.set(...pose.position);
      controls.target.set(...pose.target);
      camera.lookAt(controls.target);
    };
    /** Animated move; a zero duration (first framing) jumps straight there. */
    const flyTo = (to: OrbitPose, radius: number, duration = FLIGHT_MS) => {
      // Flush any damping momentum so it cannot add a spin to the flight.
      controls.enableDamping = false;
      controls.update();
      controls.enableDamping = true;
      const range = clipRange(
        radius,
        new THREE.Vector3(...to.position).distanceTo(new THREE.Vector3(...to.target)),
      );
      // Near/far follow the eye every frame (see fitClipPlanes).
      controls.maxDistance = Math.max(range.far, span * 20) * 0.4;
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (!duration || reduced) {
        flight = null;
        applyPose(to);
      } else flight = { from: currentPose(), to, start: performance.now(), duration };
      requestRender();
    };
    let interacting = false;
    let settle = 0;
    const markInteraction = () => {
      interacting = true;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        interacting = false;
        requestRender();
      }, 180);
    };
    // The effects (composer) always keep the full resolution; only the
    // canvas drops to MOVING_PIXEL_RATIO while the view moves. Drawing time
    // follows the pixel count: on a 2× screen, orbiting fills 4× fewer.
    const quality = maxPixelRatio;
    const movingRatio = Math.min(maxPixelRatio, MOVING_PIXEL_RATIO);
    const matchPixelRatio = () => {
      const ratio = interacting ? movingRatio : maxPixelRatio;
      if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
    };
    const stepFlight = () => {
      if (!flight) return;
      markInteraction();
      const t = Math.min(1, (performance.now() - flight.start) / flight.duration);
      applyPose(interpolatePose(flight.from, flight.to, easeInOutCubic(t)));
      if (t >= 1) flight = null;
      requestRender();
    };

    // ?perf=1: frame rate, CPU time per frame, draw calls and pick time.
    const perf = new URLSearchParams(window.location.search).has("perf")
      ? { box: document.createElement("pre"), frames: 0, cpu: 0, since: performance.now() }
      : null;
    if (perf) {
      perf.box.className =
        "pointer-events-none absolute left-2 top-2 z-40 rounded bg-black/75 px-2 py-1 font-mono text-[11px] leading-tight text-lime-300";
      container.appendChild(perf.box);
    }
    const reportPerf = (cpu: number) => {
      if (!perf) return;
      perf.frames++;
      perf.cpu += cpu;
      const now = performance.now();
      if (now - perf.since < 500) return;
      const fps = (perf.frames * 1000) / (now - perf.since);
      perf.box.textContent = [
        `${fps.toFixed(0)} fps (while redrawing)`,
        `cpu ${(perf.cpu / perf.frames).toFixed(1)} ms/frame`,
        `draws ${renderer.info.render.calls} · tris ${(renderer.info.render.triangles / 1e6).toFixed(2)} M`,
        `pick ${lastPickMs.toFixed(2)} ms · planes ${activePlanes.length}`,
      ].join("\n");
      perf.frames = 0;
      perf.cpu = 0;
      perf.since = now;
    };

    const markerWorld = new THREE.Vector3();
    const parentTurn = new THREE.Quaternion();
    /** Face every marker to the camera at its fixed pixel size. */
    const sizeScreenMarkers = () => {
      const facing = view().quaternion;
      for (const marker of screenMarkers) {
        if (!marker.parent) continue;
        marker.getWorldPosition(markerWorld);
        // Clash markers live in a model group that may be rotated.
        marker.quaternion.copy(marker.parent.getWorldQuaternion(parentTurn).invert()).multiply(facing);
        marker.scale.setScalar(pxToWorld(markerWorld, marker.userData.px as number));
      }
    };

    // ---- Depth range and navigation detail culling ---------------------
    const clipBox = new THREE.Box3();
    const gridBox = new THREE.Box3();
    /** Fits the perspective near/far planes to the scene box (see fitClipPlanes). */
    const fitDepthRange = () => {
      // Exploded parts move up to about half the factor times their distance from the centre.
      clipBox.copy(sceneBox).expandByScalar(span * (0.01 + current.explodeFactor * 0.5));
      if (grid?.visible) {
        gridBox.setFromCenterAndSize(grid.position, new THREE.Vector3(span * 2, 0.01, span * 2));
        clipBox.union(gridBox);
      }
      const { near, far } = fitClipPlanes(
        camera.position.toArray(),
        { min: clipBox.min.toArray(), max: clipBox.max.toArray() },
        camera.position.distanceTo(controls.target),
      );
      if (Math.abs(near - camera.near) > camera.near * 1e-3 || Math.abs(far - camera.far) > camera.far * 1e-3) {
        camera.near = near;
        camera.far = far;
        camera.updateProjectionMatrix();
      }
    };
    const culler = new DetailCuller();
    let lastMovingFrame = 0;
    const cullWorld = new THREE.Vector3();
    /** Screen pixels per metre at a world point, in the camera that draws. */
    const pixelsPerMetre = (point: THREE.Vector3) => {
      const active = view();
      if (active instanceof THREE.OrthographicCamera)
        return (viewport.height * active.zoom) / Math.max(1e-6, active.top - active.bottom);
      const depth = Math.max(1e-3, cullWorld.copy(point).sub(active.position).length());
      return viewport.height / (2 * Math.tan(THREE.MathUtils.degToRad(active.fov) / 2) * depth);
    };
    function* slotGroups() {
      for (const entry of entries.values()) if (entry.batches) yield* entry.batches.slots.values();
    }
    /** While the view moves, skip parts too small to matter, as far as the frame time needs. */
    const cullDetail = () => {
      if (!interacting) {
        lastMovingFrame = 0;
        if (culler.active) culler.restore();
        return;
      }
      const now = performance.now();
      if (lastMovingFrame) culler.adapt(now - lastMovingFrame);
      lastMovingFrame = now;
      culler.cull(slotGroups(), pixelsPerMetre);
    };

    // Fragments streams tiles for what the camera sees: asked whenever the
    // view changed, and once more, completely, when it comes to rest.
    const lastFragmentsView = new THREE.Matrix4();
    let viewSettled = true;
    let lastStream = 0;
    const streamFragments = () => {
      if (!fragmentsEngine.size) return;
      const active = view();
      fragmentsEngine.useCamera(active);
      active.updateMatrixWorld();
      const moved = !lastFragmentsView.equals(active.matrixWorld);
      const now = performance.now();
      // While the view moves, re-tile a few times a second rather than every
      // 100 ms: each pass uploads new buffers on the main thread mid-orbit.
      // The complete pass follows when the view comes to rest.
      if (moved && (!interacting || now - lastStream > FRAGMENTS_MOVING_MS)) {
        lastStream = now;
        lastFragmentsView.copy(active.matrixWorld);
        viewSettled = false;
        void fragmentsEngine.update();
      } else if (moved) {
        viewSettled = false;
      } else if (!interacting && !viewSettled) {
        viewSettled = true;
        void fragmentsEngine.update(true);
      }
    };

    function render() {
      frame = 0;
      if (disposed || renderer.getContext().isContextLost()) return;
      const started = performance.now();
      if (started < fragmentsSettleUntil) requestRender();
      stepFlight();
      if (orbitInertia) {
        rotateAround(orbitInertia.pivot, orbitInertia.vx, orbitInertia.vy);
        orbitInertia.vx *= 0.92;
        orbitInertia.vy *= 0.92;
        if (Math.hypot(orbitInertia.vx, orbitInertia.vy) < 0.08) {
          orbitInertia = null;
        } else {
          requestRender();
        }
      }
      if (controls.update()) requestRender();
      if (cubeRef.current) {
        cubeRef.current.style.transform = cubeCssMatrix(camera.quaternion);
        // Plan views cannot turn left/right with a fixed up axis; hide those arrows.
        const widget = cubeRef.current.closest<HTMLElement>("[data-viewcube]");
        const vertical = Math.abs(camera.getWorldDirection(new THREE.Vector3()).y) > 0.98;
        if (widget && widget.dataset.vertical !== String(vertical)) widget.dataset.vertical = String(vertical);
      }
      if (gizmo.root.visible) gizmo.update(clip, handleRadius);
      fitDepthRange();
      pipeline.sync(controls.target, span);
      streamFragments();
      cullDetail();
      sizeScreenMarkers();
      if (current.display.ifcGrids)
        declutterGridBubbles([...entries.values()].flatMap((entry) => entry.ifcGrids ? [entry.ifcGrids] : []), view(), viewport.width, viewport.height);
      matchPixelRatio();
      renderer.info.reset();
      pipeline.render(interacting, activePlanes, span);
      drawMinimap();
      // Read by performance checks (draw calls for the last frame, all passes).
      renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
      renderer.domElement.dataset.drawTriangles = String(renderer.info.render.triangles);
      reportPerf(performance.now() - started);
      current.onCameraChange({ position: camera.position.toArray(), target: controls.target.toArray(), up: camera.up.toArray(), fov: camera.fov });
      positionLabels();
    }

    // ---- Coordinates ---------------------------------------------------
    const fmt = (n: number) => formatLength(n, localeRef.current);
    const coordinateText = (p: Vec3, modelKey?: string) => {
      const [x, y, z] = sceneToWorld(p, current.sceneOrigin);
      let text = `X ${fmt(x)}   Y ${fmt(y)}   Z ${fmt(z)}   (m)`;
      const map = modelKey ? entries.get(modelKey)?.source.model.mapConversion : current.mapConversion;
      if (map) {
        const [e, n, h] = worldToMap([x, y, z], map);
        text += `\nE ${fmt(e)}   N ${fmt(n)}   H ${fmt(h)}   (m)`;
      }
      return text;
    };

    // ---- Scene extent --------------------------------------------------
    let lastBoundsKey = "";
    const applySceneBounds = (bounds: BimBounds) => {
      const key = [...bounds.min, ...bounds.max, current.display.environment].join(",");
      if (key === lastBoundsKey) return;
      lastBoundsKey = key;
      const box = new THREE.Box3(
        new THREE.Vector3(...bounds.min),
        new THREE.Vector3(...bounds.max),
      );
      center = box.getCenter(new THREE.Vector3());
      sceneBox.copy(box);
      span = Math.max(1, box.getSize(new THREE.Vector3()).length());
      hemisphere.position.copy(center).add(new THREE.Vector3(0, span, 0));
      sun.position.copy(center).add(new THREE.Vector3(span, span, span));
      if (grid) {
        scene.remove(grid);
        grid.geometry.dispose();
        (grid.material as THREE.Material).dispose();
      }
      const [major, minor] = ENVIRONMENTS[current.display.environment].grid;
      grid = new THREE.GridHelper(span * 2, 40, major, minor);
      grid.visible = current.display.grid;
      grid.position.set(center.x, box.min.y - span * 0.005, center.z);
      scene.add(grid);
      pipeline?.invalidate();
      measurementsKey = null; // marker sizes depend on span
      minimapDirty = true;
    };

    // ---- Models --------------------------------------------------------
    // Rebuilt only when visibility, ghosting or the model set changes.
    let pickList: THREE.Mesh[] | null = null;
    const invalidatePicking = () => {
      pickList = null;
      pipeline?.invalidate();
    };
    const pickable = () => {
      if (pickList) return pickList;
      const list: THREE.Mesh[] = [];
      for (const entry of entries.values())
        if (entry.ready && entry.group.visible)
          for (const mesh of entry.meshes.values())
            if (mesh.visible && !mesh.userData.ghost) list.push(mesh);
      return (pickList = list);
    };
    // Spatial index for rays. Visibility is checked per hit, so hiding or
    // isolating never rebuilds it; only moved or added meshes do.
    const pickIndex = new PickIndex();
    let indexDirty = true;
    const pickTree = () => {
      if (indexDirty) {
        const all: THREE.Mesh[] = [];
        for (const entry of entries.values())
          if (entry.ready) for (const mesh of entry.meshes.values()) all.push(mesh);
        pickIndex.build(all);
        indexDirty = false;
      }
      return pickIndex;
    };
    const isPickable = (mesh: THREE.Mesh) => {
      if (!mesh.visible || mesh.userData.ghost || !(mesh.parent?.visible ?? true)) return false;
      // Hydrated (Fragments) meshes get their ray tree on first use, not all up front.
      const geometry = mesh.geometry;
      if (!geometry.boundsTree && geometry.index && geometry.index.count > 96)
        geometry.boundsTree = new MeshBVH(geometry, { indirect: true });
      return true;
    };
    /**
     * Ray trees for every pickable mesh, built while the page is idle: built
     * on first use instead, a large element under the pointer cost a 100+ ms
     * hitch the first time it was hovered or orbited about.
     */
    let treesQueued = false;
    const prebuildPickTrees = () => {
      if (treesQueued) return;
      treesQueued = true;
      const idle = window.requestIdleCallback ?? ((run: IdleRequestCallback) => window.setTimeout(() => run({ didTimeout: false, timeRemaining: () => 8 }), 50));
      const pending = [...entries.values()].flatMap((entry) => [...entry.meshes.values()]);
      let next = 0;
      const step: IdleRequestCallback = (deadline) => {
        if (disposed) return;
        // The element index first (~100 ms for 38k elements), or the first
        // press to orbit would build it.
        if (indexDirty) pickTree();
        while (next < pending.length && deadline.timeRemaining() > 2) {
          const geometry = pending[next++].geometry;
          if (!geometry.boundsTree && geometry.index && geometry.index.count > 96)
            geometry.boundsTree = new MeshBVH(geometry, { indirect: true });
        }
        if (next < pending.length) idle(step);
        else treesQueued = false;
      };
      idle(step);
    };
    let lastPickMs = 0;
    const reportStats = () => {
      let bytes = 0;
      let triangles = 0;
      const unique = new Set<THREE.BufferGeometry>();
      for (const entry of entries.values())
        for (const mesh of entry.meshes.values()) {
          triangles += (mesh.geometry.index?.count ?? 0) / 3;
          unique.add(mesh.geometry);
        }
      for (const g of unique) {
        for (const a of Object.values(g.attributes))
          bytes += a.array.byteLength;
        bytes += g.index?.array.byteLength ?? 0;
      }
      for (const entry of entries.values()) bytes += entry.batches?.bytes ?? 0;
      current.onStats({ bytes, triangles });
      // Big scenes skip section caps while the camera moves (see pipeline.render).
      if (pipeline) pipeline.heavy = triangles > 1_500_000;
    };
    /** reportStats at most twice a second (it walks every mesh). */
    let statsTimer = 0;
    const reportStatsSoon = () => {
      statsTimer ||= window.setTimeout(() => {
        statsTimer = 0;
        if (!disposed) reportStats();
      }, 500);
    };
    const removeEntry = (entry: ModelEntry) => {
      cancelHydration(entry.source.model);
      culler.restore();
      federation.remove(entry.group);
      for (const marker of entry.markers.children) screenMarkers.delete(marker);
      for (const mesh of entry.meshes.values()) {
        const g = mesh.geometry;
        if (![...primitiveGeometries.values()].includes(g)) {
          g.boundsTree = undefined;
          g.dispose();
        }
      }
      disposeObject(entry.markers);
      for (const batch of entry.batches?.batches.values() ?? []) batch.dispose();
      entry.batches = null;
      if (entry.fragments) void fragmentsEngine.remove(entry.source.key);
      entry.fragments = null;
      entry.meshes.clear();
      entry.group.clear();
      entry.picking.clear();
      // Axes this file hid as duplicates show again from the remaining files.
      if (entry.ifcGrids) {
        entry.ifcGrids = undefined;
        showOneCopyPerAxis([...entries.values()].flatMap((e) => (e !== entry && e.ifcGrids ? [e.ifcGrids] : [])));
      }
    };
    const addElementMesh = (entry: ModelEntry, element: BimElementData, pickOnly: boolean) => {
      const mesh = createElementMesh(element, materials, primitiveGeometries, { lazyNormals: pickOnly });
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) m.clippingPlanes = activePlanes;
      if (pickOnly) mesh.layers.mask = PICK_ONLY;
      placeElementMesh(mesh, entry.group, entry.picking, !pickOnly);
      entry.meshes.set(element.id, mesh);
      return mesh;
    };
    const addClashMarkers = (entry: ModelEntry) => {
      for (const clash of entry.source.model.clashes) {
        const marker = screenDot(0xef4444, 6);
        screenMarkers.add(marker);
        marker.position.set(...clash.point);
        entry.markers.add(marker);
      }
    };
    /**
     * A converted model: Fragments draws it at once; element meshes for
     * picking follow as their triangles arrive from the Fragments worker.
     */
    const buildFragmentsEntry = async (entry: ModelEntry, bytes: Uint8Array) => {
      const key = entry.source.key;
      const model = entry.source.model;
      const isCurrent = () => !disposed && entries.get(key) === entry;
      // Elements spread through the file, to measure its Fragments frame against.
      const anchors: FrameAnchor[] = [];
      const step = Math.max(1, Math.floor(model.elements.length / FRAME_ANCHORS));
      for (let i = 0; i < model.elements.length && anchors.length < FRAME_ANCHORS; i += step) {
        const element = model.elements[i];
        const localId = localIdOf(element.id);
        if (localId !== null && element.size.some((n) => n > 1e-3)) anchors.push({ localId, centre: element.position });
      }
      const object = (await fragmentsEngine.load(key, bytes, view(), anchors)).object;
      if (!isCurrent()) {
        void fragmentsEngine.remove(key);
        return;
      }
      entry.fragments = object;
      entry.group.add(object);
      // Elements already hydrated (the same file opened again) are pickable now.
      for (const element of model.elements) if (element.geometryData) addElementMesh(entry, element, true);
      addClashMarkers(entry);
      entry.ready = true;
      indexDirty = true;
      invalidatePicking();
      meshStateKey = "";
      update(current);
      reportStats();
      void hydrateElements(
        fragmentsEngine,
        key,
        model,
        (done) => {
          if (!isCurrent()) return;
          // Only the new meshes take the current state: redoing every element
          // per batch made hydration quadratic (and rebuilt Fragments' looks).
          const localCenter = entry.group.worldToLocal(center.clone());
          for (const element of done) {
            if (entry.meshes.has(element.id)) continue;
            const mesh = addElementMesh(entry, element, true);
            applyElementState(entry, element.id, mesh, current, localCenter);
            mesh.updateMatrixWorld();
          }
          indexDirty = true;
          invalidatePicking();
          requestRender();
          reportStatsSoon();
        },
        () => !isCurrent(),
      ).then(() => {
        if (!isCurrent()) return;
        entry.hydrated = true;
        prebuildPickTrees();
      }).catch((error: unknown) => {
        if (isCurrent() && !(error instanceof DOMException && error.name === "AbortError")) setError(true);
      });
    };
    const buildEntry = async (entry: ModelEntry) => {
      setBuilding((n) => n + 1);
      try {
        const bytes = entry.source.model.fragments;
        if (bytes) return await buildFragmentsEntry(entry, bytes);
        const slice = timeSlicer();
        for (const element of entry.source.model.elements) {
          if (disposed || !entries.has(entry.source.key)) return;
          addElementMesh(entry, element, false);
          await slice();
        }
        const built = await buildElementBatches(
          entry.source.model.elements,
          batchMaterial,
          async () => {
            await slice();
            return disposed || !entries.has(entry.source.key);
          },
        );
        if (!built) return;
        entry.batches = built;
        for (const batch of built.batches.values()) {
          batch.userData.solid = batch.material;
          entry.group.add(batch);
        }
        addClashMarkers(entry);
        entry.ready = true;
        entry.hydrated = true;
        indexDirty = true;
        invalidatePicking();
        // Build the pick index while idle rather than on the first hover.
        const idle = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 200));
        idle(() => {
          if (!disposed && indexDirty) pickTree();
        });
        meshStateKey = "";
        update(current);
        reportStats();
      } finally {
        setBuilding((n) => n - 1);
      }
    };
    let reconciledModels: CanvasModel[] | null = null;
    const reconcileModels = (models: CanvasModel[]) => {
      if (models === reconciledModels) return;
      reconciledModels = models;
      const keys = new Set(models.map((m) => m.key));
      for (const [key, entry] of entries)
        if (
          !keys.has(key) ||
          entry.source.model !== models.find((m) => m.key === key)?.model
        ) {
          removeEntry(entry);
          entries.delete(key);
          indexDirty = true;
          meshStateKey = "";
          reportStats();
        }
      for (const source of models) {
        let entry = entries.get(source.key);
        if (!entry) {
          const group = new THREE.Group();
          const markers = new THREE.Group();
          group.add(markers);
          group.name = source.key;
          federation.add(group);
          entry = { source, group, picking: new THREE.Group(), markers, meshes: new Map(), batches: null, fragments: null, hydrated: false, ready: false };
          entries.set(source.key, entry);
          void buildEntry(entry).catch(() => {
            if (!disposed) setError(true);
          });
        }
        if (
          entry.source.visible !== source.visible ||
          entry.source.placement !== source.placement
        ) {
          meshStateKey = "";
          if (entry.source.placement !== source.placement) indexDirty = true;
        }
        entry.source = source;
        entry.group.visible = source.visible;
        entry.group.position.set(...source.placement.position);
        entry.group.rotation.set(0, source.placement.rotationY, 0);
        syncPickingRoot(entry.group, entry.picking);
      }
      federation.updateMatrixWorld(true);
      invalidatePicking();
    };

    // ---- Per-mesh state (visibility, explode, selection) -----------------
    let meshStateKey = "";
    let lastExplode = 0;
    const highlight = (m: THREE.Material) => {
      if (!highlights.has(m)) {
        const h = (m as THREE.MeshStandardMaterial).clone();
        h.emissive.setHex(0x06b6d4);
        h.emissiveIntensity = 0.65;
        h.clippingPlanes = activePlanes;
        highlights.set(m, h);
      }
      return highlights.get(m)!;
    };
    let lastOverrides: ReadonlyMap<string, string> | null = null;
    let lastOpacities: ReadonlyMap<string, number> | null | undefined = null;
    const overrideColors = new Map<string, THREE.Color>();
    const overrideMaterials = new Map<string, THREE.MeshStandardMaterial>();
    const overrideMaterial = (hex: string) => {
      if (!overrideMaterials.has(hex))
        overrideMaterials.set(
          hex,
          new THREE.MeshStandardMaterial({ color: hex, roughness: 0.86, metalness: 0.02, side: THREE.DoubleSide, clippingPlanes: activePlanes }),
        );
      return overrideMaterials.get(hex)!;
    };
    /** A transparent copy of a material (appearance tool), one per material and opacity. */
    const seeThroughMaterials = new Map<string, THREE.Material>();
    const seeThrough = (material: THREE.Material, opacity: number) => {
      const key = `${material.uuid}|${opacity}`;
      let copy = seeThroughMaterials.get(key);
      if (!copy) {
        copy = material.clone();
        copy.transparent = true;
        copy.opacity = opacity * material.opacity;
        copy.depthWrite = false;
        copy.clippingPlanes = activePlanes;
        seeThroughMaterials.set(key, copy);
      }
      return copy;
    };
    const slotOffset = new THREE.Vector3();
    /** One element mesh's visibility, place, layers and material for these props. */
    const applyElementState = (entry: ModelEntry, id: string, mesh: THREE.Mesh, next: BimCanvasProps, localCenter: THREE.Vector3) => {
      const isolated = next.isolatedElementIds;
      const batched = entry.batches;
      const element = mesh.userData.element as BimElementData;
      const visible =
        next.visibleLayers[element.discipline] &&
        !next.hiddenElementIds.has(element.id);
      const selected = next.selectedElementIds.has(id);
      mesh.visible = visible;
      mesh.position.copy(
        explodedPosition(element, localCenter, next.explodeFactor),
      );
      // While isolating, the isolated (and selected) elements are drawn
      // solid by their own meshes over a ghosted batch.
      // A transparency (appearance tool) needs a material of its own: the
      // element leaves its batch and draws by its own mesh (parser models;
      // Fragments applies it itself).
      const opacity = entry.fragments ? undefined : next.opacityOverrides?.get(id);
      const translucent = opacity !== undefined && opacity < 1;
      const isolatedHere = Boolean(isolated && (isolated.has(id) || selected));
      const promoted = isolatedHere || translucent;
      const ghosted = Boolean(isolated) && !isolatedHere;
      mesh.userData.ghost = ghosted;
      // Fragments cannot move single elements: exploded, the element meshes draw instead.
      const drawn = entry.fragments ? next.explodeFactor > 0 : promoted || !batched;
      mesh.layers.mask = drawn ? DRAWN_AND_PICKABLE : PICK_ONLY;
      placeElementMesh(mesh, entry.group, entry.picking, drawn);
      if (drawn && !mesh.geometry.getAttribute("normal")) mesh.geometry.computeVertexNormals();
      const overrideHex = next.colorOverrides?.get(id);
      const original = (overrideHex
        ? Array.isArray(mesh.userData.baseMaterial)
          ? (mesh.userData.baseMaterial as THREE.Material[]).map(() => overrideMaterial(overrideHex))
          : overrideMaterial(overrideHex)
        : mesh.userData.baseMaterial) as THREE.Material | THREE.Material[];
      const lit = ghosted && !batched
        ? Array.isArray(original)
          ? original.map(() => ghost)
          : ghost
        : selected
          ? Array.isArray(original)
            ? original.map(highlight)
            : highlight(original)
          : original;
      mesh.material = translucent && !ghosted
        ? Array.isArray(lit)
          ? lit.map((m) => seeThrough(m, opacity))
          : seeThrough(lit, opacity)
        : lit;
      if (batched)
        applySlotState(
          batched.slots.get(id),
          visible && !promoted,
          selected,
          slotOffset.subVectors(mesh.position, new THREE.Vector3(...element.position)),
          overrideHex
            ? (overrideColors.get(overrideHex) ??
                overrideColors.set(overrideHex, new THREE.Color(overrideHex)).get(overrideHex))
            : undefined,
        );
    };
    const applyMeshState = (next: BimCanvasProps) => {
      const isolated = next.isolatedElementIds;
      const key = `${next.explodeFactor}|${JSON.stringify(next.visibleLayers)}|${[...next.selectedElementIds].join(",")}|${[...next.hiddenElementIds].join(",")}|${isolated ? [...isolated].join(",") : "-"}|${lastBoundsKey}`;
      if (key === meshStateKey && next.colorOverrides === lastOverrides && next.opacityOverrides === lastOpacities) return;
      if (next.explodeFactor !== lastExplode) {
        lastExplode = next.explodeFactor;
        indexDirty = true;
      }
      meshStateKey = key;
      lastOverrides = next.colorOverrides;
      lastOpacities = next.opacityOverrides;
      for (const entry of entries.values()) {
        if (!entry.ready) continue;
        const batched = entry.batches;
        // Explode about the federation centre, expressed in the model frame.
        const localCenter = entry.group.worldToLocal(center.clone());
        for (const [id, mesh] of entry.meshes) applyElementState(entry, id, mesh, next, localCenter);
        if (batched)
          for (const batch of batched.batches.values()) {
            batch.material = isolated ? ghostBatch : (batch.userData.solid as THREE.Material);
            // Explode moves instances; keep whole-batch culling bounds honest.
            batch.computeBoundingBox();
            batch.computeBoundingSphere();
          }
        if (entry.fragments) {
          entry.fragments.visible = next.explodeFactor === 0;
          // Every element, hydrated or not: Fragments draws them all.
          const looks = new Map<number, ElementLook>();
          for (const element of entry.source.model.elements) {
            const localId = localIdOf(element.id);
            if (localId === null) continue;
            const hex = next.colorOverrides?.get(element.id);
            const opacity = next.opacityOverrides?.get(element.id);
            looks.set(
              localId,
              !next.visibleLayers[element.discipline] || next.hiddenElementIds.has(element.id)
                ? HIDDEN_LOOK
                : next.selectedElementIds.has(element.id)
                  ? opacity === undefined
                    ? SELECTED_LOOK
                    : { ...SELECTED_LOOK, opacity }
                  : isolated && !isolated.has(element.id)
                    ? GHOST_LOOK
                    : hex || opacity !== undefined
                      ? { visible: true, color: hex, opacity }
                      : DEFAULT_LOOK,
            );
          }
          void fragmentsEngine.applyLooks(entry.source.key, looks);
        }
        entry.markers.visible =
          next.visibleLayers.clash && next.explodeFactor === 0;
        syncPickingRoot(entry.group, entry.picking);
      }
      minimapDirty = true;
      federation.updateMatrixWorld(true);
      invalidatePicking();
    };

    // ---- Measurements --------------------------------------------------
    let measurementsKey: unknown = null;
    const vec = (p: { x: number; y: number; z: number }) =>
      new THREE.Vector3(p.x, p.y, p.z);
    const addLabel = (
      anchor: THREE.Vector3,
      text: string,
      tone: "result" | "point",
    ) => {
      const node = document.createElement("div");
      node.dataset.anchor = `${anchor.x},${anchor.y},${anchor.z}`;
      // Results win a place over point coordinates when labels would overlap.
      node.dataset.priority = tone === "result" ? "1" : "0";
      node.className = `pointer-events-none absolute left-0 top-0 whitespace-pre rounded-md px-2 py-1 font-mono text-xs font-semibold shadow-lg ring-1 ${
        tone === "result"
          ? "bg-slate-950 text-teal-100 ring-white/20"
          : "bg-white text-slate-900 ring-slate-900/25"
      }`;
      node.textContent = text;
      labels.appendChild(node);
    };
    /**
     * The 3D frame plus the measurement labels, which are HTML over the canvas
     * and would otherwise be missing from snapshots. Each label is redrawn at
     * its on-screen position with its own colours and font.
     */
    const compositeLabels = (source: HTMLCanvasElement) => {
      const nodes = [...labels.children].filter(
        (n): n is HTMLElement => n instanceof HTMLElement && !n.hidden && n.getClientRects().length > 0,
      );
      if (!nodes.length) return source;
      const out = document.createElement("canvas");
      out.width = source.width;
      out.height = source.height;
      const ctx = out.getContext("2d");
      if (!ctx) return source;
      ctx.drawImage(source, 0, 0);
      const box = source.getBoundingClientRect();
      const scale = source.width / Math.max(1, box.width);
      for (const node of nodes) {
        const r = node.getBoundingClientRect();
        if (r.right < box.left || r.left > box.right || r.bottom < box.top || r.top > box.bottom) continue;
        const style = getComputedStyle(node);
        const x = (r.left - box.left) * scale, y = (r.top - box.top) * scale;
        ctx.fillStyle = style.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(x, y, r.width * scale, r.height * scale, parseFloat(style.borderRadius || "0") * scale);
        ctx.fill();
        const size = parseFloat(style.fontSize) * scale;
        const line = parseFloat(style.lineHeight) * scale || size * 1.4;
        ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        ctx.textBaseline = "middle";
        const padX = parseFloat(style.paddingLeft) * scale, padY = parseFloat(style.paddingTop) * scale;
        (node.textContent ?? "").split("\n").forEach((text, i) =>
          ctx.fillText(text, x + padX, y + padY + line * (i + 0.5)),
        );
      }
      return out;
    };
    const renderMeasurements = (next: BimCanvasProps) => {
      const key = [
        next.measurements,
        next.pendingPoint,
        next.pendingPoints,
        lastBoundsKey,
        localeRef.current,
        next.sceneOrigin,
        next.explodeFactor,
        next.measureUnits,
        next.measureMode,
      ];
      if (
        Array.isArray(measurementsKey) &&
        key.every((k, i) => k === (measurementsKey as unknown[])[i])
      )
        return;
      measurementsKey = key;
      for (const child of measurementGroup.children) {
        screenMarkers.delete(child);
        if (child instanceof Line2) {
          lineMaterials.delete(child.material);
          child.geometry.dispose();
          child.material.dispose();
        }
      }
      measurementGroup.clear();
      labels.replaceChildren();
      // Measurements refer to assembled geometry, not presentation offsets.
      if (next.explodeFactor > 0) return;
      const marker = (p: MeasurePoint) => {
        const mesh = screenDot(SNAP_COLORS[p.snap], 4);
        screenMarkers.add(mesh);
        mesh.position.copy(vec(p));
        mesh.renderOrder = 3;
        measurementGroup.add(mesh);
      };
      const length = (metres: number) => formatMeasure(metres, 1, next.measureUnits, localeRef.current);
      const area = (metres: number) => formatMeasure(metres, 2, next.measureUnits, localeRef.current);
      const segment = (a: MeasurePoint, b: MeasurePoint, color = MEASURE_COLOR, prefix = "") => {
        measurementGroup.add(fatLine([vec(a), vec(b)], color, 2.5));
        addLabel(vec(a).add(vec(b)).multiplyScalar(0.5), prefix + length(distanceSummary(a, b).distance), "result");
      };
      for (const m of next.measurements) {
        m.points.forEach(marker);
        if ((m.mode === "distance" || m.mode === "shortest") && m.points.length === 2) {
          segment(m.points[0], m.points[1], m.mode === "shortest" ? SHORTEST_COLOR : MEASURE_COLOR, m.mode === "shortest" ? "min " : "");
        } else if (m.mode === "multipoint" && m.points.length >= 2) {
          for (const target of m.points.slice(1)) segment(m.points[0], target);
        } else if (m.mode === "accumulate" && m.points.length >= 2) {
          const { segments, total } = accumulateSegments(m.points);
          for (const [a, b] of segments) segment(a, b);
          addLabel(vec(segments.at(-1)![1]), `Σ ${length(total)}`, "result");
        } else if (m.mode === "arc" && m.points.length === 3) {
          const arc = arcThrough(m.points);
          if (arc) {
            const centre = new THREE.Vector3(...arc.centre);
            measurementGroup.add(fatLine(arc.sample().map((p) => new THREE.Vector3(...p)), MEASURE_COLOR, 2.5));
            // The radius to the middle point, and the centre itself.
            measurementGroup.add(fatLine([centre, vec(m.points[1])], MEASURE_COLOR, 1.5));
            const dot = screenDot(SNAP_COLORS.center, 4);
            screenMarkers.add(dot);
            dot.position.copy(centre);
            measurementGroup.add(dot);
            addLabel(centre.clone().lerp(vec(m.points[1]), 0.5), `R ${length(arc.radius)}\n⌒ ${length(arc.length)}`, "result");
          }
        } else if ((m.mode === "angle" || m.mode === "triangle") && m.points.length === 3) {
          const metrics = triangleMetrics(m.points);
          const vertices = m.points.map(vec);
          if (m.mode === "triangle") vertices.push(vec(m.points[0]));
          measurementGroup.add(fatLine(vertices, MEASURE_COLOR, 2.5));
          if (m.mode === "angle") {
            // Arc at B, a third of the shorter arm, so it stays inside the angle.
            const [a, b, c] = vertices;
            const arc = angleArc(m.points, Math.min(a.distanceTo(b), c.distanceTo(b)) / 3);
            if (arc.length) measurementGroup.add(fatLine(arc.map((p) => new THREE.Vector3(...p)), MEASURE_COLOR, 2));
          }
          addLabel(vec(m.points[1]), metrics ? (m.mode === "angle" ? `${fmt(metrics.angle)}°` : area(metrics.area)) : "—", "result");
        } else if (m.mode === "polyline" && m.points.length >= 2) {
          measurementGroup.add(fatLine(m.points.map(vec), MEASURE_COLOR, 2.5));
          addLabel(vec(m.points.at(-1)!), `Σ ${length(polylineLength(m.points))}`, "result");
        } else if (m.mode === "polygon" && m.points.length >= 3) {
          const metrics = polygonMetrics(m.points)!;
          measurementGroup.add(fatLine([...m.points, m.points[0]].map(vec), MEASURE_COLOR, 2.5));
          const centre = m.points.reduce((c, p) => c.add(vec(p)), new THREE.Vector3()).divideScalar(m.points.length);
          addLabel(centre, area(metrics.area), "result");
        } else if (m.mode === "point" && m.points[0]) {
          addLabel(
            vec(m.points[0]),
            coordinateText([m.points[0].x, m.points[0].y, m.points[0].z], m.points[0].modelKey),
            "point",
          );
        }
      }
      const pending = next.pendingPoints;
      pending.forEach(marker);
      if (next.measureMode === "multipoint")
        for (const target of pending.slice(1)) segment(pending[0], target);
      else if (next.measureMode === "accumulate")
        for (const [a, b] of accumulateSegments(pending).segments) segment(a, b);
      else if (pending.length > 1) measurementGroup.add(fatLine(pending.map(vec), MEASURE_COLOR, 2.5));
      requestRender();
    };

    // ---- Hover: snapping preview and coordinate readout ------------------
    // Snap glyphs as in Autodesk viewers: square = vertex, triangle =
    // midpoint, ring = edge, dot = face.
    const SNAP_GLYPHS: Record<SnapKind, THREE.BufferGeometry> = {
      vertex: new THREE.PlaneGeometry(1.6, 1.6),
      // A diamond for a circle's centre.
      center: new THREE.CircleGeometry(1.3, 4),
      midpoint: new THREE.CircleGeometry(1.25, 3).rotateZ(Math.PI / 2),
      edge: new THREE.RingGeometry(0.45, 1, 24),
      face: DISC,
    };
    const hoverMarker = new THREE.Mesh(
      SNAP_GLYPHS.face,
      new THREE.MeshBasicMaterial({ color: SNAP_COLORS.face, depthTest: false, side: THREE.DoubleSide }),
    );
    hoverMarker.renderOrder = 7;
    hoverMarker.userData.px = 7;
    screenMarkers.add(hoverMarker);
    const hoverEdge = fatLine([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)], SNAP_COLORS.edge, 3);
    hoverEdge.renderOrder = 7;
    const rubberBand = fatLine(
      [new THREE.Vector3(), new THREE.Vector3(1, 0, 0)],
      0x0f766e,
      2,
      new LineMaterial({ color: 0x0f766e, linewidth: 2, depthTest: false, transparent: true, dashed: true }),
    );
    rubberBand.renderOrder = 7;
    // Polygon preview: the edge that will close the outline back to its first point.
    const closingBand = fatLine(
      [new THREE.Vector3(), new THREE.Vector3(1, 0, 0)],
      MEASURE_COLOR,
      1.5,
      new LineMaterial({ color: MEASURE_COLOR, linewidth: 1.5, depthTest: false, transparent: true, opacity: 0.6, dashed: true }),
    );
    closingBand.renderOrder = 7;
    hoverGroup.add(hoverMarker, hoverEdge, rubberBand, closingBand);
    hoverGroup.visible = false;

    const ray = new THREE.Raycaster();
    (ray as THREE.Raycaster & { firstHitOnly?: boolean }).firstHitOnly = true;
    ray.layers.enableAll();
    const pointerNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      return {
        ndc: new THREE.Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          (-(clientY - rect.top) / rect.height) * 2 + 1,
        ),
        local: [clientX - rect.left, clientY - rect.top] as [number, number],
      };
    };
    const castFrom = (clientX: number, clientY: number) => {
      const { ndc, local } = pointerNdc(clientX, clientY);
      camera.updateMatrixWorld();
      ray.setFromCamera(ndc, view());
      return local;
    };
    const snapLabels = (): Record<SnapKind, string> =>
      ui(localeRef.current).formats.snap;

    type Hit = NonNullable<ReturnType<PickIndex["firstHit"]>>;
    /** Snap candidate of one ray hit: the hit triangle's corners and edges near the pointer. */
    const snapHit = (hit: Hit, pointer: [number, number]): SnapResult => {
      const mesh = hit.object as THREE.Mesh;
      const face = hit.face!;
      const position = mesh.geometry.getAttribute("position");
      const index = mesh.geometry.index;
      let features = featureEdges.get(mesh.geometry);
      if (!features && index) {
        features = buildFeatureEdges(position.array, index.array);
        featureEdges.set(mesh.geometry, features);
      }
      const corners = [face.a, face.b, face.c];
      const triangle = corners.map((i) =>
        new THREE.Vector3()
          .fromBufferAttribute(position, i)
          .applyMatrix4(mesh.matrixWorld)
          .toArray(),
      ) as [Vec3, Vec3, Vec3];
      const isFeature = (i: number) =>
        features
          ? features.has(
              edgeKey(position.array, corners[i], corners[(i + 1) % 3]),
            )
          : true;
      const result = snapPoint({
        triangle,
        featureEdges: [isFeature(0), isFeature(1), isFeature(2)],
        hitPoint: hit.point.toArray() as Vec3,
        project: (p) => {
          const [x, y, visible] = toScreen(new THREE.Vector3(...p));
          return visible ? [x, y] : [Infinity, Infinity];
        },
        depth: (p) => view() instanceof THREE.PerspectiveCamera
          ? -new THREE.Vector3(...p).applyMatrix4(view().matrixWorldInverse).z
          : 1,
        pointer,
        tolerancePx: SNAP_TOLERANCE_PX,
        settings: current.snapSettings,
      });
      if (!current.snapSettings.center || !features || !index || result.kind === "vertex") return result;
      // A circle's centre near the pointer (circles found once per geometry).
      let found = circles.get(mesh.geometry);
      if (!found) circles.set(mesh.geometry, (found = findCircles(position.array, index.array, features)));
      let best: SnapResult | null = null;
      for (const circle of found) {
        const centre = new THREE.Vector3(...circle.centre).applyMatrix4(mesh.matrixWorld);
        const [x, y, onScreen] = toScreen(centre);
        const distance = Math.hypot(x - pointer[0], y - pointer[1]);
        if (onScreen && distance <= SNAP_TOLERANCE_PX && (!best || distance < best.distance))
          best = { point: centre.toArray() as Vec3, kind: "center", distance };
      }
      return best ?? result;
    };

    /** Surface hit under the pointer, snapped when measuring. */
    const snapVisibilityRay = new THREE.Raycaster();
    const snapVisible = (result: SnapResult) => {
      const point = new THREE.Vector3(...result.point);
      if (activePlanes.some((plane) => plane.distanceToPoint(point) < -1e-7)) return false;
      const [x, y, onScreen] = toScreen(point);
      if (!onScreen) return false;
      snapVisibilityRay.setFromCamera(new THREE.Vector2(x / viewport.width * 2 - 1, 1 - y / viewport.height * 2), view());
      const obstruction = pickTree().firstHit(snapVisibilityRay, activePlanes, isPickable);
      const distance = point.distanceTo(snapVisibilityRay.ray.origin);
      return !obstruction || obstruction.distance >= distance - Math.max(1e-5, distance * 1e-6);
    };
    const pick = (clientX: number, clientY: number, snap: boolean) => {
      const pointer = castFrom(clientX, clientY);
      const started = performance.now();
      const hit = pickTree().firstHit(ray, activePlanes, isPickable);
      lastPickMs = performance.now() - started;
      if (!snap)
        return hit && {
          hit,
          point: hit.point.clone(),
          kind: "face" as SnapKind,
          edge: undefined,
        };
      let best: { hit: Hit; result: SnapResult } | null = hit?.face ? { hit, result: snapHit(hit, pointer) } : null;
      if (best && best.result.kind !== "face" && !snapVisible(best.result))
        best.result = { point: best.hit.point.toArray() as Vec3, kind: "face", distance: Infinity };
      {
        // Probe around the pointer: a corner or edge is found from just outside
        // the silhouette, or on a neighbouring element, as in Autodesk viewers.
        for (const [dx, dy] of SNAP_PROBES) {
          castFrom(clientX + dx, clientY + dy);
          const near = pickTree().firstHit(ray, activePlanes, isPickable);
          if (!near?.face) continue;
          const result = snapHit(near, pointer);
          if (result.kind === "face") continue;
          if (
            (!best ||
            SNAP_PRIORITY[result.kind] < SNAP_PRIORITY[best.result.kind] ||
            (result.kind === best.result.kind && result.distance < best.result.distance)) &&
            snapVisible(result)
          )
            best = { hit: near, result };
        }
        castFrom(clientX, clientY);
      }
      if (!best)
        return hit && { hit, point: hit.point.clone(), kind: "face" as SnapKind, edge: undefined };
      const { result } = best;
      if (
        activePlanes.some(
          (plane) =>
            plane.distanceToPoint(new THREE.Vector3(...result.point)) < 0,
        )
      ) {
        return hit && {
          hit,
          point: hit.point.clone(),
          kind: "face" as SnapKind,
          edge: undefined,
        };
      }
      return {
        hit: best.hit,
        point: new THREE.Vector3(...result.point),
        kind: result.kind,
        edge: result.edge,
      };
    };

    /**
     * The next measurement point under the pointer: snapped, then held on the
     * active lock's line or plane through the previous point. Under a lock
     * the pointer may be over empty space (no hit).
     */
    const measureTarget = (clientX: number, clientY: number) => {
      const picked = pick(clientX, clientY, current.measureMode !== "shortest");
      const normal = picked?.hit.face
        ? (picked.hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(picked.hit.object.matrixWorld)).toArray() as Vec3)
        : undefined;
      const anchor = rubberBandAnchor(current.measureMode, current.pendingPoints);
      const constraint = anchor && lockConstraint(current.measureLock, anchor.normal);
      if (!anchor || !constraint)
        return picked && { ...picked, hit: picked.hit as Hit | null, normal, locked: false };
      const from: Vec3 = [anchor.x, anchor.y, anchor.z];
      const point = picked
        ? constrainPoint(from, picked.point.toArray() as Vec3, constraint)
        : constrainRay(from, ray.ray.origin.toArray() as Vec3, ray.ray.direction.toArray() as Vec3, constraint);
      if (!point) return null;
      return {
        hit: picked?.hit ?? null,
        point: new THREE.Vector3(...point),
        kind: picked?.kind ?? ("face" as SnapKind),
        edge: undefined,
        normal,
        locked: true,
      };
    };
    const measurePoint = (point: THREE.Vector3, snap: SnapKind, object: THREE.Object3D | null, normal?: Vec3): MeasurePoint => {
      const element = object?.userData.element as BimElementData | undefined;
      return {
        x: point.x,
        y: point.y,
        z: point.z,
        snap,
        ...(normal && { normal }),
        // Anchored to the element's model, so the point follows when that file is moved.
        ...(element && object?.parent && {
          modelKey: element.modelKey,
          guid: element.guid,
          localPoint: object.parent.worldToLocal(point.clone()).toArray(),
        }),
      };
    };

    // ---- Shortest distance between two elements -------------------------
    // Geometry without a stored BVH gets one on first use; `indirect` leaves
    // its index buffer untouched.
    const extraBvh = new WeakMap<THREE.BufferGeometry, MeshBVH>();
    const bvhOf = (geometry: THREE.BufferGeometry) => {
      let bvh = (geometry.boundsTree as MeshBVH | undefined) ?? extraBvh.get(geometry);
      if (!bvh) extraBvh.set(geometry, (bvh = new MeshBVH(geometry, { indirect: true })));
      return bvh;
    };
    const meshOfPoint = (point: MeasurePoint) => {
      if (!point.guid) return null;
      for (const entry of entries.values())
        for (const mesh of entry.meshes.values()) {
          const element = mesh.userData.element as BimElementData;
          if (element.guid === point.guid && element.modelKey === point.modelKey) return mesh;
        }
      return null;
    };
    /** First click picks element A; the second computes the closest points between A and B. */
    const pickShortest = (clientX: number, clientY: number) => {
      const picked = pick(clientX, clientY, false);
      if (!picked) return;
      const mesh = picked.hit.object as THREE.Mesh;
      const first = current.pendingPoints[0];
      if (!first) return current.onMeasurePoint(measurePoint(picked.point, "face", mesh));
      const other = meshOfPoint(first);
      if (!other) return current.onMeasurePoint(measurePoint(picked.point, "face", mesh));
      if (other === mesh) return;
      const onA = { point: new THREE.Vector3(), distance: Infinity, faceIndex: 0 };
      const onB = { point: new THREE.Vector3(), distance: Infinity, faceIndex: 0 };
      // B's frame → A's frame; the results come back in each mesh's own frame.
      const bToA = other.matrixWorld.clone().invert().multiply(mesh.matrixWorld);
      if (!bvhOf(other.geometry).closestPointToGeometry(mesh.geometry, bToA, onA, onB)) return;
      current.onMeasureShortest(
        measurePoint(onA.point.applyMatrix4(other.matrixWorld), "face", other),
        measurePoint(onB.point.applyMatrix4(mesh.matrixWorld), "face", mesh),
      );
    };

    const hideHover = () => {
      const shown = hoverGroup.visible;
      hoverGroup.visible = false;
      tooltip.hidden = true;
      readout.dataset.empty = "true";
      // Touch never hovers, so there the hint explains the gestures instead.
      const formats = ui(localeRef.current).formats;
      readout.textContent = matchMedia("(hover: none)").matches
        ? formats.touchGestures
        : formats.hoverToReadCoordinates;
      if (shown) requestRender();
    };
    const showHover = (clientX: number, clientY: number) => {
      const measuring = current.activeTool === "measure";
      const result = measuring ? measureTarget(clientX, clientY) : pick(clientX, clientY, false);
      if (!result) return hideHover();
      const p = result.point.toArray() as Vec3;
      readout.dataset.empty = "false";
      readout.textContent = coordinateText(p, (result.hit?.object.userData.element as BimElementData | undefined)?.modelKey);
      if (!measuring) {
        // Only the coordinate readout changes: no need to redraw the scene.
        tooltip.hidden = true;
        if (hoverGroup.visible) {
          hoverGroup.visible = false;
          requestRender();
        }
        return;
      }
      hoverGroup.visible = true;
      hoverMarker.position.copy(result.point);
      hoverMarker.geometry = SNAP_GLYPHS[result.kind];
      (hoverMarker.material as THREE.MeshBasicMaterial).color.setHex(
        SNAP_COLORS[result.kind],
      );
      hoverEdge.visible = Boolean(result.edge);
      if (result.edge) {
        hoverEdge.geometry.setPositions(result.edge.flat());
        hoverEdge.computeLineDistances();
      }
      // The next segment previewed from where it starts (see rubberBandAnchor).
      const mode = current.measureMode;
      const points = current.pendingPoints;
      const pending = rubberBandAnchor(mode, points);
      const length = (metres: number) => formatMeasure(metres, 1, current.measureUnits, localeRef.current);
      const dashed = (line: Line2, from: THREE.Vector3, to: THREE.Vector3) => {
        line.geometry.setPositions([from.x, from.y, from.z, to.x, to.y, to.z]);
        line.computeLineDistances();
        // Dashes of ~8 px wherever the line is.
        const dash = pxToWorld(from.clone().lerp(to, 0.5), 8);
        line.material.dashSize = dash;
        line.material.gapSize = dash * 0.6;
      };
      rubberBand.visible = Boolean(pending);
      closingBand.visible = mode === "polygon" && points.length > 1;
      if (closingBand.visible) dashed(closingBand, result.point, vec(points[0]));
      let text = mode === "shortest" ? ui(localeRef.current).formats.shortestPick(points.length) : snapLabels()[result.kind];
      const locked = "locked" in result && result.locked;
      if (locked && current.measureLock) text += ` · 🔒 ${LOCK_SYMBOLS[current.measureLock]}`;
      if (pending) {
        rubberBand.material.color.setHex(locked && current.measureLock ? LOCK_COLORS[current.measureLock]! : MEASURE_COLOR);
        dashed(rubberBand, vec(pending), result.point);
        const cursor = { x: p[0], y: p[1], z: p[2] };
        const s = distanceSummary(pending, cursor);
        text += ` · L ${length(s.distance)}`;
        if (mode === "distance" && Math.abs(s.distance - s.horizontal) > 1e-4) {
          text += ` (Plan ${length(s.horizontal)})`;
        }
        if (mode === "polyline" && points.length > 1)
          text += ` · Σ ${length(polylineLength(points) + s.distance)}`;
        if (mode === "accumulate" && points.length > 1)
          text += ` · Σ ${length(accumulateSegments(points).total + s.distance)}`;
        if (mode === "polygon" && points.length > 1)
          text += ` · ${formatMeasure(polygonMetrics([...points, cursor])!.area, 2, current.measureUnits, localeRef.current)}`;
        if (mode === "arc" && points.length === 2) {
          const arc = arcThrough([points[0], points[1], cursor]);
          if (arc) text += ` · R ${length(arc.radius)}`;
        }
      }
      const rect = container.getBoundingClientRect();
      tooltip.hidden = false;
      tooltip.textContent = text;
      tooltip.style.transform = `translate(${clientX - rect.left + 14}px, ${clientY - rect.top + 14}px)`;
      requestRender();
    };

    // ---- Section box dragging ------------------------------------------
    let drag:
      | { kind: "face"; axis: Axis; side: Side; pointerId: number }
      | {
          kind: "ring";
          axis: Axis;
          pointerId: number;
          start: BimClipPlanes;
          pivot: THREE.Vector3;
          normal: THREE.Vector3;
          from: THREE.Vector3;
        }
      | null = null;
    /**
     * Direction from the ring centre to where the pointer ray meets the
     * ring plane, or null when the ring is seen edge-on.
     */
    const ringVector = (pivot: THREE.Vector3, normal: THREE.Vector3) => {
      if (Math.abs(ray.ray.direction.dot(normal)) < 0.05) return null;
      const hit = ray.ray.intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(normal, pivot), new THREE.Vector3());
      if (!hit) return null;
      const v = hit.sub(pivot);
      return v.lengthSq() > 1e-12 ? v.normalize() : null;
    };
    const sectionActive = () =>
      current.activeTool === "section" && clip.enabled;
    const handleAt = (clientX: number, clientY: number) => {
      if (!sectionActive()) return null;
      castFrom(clientX, clientY);
      // The raycaster ignores visibility; only the active face arrows count.
      return (
        ray.intersectObjects(
          gizmo.handles.filter((h) => h.visible),
          false,
        )[0]?.object ?? null
      );
    };

    // ---- Orbit around the pressed point ----------------------------------
    // Mouse and pen orbit about the surface point under the cursor, the way
    // Autodesk viewers do; OrbitControls only handles pan, zoom and touch.
    const pivotMarker = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x14b8a6, depthTest: false, transparent: true, opacity: 0.9 }),
    );
    pivotMarker.renderOrder = 8;
    pivotMarker.visible = false;
    scene.add(pivotMarker);
    const WORLD_UP = new THREE.Vector3(0, 1, 0);
    let orbitInertia: { pivot: THREE.Vector3; vx: number; vy: number } | null = null;
    let orbitVelocity = { vx: 0, vy: 0 };
    let orbit: {
      pointerId: number;
      x: number;
      y: number;
      pivot: THREE.Vector3;
      moved: boolean;
    } | null = null;
    const rotateAround = (pivot: THREE.Vector3, dx: number, dy: number) => {
      const height = renderer.domElement.clientHeight || 1;
      const yaw = new THREE.Quaternion().setFromAxisAngle(WORLD_UP, (-Math.PI * dx) / height);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).applyQuaternion(yaw);
      const pitch = new THREE.Quaternion().setFromAxisAngle(right, (-Math.PI * dy) / height);
      const forward = controls.target.clone().sub(camera.position).normalize();
      let turn = pitch.clone().multiply(yaw);
      // Never tip over the pole, but always allow tilting back out of a plan view.
      const tilted = forward.clone().applyQuaternion(turn);
      if (Math.abs(tilted.y) > 0.995 && Math.abs(tilted.y) > Math.abs(forward.y)) turn = yaw;
      markInteraction();
      camera.position.sub(pivot).applyQuaternion(turn).add(pivot);
      controls.target.sub(pivot).applyQuaternion(turn).add(pivot);
      camera.up.set(0, 1, 0);
      camera.lookAt(controls.target);
    };
    const endOrbit = () => {
      if (!orbit) return;
      if (renderer.domElement.hasPointerCapture(orbit.pointerId))
        renderer.domElement.releasePointerCapture(orbit.pointerId);
      if (orbit.moved) {
        pivotMarker.visible = false;
        if (Math.hypot(orbitVelocity.vx, orbitVelocity.vy) > 0.8) {
          orbitInertia = { pivot: orbit.pivot.clone(), vx: orbitVelocity.vx, vy: orbitVelocity.vy };
        }
        requestRender();
      }
      orbit = null;
    };

    // ---- Walk (first person) -------------------------------------------
    const walkKeys = new Set<string>();
    let walkFactor = 1;
    let walkFrame = 0;
    let walkLast = 0;
    let look: { pointerId: number; x: number; y: number } | null = null;
    const walking = () => current.activeTool === "walk";
    let wasWalking = false;
    /** Metres per second: a brisk walk, scaled up for very large sites. */
    const walkSpeed = () => Math.max(1.4, span / 60) * walkFactor;
    const showWalkSpeed = () => {
      if (walkSpeedRef.current)
        walkSpeedRef.current.textContent = `${walkSpeed().toLocaleString(localeRef.current === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 1 })} m/s`;
    };
    let walkVy = 0;
    /** Walked through, never stood on: rooms, openings and doors. */
    const PASS_THROUGH = /^Ifc(Space|OpeningElement|Door|VirtualElement|Annotation|Grid)/i;
    const walkRay = new THREE.Raycaster();
    walkRay.layers.enableAll();
    const DOWN = new THREE.Vector3(0, -1, 0);
    /** The visible, unclipped solids, probed like the pointer picks them. */
    const walkWorld = (): WalkWorld => {
      const tree = pickTree();
      const solid = (mesh: THREE.Mesh) =>
        isPickable(mesh) && !PASS_THROUGH.test((mesh.userData.element as BimElementData).ifcType ?? "");
      const cast = (origin: THREE.Vector3, direction: THREE.Vector3, max: number) => {
        walkRay.set(origin, direction);
        walkRay.far = max;
        return tree.firstHit(walkRay, activePlanes, solid);
      };
      return {
        castDown: (origin, max) => cast(origin, DOWN, max)?.distance ?? null,
        castAlong: (origin, direction, max) => {
          const hit = cast(origin, direction, max);
          if (!hit?.face) return null;
          return {
            distance: hit.distance,
            normal: hit.face.normal.clone().transformDirection(hit.object.matrixWorld),
          };
        },
      };
    };
    const walkOptions = () => ({ ...walkSettingsRef.current, groundY: sceneBox.min.y });
    const startWalkLoop = () => {
      if (walkFrame || disposed) return;
      walkLast = performance.now();
      walkFrame = requestAnimationFrame(walkTick);
    };
    /** Enter at eye height: on the ground in front of the model, or level where you are. */
    const enterWalk = () => {
      walkVy = 0;
      const top = sceneBox.max.y + 1;
      const world = walkWorld();
      const pose = entryPose(camera.position, sceneBox, (x, z) => {
        const d = world.castDown(new THREE.Vector3(x, top, z), top - sceneBox.min.y + 1);
        return d === null ? null : top - d;
      });
      if (!pose.moved) {
        const forward = camera.getWorldDirection(new THREE.Vector3()).setY(0);
        if (forward.lengthSq() < 1e-8) forward.set(0, 0, -1);
        pose.target.copy(pose.position).addScaledVector(forward.normalize(), 5);
      }
      flyTo({ position: pose.position.toArray(), target: pose.target.toArray() }, span / 2);
      startWalkLoop();
    };
    function walkTick(now: number) {
      walkFrame = 0;
      if (disposed || !walking()) return;
      const dt = Math.min(0.05, (now - walkLast) / 1000);
      walkLast = now;
      // Let the entry flight finish before gravity takes over.
      if (flight) {
        walkFrame = requestAnimationFrame(walkTick);
        return;
      }
      const options = walkOptions();
      const forward = camera.getWorldDirection(new THREE.Vector3());
      forward.y = 0;
      if (forward.lengthSq() < 1e-8) forward.set(0, 0, -1);
      forward.normalize();
      const right = forward.clone().cross(WORLD_UP).normalize();
      const move = new THREE.Vector3();
      const has = (...keys: string[]) => keys.some((k) => walkKeys.has(k));
      if (has("w", "arrowup")) move.add(forward);
      if (has("s", "arrowdown")) move.sub(forward);
      if (has("d", "arrowright")) move.add(right);
      if (has("a", "arrowleft")) move.sub(right);
      // Up and down only in free flight; with gravity the floor decides.
      if (!options.gravity) {
        if (has("e", "pageup")) move.y += 1;
        if (has("q", "pagedown")) move.y -= 1;
      }
      if (move.lengthSq())
        move.normalize().multiplyScalar(walkSpeed() * (walkKeys.has("shift") ? 3 : 1) * dt);
      const next = stepWalk({ position: camera.position, vy: walkVy }, move, walkWorld(), options, dt);
      walkVy = next.vy;
      const delta = next.position.sub(camera.position);
      const moved = delta.lengthSq() > 1e-12;
      if (moved) {
        camera.position.add(delta);
        controls.target.add(delta);
        markInteraction();
        requestRender();
      }
      // Keep stepping while a key is held or the body is still falling.
      if (walkKeys.size || walkVy !== 0 || (options.gravity && moved))
        walkFrame = requestAnimationFrame(walkTick);
    }
    const walkKeyDown = (e: KeyboardEvent) => {
      if (!walking() || (e.target as HTMLElement | null)?.closest?.("input, textarea, select")) return;
      const key = e.key.toLowerCase();
      if (!["w", "a", "s", "d", "q", "e", "arrowup", "arrowdown", "arrowleft", "arrowright", "pageup", "pagedown", "shift"].includes(key)) return;
      e.preventDefault();
      walkKeys.add(key);
      startWalkLoop();
    };
    const walkKeyUp = (e: KeyboardEvent) => walkKeys.delete(e.key.toLowerCase());
    const walkBlur = () => walkKeys.clear();
    /** Turn the head: yaw about the vertical, pitch about the eye's right axis. */
    const lookAround = (dx: number, dy: number) => {
      const offset = controls.target.clone().sub(camera.position);
      const yaw = new THREE.Quaternion().setFromAxisAngle(WORLD_UP, -dx * 0.004);
      offset.applyQuaternion(yaw);
      const right = offset.clone().cross(WORLD_UP).normalize();
      const pitched = offset.clone().applyAxisAngle(right, -dy * 0.004);
      if (Math.abs(pitched.clone().normalize().y) < 0.98) offset.copy(pitched);
      controls.target.copy(camera.position).add(offset);
      camera.lookAt(controls.target);
      markInteraction();
      requestRender();
    };
    const walkWheel = (e: WheelEvent) => {
      if (!walking()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      walkFactor = THREE.MathUtils.clamp(walkFactor * (e.deltaY < 0 ? 1.25 : 0.8), 0.1, 20);
      showWalkSpeed();
    };

    // ---- Rectangle selection ------------------------------------------
    let box: { pointerId: number; x: number; y: number; moved: boolean } | null = null;
    const worldBox = new THREE.Box3();
    const selectInRectangle = (x0: number, y0: number, x1: number, y1: number, append: boolean) => {
      const bounds = container.getBoundingClientRect();
      const rect = rectFrom(x0 - bounds.left, y0 - bounds.top, x1 - bounds.left, y1 - bounds.top);
      const mode = boxMode(x0, x1);
      const ids: string[] = [];
      for (const mesh of pickable()) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        worldBox.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);
        if (boxPicked(worldBox, rect, mode, toScreen, activePlanes))
          ids.push((mesh.userData.element as BimElementData).id);
      }
      current.onSelectMany(ids, append);
    };

    // ---- Pointer events ------------------------------------------------
    const down = new Map<number, { x: number; y: number }>();
    let gesture = false;
    let hoverFrame = 0;
    let lastMove: PointerEvent | null = null;
    let rightDown: { x: number; y: number } | null = null;
    const pointerDown = (e: PointerEvent) => {
      if (e.button === 2) {
        rightDown = { x: e.clientX, y: e.clientY };
        return;
      }
      if (e.button !== 0) return;
      const handle = handleAt(e.clientX, e.clientY);
      if (handle) {
        if (handle.userData.ring !== undefined) {
          const axis = handle.userData.ring as Axis;
          const pivot = clipPivot(clip);
          const normal = new THREE.Vector3().setComponent(axis, 1).applyQuaternion(clipRotation(clip));
          castFrom(e.clientX, e.clientY);
          const from = ringVector(pivot, normal);
          if (!from) return;
          drag = { kind: "ring", axis, pointerId: e.pointerId, start: clip, pivot, normal, from };
        } else {
          const { axis, side } = handle.userData as { axis: Axis; side: Side };
          drag = { kind: "face", axis, side, pointerId: e.pointerId };
        }
        controls.enabled = false;
        renderer.domElement.setPointerCapture(e.pointerId);
        return;
      }
      down.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (down.size > 1) gesture = true;
      if (walking() && down.size === 1) {
        look = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };
        renderer.domElement.setPointerCapture(e.pointerId);
        return;
      }
      // Shift + drag draws a selection rectangle instead of orbiting.
      if (e.shiftKey && e.pointerType === "mouse" && current.activeTool !== "measure") {
        box = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
        renderer.domElement.setPointerCapture(e.pointerId);
        return;
      }
      if (e.pointerType !== "touch" && down.size === 1) {
        flight = null;
        orbitInertia = null;
        orbitVelocity = { vx: 0, vy: 0 };
        const hit = pick(e.clientX, e.clientY, false);
        const pivot = hit ? hit.point.clone() : controls.target.clone();
        // Move the orbit target to the pivot's depth on the line of sight:
        // nothing turns now, and later zooming scales with that distance.
        const aligned = pivotOnViewLine(
          camera.position.toArray(),
          controls.target.toArray(),
          pivot.toArray(),
        );
        if (aligned) controls.target.set(...aligned);
        orbit = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, pivot, moved: false };
        renderer.domElement.setPointerCapture(e.pointerId);
      }
    };
    const pointerMove = (e: PointerEvent) => {
      if (look && e.pointerId === look.pointerId) {
        lookAround(e.clientX - look.x, e.clientY - look.y);
        look.x = e.clientX;
        look.y = e.clientY;
        return;
      }
      if (box && e.pointerId === box.pointerId) {
        const el = boxRef.current;
        if (!el) return;
        if (!box.moved && Math.hypot(e.clientX - box.x, e.clientY - box.y) < CLICK_TOLERANCE_PX) return;
        box.moved = true;
        const bounds = container.getBoundingClientRect();
        const r = rectFrom(box.x - bounds.left, box.y - bounds.top, e.clientX - bounds.left, e.clientY - bounds.top);
        el.hidden = false;
        el.dataset.mode = boxMode(box.x, e.clientX);
        Object.assign(el.style, {
          left: `${r.left}px`,
          top: `${r.top}px`,
          width: `${r.right - r.left}px`,
          height: `${r.bottom - r.top}px`,
        });
        return;
      }
      if (orbit && e.pointerId === orbit.pointerId && !gesture) {
        const dx = e.clientX - orbit.x;
        const dy = e.clientY - orbit.y;
        if (!orbit.moved) {
          if (Math.hypot(dx, dy) <= CLICK_TOLERANCE_PX) return;
          orbit.moved = true;
          pivotMarker.position.copy(orbit.pivot);
          pivotMarker.visible = true;
          hideHover();
        }
        orbit.x = e.clientX;
        orbit.y = e.clientY;
        orbitVelocity.vx = orbitVelocity.vx * 0.3 + dx * 0.7;
        orbitVelocity.vy = orbitVelocity.vy * 0.3 + dy * 0.7;
        rotateAround(orbit.pivot, dx, dy);
        pivotMarker.scale.setScalar(screenScale(orbit.pivot) * 0.006);
        requestRender();
        return;
      }
      if (drag && e.pointerId === drag.pointerId) {
        castFrom(e.clientX, e.clientY);
        const b = current.sceneBounds;
        const margin = span * 0.05;
        const limits: BimBounds = {
          min: [b.min[0] - margin, b.min[1] - margin, b.min[2] - margin],
          max: [b.max[0] + margin, b.max[1] + margin, b.max[2] + margin],
        };
        if (drag.kind === "ring") {
          const to = ringVector(drag.pivot, drag.normal);
          if (!to) return;
          let angle = Math.atan2(drag.from.clone().cross(to).dot(drag.normal), drag.from.dot(to));
          // Steps of 5° like Autodesk; Shift turns freely.
          if (!e.shiftKey) angle = THREE.MathUtils.degToRad(Math.round(THREE.MathUtils.radToDeg(angle) / 5) * 5);
          const turned = new THREE.Quaternion().setFromAxisAngle(drag.normal, angle).multiply(clipRotation(drag.start));
          applyClip(rotateClip(drag.start, turned, limits));
          requestRender();
          return;
        }
        // Faces move along the box's own axes: work in its frame.
        const inverse = clipRotation(clip).invert();
        const anchor = gizmo.handles.find(
          (h) => h.userData.axis === drag!.axis && h.userData.side === (drag as { side: Side }).side,
        )!.position;
        const value = axisDragValue(
          ray.ray.origin.clone().applyQuaternion(inverse).toArray() as Vec3,
          ray.ray.direction.clone().applyQuaternion(inverse).toArray() as Vec3,
          anchor.toArray() as Vec3,
          drag.axis,
        );
        if (value !== null) {
          applyClip(
            moveFace(clip, drag.axis, drag.side, value, localBounds(limits, clipRotation(clip)), span * 0.001),
          );
          requestRender();
        }
        return;
      }
      if (e.pointerType === "touch" || down.size) return;
      lastMove = e;
      if (!hoverFrame)
        hoverFrame = requestAnimationFrame(() => {
          hoverFrame = 0;
          if (!lastMove || disposed || interacting) return;
          if (sectionActive()) {
            const handle = handleAt(lastMove.clientX, lastMove.clientY);
            gizmo.highlight(handle);
            gizmo.update(clip, handleRadius);
            renderer.domElement.style.cursor = handle ? "grab" : "";
            if (handle) return requestRender();
          }
          showHover(lastMove.clientX, lastMove.clientY);
        });
    };
    const pointerCancel = () => {
      endOrbit();
      box = null;
      if (boxRef.current) boxRef.current.hidden = true;
      if (drag) {
        drag = null;
        controls.enabled = true;
        current.onClipPlanesChange(clip);
      }
      down.clear();
      gesture = false;
    };
    const pointerLeave = () => {
      lastMove = null;
      hideHover();
    };
    const pointerUp = (e: PointerEvent) => {
      if (look && e.pointerId === look.pointerId) {
        look = null;
        if (renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId);
      }
      if (box && e.pointerId === box.pointerId) {
        const finished = box;
        box = null;
        if (boxRef.current) boxRef.current.hidden = true;
        if (renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId);
        if (finished.moved) {
          down.delete(e.pointerId);
          selectInRectangle(finished.x, finished.y, e.clientX, e.clientY, e.ctrlKey || e.metaKey);
          return;
        }
        // A shift-click without a drag keeps its usual meaning (add/remove).
      }
      if (drag && e.pointerId === drag.pointerId) {
        drag = null;
        controls.enabled = true;
        renderer.domElement.releasePointerCapture(e.pointerId);
        current.onClipPlanesChange(clip);
        return;
      }
      const draggedOrbit = orbit?.pointerId === e.pointerId && orbit.moved;
      if (orbit && e.pointerId === orbit.pointerId) endOrbit();
      const start = down.get(e.pointerId);
      down.delete(e.pointerId);
      const multi = gesture;
      if (!down.size) gesture = false;
      if (
        !start ||
        draggedOrbit ||
        multi ||
        e.button !== 0 ||
        Math.hypot(e.clientX - start.x, e.clientY - start.y) >
          CLICK_TOLERANCE_PX
      )
        return;
      if (current.activeTool === "measure") {
        if (current.measureMode === "shortest") return pickShortest(e.clientX, e.clientY);
        const result = measureTarget(e.clientX, e.clientY);
        if (result)
          current.onMeasurePoint(measurePoint(result.point, result.kind, result.hit?.object ?? null, result.normal));
        return;
      }
      if (current.activeTool === "section" && current.sectionFacePick) {
        const picked = pick(e.clientX, e.clientY, false);
        if (picked?.hit.face) {
          const normal = picked.hit.face.normal.clone().transformDirection(picked.hit.object.matrixWorld);
          // Point it at the viewer, so the plane removes what is in front.
          if (normal.dot(view().position.clone().sub(picked.point)) < 0) normal.negate();
          const next = faceClip(picked.point, normal, current.sceneBounds);
          applyClip(next);
          current.onClipPlanesChange(next);
          requestRender();
        }
        current.onSectionFacePickDone?.();
        return;
      }
      const result = pick(e.clientX, e.clientY, false);
      const append = e.shiftKey || e.ctrlKey || e.metaKey;
      const element = result?.hit.object.userData.element as BimElementData | undefined;
      if (!element && [...entries.values()].some((entry) => entry.fragments && !entry.hydrated)) {
        // Triangles still arriving: ask Fragments itself what is there.
        void fragmentElementAt(e.clientX, e.clientY).then((found) => {
          if (!disposed) current.onSelectElement(found, append);
        });
        return;
      }
      current.onSelectElement(element ?? null, append);
    };
    const fragmentElementAt = async (clientX: number, clientY: number) => {
      const hit = await fragmentsEngine.raycast(view(), new THREE.Vector2(clientX, clientY), renderer.domElement);
      if (!hit) return null;
      const entry = entries.get(hit.key);
      return entry?.source.model.elements.find((element) => localIdOf(element.id) === hit.localId) ?? null;
    };

    const elementAt = (clientX: number, clientY: number) =>
      (pick(clientX, clientY, false)?.hit.object.userData.element as
        | BimElementData
        | undefined) ?? null;
    const contextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const start = rightDown;
      rightDown = null;
      // A right-drag pans; only a still right-click opens the menu.
      if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > CLICK_TOLERANCE_PX) return;
      const rect = container.getBoundingClientRect();
      current.onContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        element: elementAt(e.clientX, e.clientY),
      });
    };
    const doubleClick = (e: MouseEvent) => {
      if (current.activeTool === "measure" || handleAt(e.clientX, e.clientY)) return;
      current.onDoubleClick(elementAt(e.clientX, e.clientY));
    };

    // ---- Commands --------------------------------------------------------
    let lastView = -1;
    let framed = false;
    let lastSnapshot = current.snapshotRevision;
    let lastRedline = current.redlineRevision ?? 0;
    let lastPlan = current.planRequest?.revision ?? 0;
    /**
     * A 2D sheet cut from the model. A floor plan cuts every shown element at
     * the cut height (heavy lines) and just below its floor (thin lines: slab
     * edges and what stands on it). A section cuts along a vertical plane
     * (heavy) and 1.5 m beyond it (thin, for depth). "clip" uses the section
     * plane active in 3D: horizontal gives a plan, vertical a section.
     * Element meshes are the hydrated triangles, so converted models give a
     * complete sheet once their geometry has arrived.
     */
    const generatePlan = (request: SheetRequest): PlanDrawing => {
      federation.updateMatrixWorld(true);
      let kind: "plan" | "section" = "plan";
      let main: SheetCut;
      let thin: SheetCut;
      let height = 0;
      let floor = 0;
      const plane = request.kind === "clip" && activePlanes.length === 1 ? activePlanes[0] : null;
      if (request.kind === "plan" || (plane && Math.abs(plane.normal.y) > 0.99)) {
        height = request.kind === "plan" ? request.height : -plane!.constant / plane!.normal.y;
        floor = request.kind === "plan" ? request.floor : height - 1.2;
        main = PLAN_CUT(height);
        thin = PLAN_CUT(floor - 0.05);
      } else {
        kind = "section";
        const point: Vec3 = plane
          ? (plane.normal.clone().multiplyScalar(-plane.constant).toArray() as Vec3)
          : request.kind === "section"
            ? request.point
            : (controls.target.toArray() as Vec3);
        // Looking towards what the plane keeps (the side its normal points to).
        const view: Vec3 = plane ? (plane.normal.toArray() as Vec3) : request.kind === "section" ? request.view : [0, 0, -1];
        main = sectionCut(point, view);
        thin = { ...main, d: main.d + 1.5 };
        height = point[1];
      }
      const threePlane = (cut: SheetCut) => new THREE.Plane(new THREE.Vector3(...cut.normal), -cut.d);
      const mainPlane = threePlane(main), thinPlane = threePlane(thin);
      const elements: PlanElementLines[] = [];
      const box = new THREE.Box3();
      for (const entry of entries.values()) {
        if (!entry.group.visible) continue;
        for (const [id, mesh] of entry.meshes) {
          const geometry = mesh.geometry;
          if (!mesh.visible || mesh.userData.ghost || !geometry.index) continue;
          if (!geometry.boundingBox) geometry.computeBoundingBox();
          box.copy(geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);
          const atMain = mainPlane.intersectsBox(box);
          const atThin = thinPlane.intersectsBox(box);
          if (!atMain && !atThin) continue;
          const positions = geometry.getAttribute("position").array;
          const indices = geometry.index.array;
          const matrix = mesh.matrixWorld.elements;
          const cut = atMain ? cutMeshPlane(positions, indices, matrix, main) : [];
          const below = atThin ? cutMeshPlane(positions, indices, matrix, thin) : [];
          if (cut.length || below.length) elements.push({ id, cut, below });
        }
      }
      // Grid axes belong on plans.
      const grids: PlanDrawing["grids"] = [];
      const gridKeys = new Set<string>();
      const a = new THREE.Vector3(), b = new THREE.Vector3();
      if (kind === "plan")
        for (const entry of entries.values())
          entry.ifcGrids?.traverse((object) => {
            const line = object as THREE.Line;
            const position = line.isLine && line.visible ? line.geometry.getAttribute("position") : null;
            if (!position || position.count < 2) return;
            a.fromBufferAttribute(position, 0).applyMatrix4(line.matrixWorld);
            b.fromBufferAttribute(position, position.count - 1).applyMatrix4(line.matrixWorld);
            const tag = String(line.userData.tag ?? line.parent?.userData.tag ?? "");
            // Each axis once, whatever the number of levels and files repeating it.
            const key = gridKey(tag, [a.x, a.z], [b.x, b.z]);
            if (gridKeys.has(key)) return;
            gridKeys.add(key);
            grids.push({ tag, x1: a.x, y1: a.z, x2: b.x, y2: b.z });
          });
      return { name: request.name, kind, height, floor, elements, grids, bounds: drawingBounds(elements, grids) };
    };
    /**
     * The measurements as they look now, as markup (Navisworks' "convert to
     * redline"): every drawn segment a pen stroke, every label a text, in
     * view-normalised coordinates.
     */
    const measurementRedline = (): MarkupShape[] => {
      const shapes: MarkupShape[] = [];
      const color = "#ef4444";
      const norm = (p: THREE.Vector3): [number, number] | null => {
        const [x, y, onScreen] = toScreen(p);
        return onScreen ? [x / viewport.width, y / viewport.height] : null;
      };
      const a = new THREE.Vector3(), b = new THREE.Vector3();
      for (const child of measurementGroup.children) {
        if (!(child instanceof Line2)) continue;
        const start = child.geometry.getAttribute("instanceStart") as THREE.InterleavedBufferAttribute;
        const end = child.geometry.getAttribute("instanceEnd") as THREE.InterleavedBufferAttribute;
        for (let i = 0; i < start.count; i++) {
          const from = norm(a.fromBufferAttribute(start, i));
          const to = norm(b.fromBufferAttribute(end, i));
          if (from && to) shapes.push({ id: `rl-${shapes.length}`, kind: "pen", color, width: 2, points: [from, to] });
        }
      }
      const box = container.getBoundingClientRect();
      for (const node of Array.from(labels.children) as HTMLElement[]) {
        if (node.style.visibility === "hidden") continue;
        const r = node.getBoundingClientRect();
        shapes.push({
          id: `rl-${shapes.length}`,
          kind: "text",
          color,
          width: 2,
          points: [[(r.left - box.left) / box.width, (r.top - box.top) / box.height]],
          text: node.textContent ?? "",
        });
      }
      return shapes;
    };
    let lastSectionFit = current.sectionFitRequest.revision;
    let lastClash: BimCanvasProps["activeClashPoint"] = null;
    const worldBoxOf = (meshes: Iterable<THREE.Mesh>) => {
      const box = new THREE.Box3();
      for (const mesh of meshes)
        if (mesh.visible && mesh.parent?.visible !== false)
          box.union(
            mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld),
          );
      return box;
    };
    const runCommands = (next: BimCanvasProps) => {
      if (lastView !== next.viewRequest.revision) {
        const target = next.viewRequest.modelKey
          ? entries.get(next.viewRequest.modelKey)
          : undefined;
        if (!target || target.ready) {
          const selection = next.viewRequest.elementIds?.length
            ? [...entries.values()].flatMap((entry) =>
                next.viewRequest.elementIds!.flatMap((id) => {
                  const mesh = entry.meshes.get(id);
                  return mesh ? [mesh] : [];
                }),
              )
            : [];
          const visible = worldBoxOf(
            selection.length
              ? selection
              : target
                ? target.meshes.values()
                : [...entries.values()].flatMap((e) => [...e.meshes.values()]),
          );
          const fallback = new THREE.Box3(
            new THREE.Vector3(...next.sceneBounds.min),
            new THREE.Vector3(...next.sceneBounds.max),
          );
          // During hydration the mesh subset does not represent the scene extent.
          const incomplete = [...entries.values()].some((entry) => !entry.hydrated);
          const box = visible.isEmpty() || (incomplete && !selection.length && !target) ? fallback : visible;
          const radius = Math.max(0.01, box.getSize(new THREE.Vector3()).length() / 2);
          const viewOffset = camera.position.clone().sub(controls.target);
          const direction: [number, number, number] =
            next.viewRequest.keepDirection && viewOffset.lengthSq() > 1e-12
              ? (viewOffset.normalize().toArray() as [number, number, number])
              : (PRESET_DIRECTIONS[next.viewRequest.preset] ?? PRESET_DIRECTIONS.perspective);
          let pose = framePose(box, direction, camera.fov, camera.aspect);
          if (next.viewRequest.camera) {
            const saved = next.viewRequest.camera;
            camera.fov = saved.fov;
            camera.updateProjectionMatrix();
            const offset = new THREE.Vector3(...saved.position).sub(new THREE.Vector3(...saved.target));
            // Views saved from the old plan preset looked straight down.
            if (Math.abs(offset.clone().normalize().y) > 0.9999) offset.z += offset.length() * 1e-4;
            pose = {
              position: new THREE.Vector3(...saved.target).add(offset).toArray(),
              target: saved.target,
            };
          }
          // The first framing of a loaded model jumps; everything after flies.
          flyTo(pose, radius, framed ? FLIGHT_MS : 0);
          if (!visible.isEmpty()) framed = true;
          lastView = next.viewRequest.revision;
        }
      }
      if (next.activeClashPoint && next.activeClashPoint !== lastClash) {
        const point = new THREE.Vector3(...next.activeClashPoint);
        flyTo(
          {
            position: point.clone().add(new THREE.Vector3(span * 0.15, span * 0.1, span * 0.15)).toArray(),
            target: point.toArray(),
          },
          span * 0.1,
        );
      }
      lastClash = next.activeClashPoint;
      if (lastSectionFit !== next.sectionFitRequest.revision) {
        lastSectionFit = next.sectionFitRequest.revision;
        let box: THREE.Box3;
        if (next.sectionFitRequest.target === "ids" && next.sectionFitRequest.ids?.length) {
          const wanted = new Set(next.sectionFitRequest.ids);
          const meshes = [...entries.values()].flatMap((e) => [...e.meshes.values()].filter((m) => wanted.has(m.userData.id as string)));
          box = worldBoxOf(meshes);
        } else if (
          next.sectionFitRequest.target === "selection" &&
          next.selectedElementId
        ) {
          const mesh = [...entries.values()]
            .map((e) => e.meshes.get(next.selectedElementId!))
            .find(Boolean);
          box = mesh ? worldBoxOf([mesh]) : new THREE.Box3();
        } else
          box = new THREE.Box3(
            new THREE.Vector3(...next.sceneBounds.min),
            new THREE.Vector3(...next.sceneBounds.max),
          );
        if (!box.isEmpty()) {
          const pad = Math.max(
            0.1,
            box.getSize(new THREE.Vector3()).length() * 0.05,
          );
          box.expandByScalar(pad);
          next.onClipPlanesChange(clipFromBox(box));
        }
      }
      if (next.planRequest && lastPlan !== next.planRequest.revision) {
        lastPlan = next.planRequest.revision;
        next.onPlan?.(generatePlan(next.planRequest));
      }
      if (lastRedline !== (next.redlineRevision ?? 0)) {
        lastRedline = next.redlineRevision ?? 0;
        next.onRedline?.(measurementRedline());
      }
      if (lastSnapshot !== next.snapshotRevision) {
        lastSnapshot = next.snapshotRevision;
        const gizmoVisible = gizmo.root.visible;
        const hoverVisible = hoverGroup.visible;
        const pivotVisible = pivotMarker.visible;
        try {
          gizmo.root.visible = false;
          hoverGroup.visible = false;
          pivotMarker.visible = false;
          pipeline.sync(controls.target, span);
          pipeline.render(false, activePlanes, span);
          next.onSnapshot(compositeLabels(renderer.domElement).toDataURL("image/png"));
        } catch {
          next.onSnapshot(null);
        } finally {
          gizmo.root.visible = gizmoVisible;
          hoverGroup.visible = hoverVisible;
          pivotMarker.visible = pivotVisible;
        }
      }
    };

    // ---- Minimap -------------------------------------------------------------
    // An overall plan drawn from above once (again when the model or its
    // visibility changes), with the camera drawn over it every frame. It
    // renders the element meshes (layer 1), not Fragments' tiles, which are
    // culled to what the main camera sees.
    const MINIMAP_PX = 176;
    const MINIMAP_TEXELS = 256;
    const minimapCanvas = document.createElement("canvas");
    minimapCanvas.width = minimapCanvas.height = MINIMAP_PX * Math.min(2, window.devicePixelRatio || 1);
    minimapCanvas.style.cssText = `position:absolute;left:8px;bottom:40px;width:${MINIMAP_PX}px;height:${MINIMAP_PX}px;z-index:20;border-radius:10px;border:1px solid rgba(255,255,255,.2);box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:crosshair;display:none`;
    minimapCanvas.setAttribute("aria-label", "Minimap");
    container.appendChild(minimapCanvas);
    const minimapImage = document.createElement("canvas");
    minimapImage.width = minimapImage.height = MINIMAP_TEXELS;
    const minimapTarget = new THREE.WebGLRenderTarget(MINIMAP_TEXELS, MINIMAP_TEXELS);
    const minimapCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    minimapCamera.layers.set(1);
    // North (scene -z) up on the map.
    minimapCamera.up.set(0, 0, -1);
    const minimapMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: { minY: { value: 0 }, maxY: { value: 1 } },
      vertexShader: /* glsl */ `
        varying float vY;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vY = world.y;
          gl_Position = projectionMatrix * viewMatrix * world;
        }`,
      // Higher is lighter: roofs and slabs read as in a plan.
      fragmentShader: /* glsl */ `
        uniform float minY;
        uniform float maxY;
        varying float vY;
        void main() {
          float t = clamp((vY - minY) / max(maxY - minY, 1e-3), 0.0, 1.0);
          gl_FragColor = vec4(mix(vec3(0.30, 0.36, 0.45), vec3(0.93, 0.95, 0.98), t), 1.0);
        }`,
    });
    /** World x/z of the map's square: the scene box with a margin. */
    const minimapArea = { x: 0, z: 0, half: 1 };
    let minimapDirty = true;
    let minimapRenderedAt = 0;
    const renderMinimapImage = () => {
      minimapDirty = false;
      minimapRenderedAt = performance.now();
      const size = sceneBox.getSize(new THREE.Vector3());
      minimapArea.x = (sceneBox.min.x + sceneBox.max.x) / 2;
      minimapArea.z = (sceneBox.min.z + sceneBox.max.z) / 2;
      minimapArea.half = Math.max(size.x, size.z, 1) * 0.55;
      const h = minimapArea.half;
      Object.assign(minimapCamera, { left: -h, right: h, top: h, bottom: -h, near: 0.1, far: size.y + 200 });
      minimapCamera.position.set(minimapArea.x, sceneBox.max.y + 100, minimapArea.z);
      minimapCamera.lookAt(minimapArea.x, sceneBox.min.y, minimapArea.z);
      minimapCamera.updateProjectionMatrix();
      minimapMaterial.uniforms.minY.value = sceneBox.min.y;
      minimapMaterial.uniforms.maxY.value = sceneBox.max.y;
      const background = scene.background;
      const clearColor = renderer.getClearColor(new THREE.Color());
      const clearAlpha = renderer.getClearAlpha();
      scene.background = null;
      scene.overrideMaterial = minimapMaterial;
      renderer.setRenderTarget(minimapTarget);
      renderer.setClearColor(0x0f172a, 1);
      renderer.clear();
      // Tool meshes are detached during normal rendering. The minimap is the
      // one pass that needs them all, independently of Fragments' camera LOD.
      const pickingRoots = [...entries.values()].map((entry) => entry.picking);
      scene.add(...pickingRoots);
      try { renderer.render(scene, minimapCamera); }
      finally { for (const root of pickingRoots) root.removeFromParent(); }
      const pixels = new Uint8Array(MINIMAP_TEXELS * MINIMAP_TEXELS * 4);
      renderer.readRenderTargetPixels(minimapTarget, 0, 0, MINIMAP_TEXELS, MINIMAP_TEXELS, pixels);
      renderer.setRenderTarget(null);
      renderer.setClearColor(clearColor, clearAlpha);
      scene.overrideMaterial = null;
      scene.background = background;
      // WebGL rows run bottom-up.
      const image = new ImageData(MINIMAP_TEXELS, MINIMAP_TEXELS);
      const row = MINIMAP_TEXELS * 4;
      for (let y = 0; y < MINIMAP_TEXELS; y++)
        image.data.set(pixels.subarray((MINIMAP_TEXELS - 1 - y) * row, (MINIMAP_TEXELS - y) * row), y * row);
      minimapImage.getContext("2d")!.putImageData(image, 0, 0);
    };
    const toMinimap = (x: number, z: number): [number, number] => [
      ((x - minimapArea.x) / (2 * minimapArea.half) + 0.5) * minimapCanvas.width,
      ((z - minimapArea.z) / (2 * minimapArea.half) + 0.5) * minimapCanvas.height,
    ];
    const drawMinimap = () => {
      const show = current.display.minimap ?? false;
      minimapCanvas.style.display = show ? "block" : "none";
      if (!show) return;
      if (minimapDirty && !interacting && performance.now() - minimapRenderedAt > 800) renderMinimapImage();
      const ctx = minimapCanvas.getContext("2d")!;
      const w = minimapCanvas.width;
      ctx.drawImage(minimapImage, 0, 0, w, w);
      // The camera: a dot where it stands, a wedge along where it looks.
      // A camera outside the map stays on its edge, still pointing the right way.
      const edge = w * 0.04;
      const [cx, cy] = toMinimap(camera.position.x, camera.position.z).map((v) => Math.min(w - edge, Math.max(edge, v)));
      const forward = camera.getWorldDirection(new THREE.Vector3());
      const angle = Math.atan2(forward.z, forward.x);
      const r = w * 0.09;
      ctx.fillStyle = "rgba(45,212,191,0.35)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle - 0.45, angle + 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2dd4bf";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const [tx, ty] = toMinimap(controls.target.x, controls.target.z);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(tx - 2, ty - 2, 4, 4);
    };
    // Click: move there, keeping height and the direction of view.
    minimapCanvas.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      const rect = minimapCanvas.getBoundingClientRect();
      const x = minimapArea.x + ((e.clientX - rect.left) / rect.width - 0.5) * 2 * minimapArea.half;
      const z = minimapArea.z + ((e.clientY - rect.top) / rect.height - 0.5) * 2 * minimapArea.half;
      const shift = new THREE.Vector3(x - controls.target.x, 0, z - controls.target.z);
      flyTo(
        {
          position: camera.position.clone().add(shift).toArray(),
          target: controls.target.clone().add(shift).toArray(),
        },
        span / 2,
      );
    });

    // ---- Column grids (IfcGrid) ---------------------------------------------
    /** Loads each converted model's grids once, the first time they are shown. */
    const applyIfcGrids = (show: boolean) => {
      for (const entry of entries.values()) {
        if (entry.ifcGrids) entry.ifcGrids.visible = show;
        if (!show || entry.gridsRequested || !entry.fragments) continue;
        entry.gridsRequested = true;
        void fragmentsEngine.grids(entry.source.key).then((grids) => {
          if (!grids || disposed || entries.get(entry.source.key) !== entry) return;
          entry.ifcGrids = addGridBubbles(grids);
          entry.ifcGrids.visible = current.display.ifcGrids ?? true;
          entry.group.add(entry.ifcGrids);
          // Grids lie on the model's base, where a plan reader expects them.
          const base = entry.source.model.bounds?.min[1];
          if (base !== undefined) {
            entry.group.updateMatrixWorld(true);
            const lines = new THREE.Box3().setFromObject(entry.ifcGrids);
            const floor = entry.group.localToWorld(new THREE.Vector3(0, base, 0)).y;
            if (Number.isFinite(lines.min.y)) entry.ifcGrids.position.y += floor - lines.min.y;
          }
          // One copy of each axis across levels and files.
          showOneCopyPerAxis([...entries.values()].flatMap((e) => (e.ifcGrids ? [e.ifcGrids] : [])));
          requestRender();
        });
      }
    };

    // ---- Update from props -----------------------------------------------
    let initialized = false;
    const update = (next: BimCanvasProps) => {
      current = next;
      if (!initialized) return;
      if (next.display !== pipeline.settings) {
        const changed = JSON.stringify(next.display) !== JSON.stringify(pipeline.settings);
        if (changed) {
          pipeline.apply(next.display);
          applyLighting(next.display.environment);
        }
      }
      if (grid) grid.visible = next.display.grid;
      applySceneBounds(next.sceneBounds);
      reconcileModels(next.models);
      applyIfcGrids(next.display.ifcGrids ?? true);
      if (!drag && next.clipPlanes !== clip) applyClip(next.clipPlanes);
      gizmo.root.visible = next.activeTool === "section" && clip.enabled;
      gizmo.update(clip, handleRadius);
      controls.enabled = next.activeTool !== "walk" && !drag;
      if (next.activeTool !== "walk") walkKeys.clear();
      else {
        showWalkSpeed();
        if (!wasWalking && initialized) enterWalk();
      }
      wasWalking = next.activeTool === "walk";
      applyMeshState(next);
      renderMeasurements(next);
      if (next.activeTool !== "measure") {
        hoverGroup.visible = false;
        tooltip.hidden = true;
      }
      runCommands(next);
      requestRender();
    };

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      viewport.width = width;
      viewport.height = height;
      for (const m of lineMaterials) m.resolution.set(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      pipeline?.setSize(width, height, quality);
      requestRender();
    };
    const visibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else requestRender();
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setError(true);
    };

    const initialize = () => {
      if (disposed) return;
      setError(false);
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        // Needed by section caps (three defaults to no stencil since r163).
        stencil: true,
      });
      renderer.setPixelRatio(maxPixelRatio);
      renderer.localClippingEnabled = true;
      // Khronos PBR Neutral keeps material colours true while handling highlights.
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.info.autoReset = false;
      container.appendChild(renderer.domElement);
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      pipeline = new ViewerPipeline(renderer, scene, camera, (object) => {
        // Normals/depth only for solid model surfaces: no helpers, lines,
        // ghosts or glass (they would draw false edges and AO halos).
        if (object === grid || object === gizmo.root || object === hoverGroup || object === measurementGroup || object === pivotMarker) return true;
        if ((object as THREE.Line).isLine || (object as THREE.Points).isPoints) return true;
        const material = (object as THREE.Mesh).material;
        if (!material) return false;
        // Fragments' distant-detail stand-ins are drawn as lines.
        return (Array.isArray(material) ? material : [material]).some(
          (m) => m.transparent || (m as THREE.MeshBasicMaterial).wireframe || (m as { isLodMaterial?: boolean }).isLodMaterial,
        );
      });
      pipeline.apply(current.display);
      applyLighting(current.display.environment);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.045;
      // Left button orbits about the picked point (see rotateAround); middle
      // and right drag pan; the wheel zooms towards the cursor.
      controls.mouseButtons = {
        LEFT: -1 as THREE.MOUSE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.PAN,
      };
      controls.zoomToCursor = true;
      controls.addEventListener("change", () => {
        markInteraction();
        requestRender();
      });
      controls.addEventListener("start", () => {
        flight = null;
        requestRender();
      });
      controls.addEventListener("end", () => {
        requestRender();
      });
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(container);
      const canvas = renderer.domElement;
      canvas.addEventListener("pointerdown", pointerDown);
      canvas.addEventListener("pointermove", pointerMove);
      canvas.addEventListener("pointerup", pointerUp);
      canvas.addEventListener("pointercancel", pointerCancel);
      canvas.addEventListener("pointerleave", pointerLeave);
      canvas.addEventListener("contextmenu", contextMenu);
      canvas.addEventListener("dblclick", doubleClick);
      // Capture phase, so the speed change wins over OrbitControls' zoom.
      canvas.addEventListener("wheel", walkWheel, { capture: true, passive: false });
      window.addEventListener("keydown", walkKeyDown);
      window.addEventListener("keyup", walkKeyUp);
      window.addEventListener("blur", walkBlur);
      document.addEventListener("visibilitychange", visibility);
      initialized = true;
      applyClip(current.clipPlanes);
      hideHover();
      update(current);
    };
    engineRef.current = {
      update,
      flyToDirection: (direction) => {
        if (!initialized) return;
        const meshes = [...entries.values()].flatMap((e) => [...e.meshes.values()]);
        let box = worldBoxOf(meshes.filter((m) => !m.userData.ghost));
        if (box.isEmpty())
          box = new THREE.Box3(
            new THREE.Vector3(...current.sceneBounds.min),
            new THREE.Vector3(...current.sceneBounds.max),
          );
        const radius = Math.max(0.01, box.getSize(new THREE.Vector3()).length() / 2);
        flyTo(framePose(box, direction, camera.fov, camera.aspect), radius);
      },
      // Arrow buttons keep the orbit centre and distance; only the side changes.
      turn: (turn) => {
        if (!initialized) return;
        const offset = camera.position.clone().sub(controls.target);
        const distance = offset.length();
        const next = new THREE.Vector3(...safeViewDirection(turnDirection(offset.normalize().toArray() as Vec3, turn)));
        flyTo(
          {
            position: controls.target.clone().addScaledVector(next, distance).toArray(),
            target: controls.target.toArray(),
          },
          span / 2,
        );
      },
      walkPress: (key, pressed) => {
        if (pressed) {
          walkKeys.add(key);
          startWalkLoop();
        } else walkKeys.delete(key);
      },
      walkNudge: startWalkLoop,
    };
    void Promise.resolve()
      .then(initialize)
      .catch(() => {
        if (!disposed) setError(true);
      });

    return () => {
      disposed = true;
      void fragmentsEngine.dispose();
      minimapTarget.dispose();
      minimapMaterial.dispose();
      minimapCanvas.remove();
      engineRef.current = null;
      perf?.box.remove();
      if (frame) cancelAnimationFrame(frame);
      if (hoverFrame) cancelAnimationFrame(hoverFrame);
      if (walkFrame) cancelAnimationFrame(walkFrame);
      window.removeEventListener("keydown", walkKeyDown);
      window.removeEventListener("keyup", walkKeyUp);
      window.removeEventListener("blur", walkBlur);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      controls?.dispose();
      if (renderer) {
        const canvas = renderer.domElement;
        canvas.removeEventListener("pointerdown", pointerDown);
        canvas.removeEventListener("pointermove", pointerMove);
        canvas.removeEventListener("pointerup", pointerUp);
        canvas.removeEventListener("pointercancel", pointerCancel);
        canvas.removeEventListener("pointerleave", pointerLeave);
        canvas.removeEventListener("contextmenu", contextMenu);
        canvas.removeEventListener("dblclick", doubleClick);
        canvas.removeEventListener("wheel", walkWheel, { capture: true });
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.remove();
      }
      for (const entry of entries.values()) removeEntry(entry);
      entries.clear();
      gizmo.dispose();
      ghost.dispose();
      ghostBatch.dispose();
      overrideMaterials.forEach((m) => m.dispose());
      batchMaterials.forEach((m) => m.dispose());
      disposeObject(scene);
      materials.forEach((m) => m.dispose());
      highlights.forEach((m) => m.dispose());
      primitiveGeometries.forEach((g) => g.dispose());
      labels.replaceChildren();
      window.clearTimeout(settle);
      window.clearTimeout(statsTimer);
      pipeline?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      setBuilding(0);
    };
  }, [retry]);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={containerRef}
        className={`absolute inset-0 touch-none ${props.activeTool === "measure" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
        aria-label={ui(locale).bimCanvas.t3DModelDragToOrbit}
      />
      <BimViewCube
        ref={cubeRef}
        shifted={props.rightPanelOpen}
        onPick={(direction) => engineRef.current?.flyToDirection(direction)}
        onTurn={(turn) => engineRef.current?.turn(turn)}
        onHome={props.onHome}
      />
      <div
        ref={labelsRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
      />
      {props.activeTool === "walk" && (
        <div
          role="status"
          className="pointer-events-none absolute bottom-14 left-1/2 z-20 max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-xl bg-slate-950/85 px-4 py-2 text-center text-xs text-slate-100 shadow-lg"
        >
          <p className="font-semibold text-teal-300">
            {ui(locale).bimWalk.title} · {ui(locale).bimWalk.speed} <span ref={walkSpeedRef} className="font-mono" />
          </p>
          <p className="mt-0.5">{walkGravity ? ui(locale).bimWalk.help : ui(locale).bimWalk.helpFly}</p>
          <div className="pointer-events-auto mt-1.5 flex justify-center gap-1.5">
            {([
              ["gravity", walkGravity, setWalkGravity],
              ["collision", walkCollision, setWalkCollision],
            ] as const).map(([key, on, set]) => (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => set(!on)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${on ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
              >
                {ui(locale).bimWalk[key]}
              </button>
            ))}
          </div>
        </div>
      )}
      {props.activeTool === "walk" && (
        // On touch screens: hold an arrow to walk, drag the view to look.
        <div className="absolute bottom-36 left-3 z-20 hidden grid-cols-3 gap-1 [@media(pointer:coarse)]:grid">
          {([
            ["arrowup", "▲", "col-start-2"],
            ["arrowleft", "◀", "col-start-1 row-start-2"],
            ["arrowdown", "▼", "col-start-2 row-start-2"],
            ["arrowright", "▶", "col-start-3 row-start-2"],
          ] as const).map(([key, glyph, place]) => (
            <button
              key={key}
              type="button"
              aria-label={ui(locale).bimWalk.keys[key]}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                engineRef.current?.walkPress(key, true);
              }}
              onPointerUp={() => engineRef.current?.walkPress(key, false)}
              onPointerCancel={() => engineRef.current?.walkPress(key, false)}
              className={`${place} grid h-11 w-11 touch-none select-none place-items-center rounded-lg bg-slate-950/75 text-slate-100 active:bg-teal-500 active:text-slate-950`}
            >
              {glyph}
            </button>
          ))}
        </div>
      )}
      <div
        ref={boxRef}
        hidden
        aria-hidden="true"
        // Window (left→right): solid blue. Crossing (right→left): dashed green.
        className="pointer-events-none absolute z-20 border-2 border-blue-500 bg-blue-500/10 data-[mode=crossing]:border-dashed data-[mode=crossing]:border-emerald-500 data-[mode=crossing]:bg-emerald-500/10"
      />
      <div
        ref={tooltipRef}
        hidden
        className="pointer-events-none absolute left-0 top-0 z-20 rounded-md border border-white/20 bg-slate-950 px-2 py-1 font-mono text-xs font-semibold text-white shadow-lg"
        aria-hidden="true"
      />
      <div
        ref={readoutRef}
        role="status"
        aria-live="off"
        className="pointer-events-none absolute bottom-2 left-1/2 z-20 max-w-[calc(100%-1rem)] -translate-x-1/2 whitespace-pre rounded-lg border border-white/20 bg-slate-950 px-3 py-2 font-mono text-[13px] font-semibold leading-5 text-white shadow-lg data-[empty=true]:font-sans data-[empty=true]:text-xs data-[empty=true]:font-normal data-[empty=true]:text-slate-200"
      />
      {building > 0 && !error && (
        <div
          role="status"
          className="pointer-events-none absolute right-3 top-3 z-20 rounded-lg bg-slate-950/85 px-3 py-2 text-xs"
        >
          {ui(locale).bimCanvas.buildingModel}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950 p-5 text-center"
        >
          <p>{ui(locale).bimCanvas.t3DRenderingIsUnavailableRetry}</p>
          <button
            type="button"
            onClick={() => setRetry((n) => n + 1)}
            className="rounded-lg border px-4 py-2"
          >
            {ui(locale).bimCanvas.retry}
          </button>
        </div>
      )}
    </div>
  );
}
