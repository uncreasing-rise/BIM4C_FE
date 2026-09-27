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
import { buildFeatureEdges, edgeKey, snapPoint } from "./snapping";
import { triangleMetrics } from "./measurement-math";
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
  MeasureMode,
  MeasurePoint,
  Measurement,
  ModelPlacement,
  SnapKind,
  SnapSettings,
} from "./types";

import { ui } from "@/lib/i18n/ui";
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
}

const SNAP_COLORS: Record<SnapKind, number> = {
  vertex: 0xf59e0b,
  midpoint: 0xa855f7,
  edge: 0x06b6d4,
  face: 0x14b8a6,
};
const SNAP_TOLERANCE_PX = 12;
const NO_PLANES: THREE.Plane[] = [];
const CLICK_TOLERANCE_PX = 6;
const FLIGHT_MS = 480;

interface ModelEntry {
  source: CanvasModel;
  group: THREE.Group;
  markers: THREE.Group;
  /** Per-element meshes: always used for picking, drawn only when isolated. */
  meshes: Map<string, THREE.Mesh>;
  /** What the GPU draws; null until built (the meshes draw meanwhile). */
  batches: ElementBatches | null;
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
      ambient.intensity = classic ? 0.48 : 0;
      hemisphere.color.set(classic ? 0xffffff : 0xf8fafc);
      hemisphere.groundColor.set(classic ? 0x64748b : 0x7c8594);
      hemisphere.intensity = classic ? 0.28 : 0.55;
      sun.intensity = classic ? 0.82 : 1.35;
      if (renderer) renderer.toneMapping = classic ? THREE.NoToneMapping : THREE.NeutralToneMapping;
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
        for (const m of [...materials.values(), ...highlights.values(), ...batchMaterials.values(), ...overrideMaterials.values(), ghost, ghostBatch]) {
          m.clippingPlanes = activePlanes;
          m.needsUpdate = true;
        }
      }
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
    function positionLabels() {
      for (const node of Array.from(labels!.children) as HTMLElement[]) {
        const [x, y, z] = (node.dataset.anchor ?? "0,0,0")
          .split(",")
          .map(Number);
        const [sx, sy, onScreen] = toScreen(new THREE.Vector3(x, y, z));
        node.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -130%)`;
        node.style.visibility = onScreen ? "visible" : "hidden";
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
      camera.near = Math.min(camera.near, range.near);
      camera.far = Math.max(camera.far, range.far, span * 20);
      camera.updateProjectionMatrix();
      controls.maxDistance = camera.far * 0.4;
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (!duration || reduced) {
        flight = null;
        applyPose(to);
        camera.near = range.near;
        camera.updateProjectionMatrix();
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
    let quality = maxPixelRatio;
    const setQuality = (ratio: number) => {
      if (ratio === quality) return;
      quality = ratio;
      renderer.setPixelRatio(ratio);
      pipeline?.setSize(container.clientWidth, container.clientHeight, ratio);
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

    function render() {
      frame = 0;
      if (disposed || renderer.getContext().isContextLost()) return;
      const started = performance.now();
      stepFlight();
      if (controls.update()) requestRender();
      if (cubeRef.current) {
        cubeRef.current.style.transform = cubeCssMatrix(camera.quaternion);
        // Plan views cannot turn left/right with a fixed up axis; hide those arrows.
        const widget = cubeRef.current.closest<HTMLElement>("[data-viewcube]");
        const vertical = Math.abs(camera.getWorldDirection(new THREE.Vector3()).y) > 0.98;
        if (widget && widget.dataset.vertical !== String(vertical)) widget.dataset.vertical = String(vertical);
      }
      if (gizmo.root.visible) gizmo.update(clip, handleRadius);
      pipeline.sync(controls.target, span);
      sizeScreenMarkers();
      renderer.info.reset();
      pipeline.render(interacting, activePlanes, span);
      // Read by performance checks (draw calls for the last frame, all passes).
      renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
      reportPerf(performance.now() - started);
      current.onCameraChange({ position: camera.position.toArray(), target: controls.target.toArray(), up: camera.up.toArray(), fov: camera.fov });
      positionLabels();
    }

    // ---- Coordinates ---------------------------------------------------
    const fmt = (n: number) => formatLength(n, localeRef.current);
    const coordinateText = (p: Vec3) => {
      const [x, y, z] = sceneToWorld(p, current.sceneOrigin);
      let text = `X ${fmt(x)}   Y ${fmt(y)}   Z ${fmt(z)}`;
      if (current.mapConversion) {
        const [e, n, h] = worldToMap([x, y, z], current.mapConversion);
        text += `\nE ${fmt(e)}   N ${fmt(n)}   H ${fmt(h)}`;
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
      camera.far = Math.max(camera.far, span * 20);
      camera.updateProjectionMatrix();
      measurementsKey = null; // marker sizes depend on span
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
    const isPickable = (mesh: THREE.Mesh) =>
      mesh.visible && !mesh.userData.ghost && (mesh.parent?.visible ?? true);
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
    const removeEntry = (entry: ModelEntry) => {
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
      entry.meshes.clear();
      entry.group.clear();
    };
    const buildEntry = async (entry: ModelEntry) => {
      setBuilding((n) => n + 1);
      try {
        const slice = timeSlicer();
        for (const element of entry.source.model.elements) {
          if (disposed || !entries.has(entry.source.key)) return;
          const mesh = createElementMesh(
            element,
            materials,
            primitiveGeometries,
          );
          const list = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const m of list) m.clippingPlanes = activePlanes;
          entry.group.add(mesh);
          entry.meshes.set(element.id, mesh);
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
        for (const clash of entry.source.model.clashes) {
          const marker = screenDot(0xef4444, 6);
          screenMarkers.add(marker);
          marker.position.set(...clash.point);
          entry.markers.add(marker);
        }
        entry.ready = true;
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
    const reconcileModels = (models: CanvasModel[]) => {
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
          entry = { source, group, markers, meshes: new Map(), batches: null, ready: false };
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
    const applyMeshState = (next: BimCanvasProps) => {
      const isolated = next.isolatedElementIds;
      const key = `${next.explodeFactor}|${JSON.stringify(next.visibleLayers)}|${[...next.selectedElementIds].join(",")}|${[...next.hiddenElementIds].join(",")}|${isolated ? [...isolated].join(",") : "-"}|${lastBoundsKey}`;
      if (key === meshStateKey && next.colorOverrides === lastOverrides) return;
      if (next.explodeFactor !== lastExplode) {
        lastExplode = next.explodeFactor;
        indexDirty = true;
      }
      meshStateKey = key;
      lastOverrides = next.colorOverrides;
      const offset = new THREE.Vector3();
      for (const entry of entries.values()) {
        if (!entry.ready) continue;
        const batched = entry.batches;
        // Explode about the federation centre, expressed in the model frame.
        const localCenter = entry.group.worldToLocal(center.clone());
        for (const [id, mesh] of entry.meshes) {
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
          const promoted = Boolean(isolated && (isolated.has(id) || selected));
          const ghosted = Boolean(isolated) && !promoted;
          mesh.userData.ghost = ghosted;
          mesh.layers.mask = promoted || !batched ? DRAWN_AND_PICKABLE : PICK_ONLY;
          const overrideHex = next.colorOverrides?.get(id);
          const original = (overrideHex
            ? Array.isArray(mesh.userData.baseMaterial)
              ? (mesh.userData.baseMaterial as THREE.Material[]).map(() => overrideMaterial(overrideHex))
              : overrideMaterial(overrideHex)
            : mesh.userData.baseMaterial) as THREE.Material | THREE.Material[];
          mesh.material = ghosted && !batched
            ? Array.isArray(original)
              ? original.map(() => ghost)
              : ghost
            : selected
              ? Array.isArray(original)
                ? original.map(highlight)
                : highlight(original)
              : original;
          if (batched)
            applySlotState(
              batched.slots.get(id),
              visible && !promoted,
              selected,
              offset.subVectors(mesh.position, new THREE.Vector3(...element.position)),
              overrideHex
                ? (overrideColors.get(overrideHex) ??
                    overrideColors.set(overrideHex, new THREE.Color(overrideHex)).get(overrideHex))
                : undefined,
            );
        }
        if (batched)
          for (const batch of batched.batches.values()) {
            batch.material = isolated ? ghostBatch : (batch.userData.solid as THREE.Material);
            // Explode moves instances; keep whole-batch culling bounds honest.
            batch.computeBoundingBox();
            batch.computeBoundingSphere();
          }
        entry.markers.visible =
          next.visibleLayers.clash && next.explodeFactor === 0;
      }
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
      node.className = `pointer-events-none absolute left-0 top-0 whitespace-pre rounded-md px-2 py-1 font-mono text-[11px] font-semibold shadow ${
        tone === "result"
          ? "bg-slate-950/90 text-teal-200"
          : "bg-white/95 text-slate-900"
      }`;
      node.textContent = text;
      labels.appendChild(node);
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
      for (const m of next.measurements) {
        m.points.forEach(marker);
        if (m.mode === "distance" && m.points.length === 2) {
          const [a, b] = m.points;
          measurementGroup.add(fatLine([vec(a), vec(b)], 0x0f766e, 2.5));
          const s = distanceSummary(a, b);
          addLabel(
            vec(a).add(vec(b)).multiplyScalar(0.5),
            `${fmt(s.distance)} m`,
            "result",
          );
        } else if ((m.mode === "angle" || m.mode === "triangle") && m.points.length === 3) {
          const metrics = triangleMetrics(m.points);
          const vertices = m.points.map(vec);
          if (m.mode === "triangle") vertices.push(vec(m.points[0]));
          measurementGroup.add(fatLine(vertices, 0x0f766e, 2.5));
          addLabel(vec(m.points[1]), metrics ? (m.mode === "angle" ? `${fmt(metrics.angle)}°` : `${fmt(metrics.area)} m²`) : "—", "result");
        } else if (m.mode === "point" && m.points[0]) {
          addLabel(
            vec(m.points[0]),
            coordinateText([m.points[0].x, m.points[0].y, m.points[0].z]),
            "point",
          );
        }
      }
      next.pendingPoints.forEach(marker);
      if (next.pendingPoints.length > 1) measurementGroup.add(fatLine(next.pendingPoints.map(vec), 0x0f766e, 2.5));
      requestRender();
    };

    // ---- Hover: snapping preview and coordinate readout ------------------
    // Snap glyphs as in Autodesk viewers: square = vertex, triangle =
    // midpoint, ring = edge, dot = face.
    const SNAP_GLYPHS: Record<SnapKind, THREE.BufferGeometry> = {
      vertex: new THREE.PlaneGeometry(1.6, 1.6),
      midpoint: new THREE.CircleGeometry(1.25, 3).rotateZ(Math.PI / 2),
      edge: new THREE.RingGeometry(0.45, 1, 24),
      face: DISC,
    };
    const hoverMarker = new THREE.Mesh(
      SNAP_GLYPHS.face,
      new THREE.MeshBasicMaterial({ color: SNAP_COLORS.face, depthTest: false, side: THREE.DoubleSide }),
    );
    hoverMarker.renderOrder = 7;
    hoverMarker.userData.px = 5;
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
    hoverGroup.add(hoverMarker, hoverEdge, rubberBand);
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

    /** Surface hit under the pointer, snapped when measuring. */
    const pick = (clientX: number, clientY: number, snap: boolean) => {
      const pointer = castFrom(clientX, clientY);
      const started = performance.now();
      const hit = pickTree().firstHit(ray, activePlanes, isPickable);
      lastPickMs = performance.now() - started;
      if (!hit) return null;
      const mesh = hit.object as THREE.Mesh;
      if (!snap || !hit.face)
        return {
          hit,
          point: hit.point.clone(),
          kind: "face" as SnapKind,
          edge: undefined,
        };
      const position = mesh.geometry.getAttribute("position");
      const index = mesh.geometry.index;
      let features = featureEdges.get(mesh.geometry);
      if (!features && index) {
        features = buildFeatureEdges(position.array, index.array);
        featureEdges.set(mesh.geometry, features);
      }
      const corners = [hit.face.a, hit.face.b, hit.face.c];
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
          const [x, y] = toScreen(new THREE.Vector3(...p));
          return [x, y];
        },
        pointer,
        tolerancePx: SNAP_TOLERANCE_PX,
        settings: current.snapSettings,
      });
      if (result.kind === "edge" && result.edge) {
        const closest = new THREE.Vector3();
        ray.ray.distanceSqToSegment(
          new THREE.Vector3(...result.edge[0]),
          new THREE.Vector3(...result.edge[1]),
          undefined,
          closest,
        );
        result.point = closest.toArray() as Vec3;
      }
      if (
        activePlanes.some(
          (plane) =>
            plane.distanceToPoint(new THREE.Vector3(...result.point)) < 0,
        )
      ) {
        return {
          hit,
          point: hit.point.clone(),
          kind: "face" as SnapKind,
          edge: undefined,
        };
      }
      return {
        hit,
        point: new THREE.Vector3(...result.point),
        kind: result.kind,
        edge: result.edge,
      };
    };

    const hideHover = () => {
      const shown = hoverGroup.visible;
      hoverGroup.visible = false;
      tooltip.hidden = true;
      readout.dataset.empty = "true";
      readout.textContent = ui(
        localeRef.current,
      ).formats.hoverToReadCoordinates;
      if (shown) requestRender();
    };
    const showHover = (clientX: number, clientY: number) => {
      const measuring = current.activeTool === "measure";
      const result = pick(clientX, clientY, measuring);
      if (!result) return hideHover();
      const p = result.point.toArray() as Vec3;
      readout.dataset.empty = "false";
      readout.textContent = coordinateText(p);
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
      const pending =
        current.measureMode === "distance" ? current.pendingPoint : null;
      rubberBand.visible = Boolean(pending);
      let text = snapLabels()[result.kind];
      if (pending) {
        const start = vec(pending);
        rubberBand.geometry.setPositions([start.x, start.y, start.z, result.point.x, result.point.y, result.point.z]);
        rubberBand.computeLineDistances();
        // Dashes of ~8 px wherever the line is.
        const dash = pxToWorld(start.clone().lerp(result.point, 0.5), 8);
        rubberBand.material.dashSize = dash;
        rubberBand.material.gapSize = dash * 0.6;
        const s = distanceSummary(pending, { x: p[0], y: p[1], z: p[2] });
        text += ` · ${fmt(s.distance)} m`;
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
        setQuality(maxPixelRatio);
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
          if (Math.hypot(dx, dy) < 2) return;
          orbit.moved = true;
          pivotMarker.position.copy(orbit.pivot);
          pivotMarker.visible = true;
          setQuality(Math.min(maxPixelRatio, 1));
          hideHover();
        }
        orbit.x = e.clientX;
        orbit.y = e.clientY;
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
      if (orbit && e.pointerId === orbit.pointerId) endOrbit();
      const start = down.get(e.pointerId);
      down.delete(e.pointerId);
      const multi = gesture;
      if (!down.size) gesture = false;
      if (
        !start ||
        multi ||
        e.button !== 0 ||
        Math.hypot(e.clientX - start.x, e.clientY - start.y) >
          CLICK_TOLERANCE_PX
      )
        return;
      if (current.activeTool === "measure") {
        const result = pick(e.clientX, e.clientY, true);
        if (result)
          current.onMeasurePoint({
            x: result.point.x,
            y: result.point.y,
            z: result.point.z,
            snap: result.kind,
            modelKey: (result.hit.object.userData.element as BimElementData).modelKey,
            guid: (result.hit.object.userData.element as BimElementData).guid,
            localPoint: result.hit.object.parent!.worldToLocal(result.point.clone()).toArray(),
          });
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
      current.onSelectElement(
        (result?.hit.object.userData.element as BimElementData | undefined) ??
          null,
        e.shiftKey || e.ctrlKey || e.metaKey,
      );
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
          const box = visible.isEmpty() ? fallback : visible;
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
          next.onSnapshot(renderer.domElement.toDataURL("image/png"));
        } catch {
          next.onSnapshot(null);
        } finally {
          gizmo.root.visible = gizmoVisible;
          hoverGroup.visible = hoverVisible;
          pivotMarker.visible = pivotVisible;
        }
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
        return (Array.isArray(material) ? material : [material]).some(
          (m) => m.transparent || (m as THREE.MeshBasicMaterial).wireframe,
        );
      });
      pipeline.apply(current.display);
      applyLighting(current.display.environment);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
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
      // Lower raster resolution while orbiting to keep 4K screens responsive.
      controls.addEventListener("start", () => {
        flight = null;
        setQuality(Math.min(maxPixelRatio, 1));
        requestRender();
      });
      controls.addEventListener("end", () => {
        setQuality(maxPixelRatio);
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
        className="pointer-events-none absolute left-0 top-0 z-20 rounded bg-slate-950/90 px-2 py-1 font-mono text-[11px] text-white"
        aria-hidden="true"
      />
      <div
        ref={readoutRef}
        role="status"
        aria-live="off"
        className="pointer-events-none absolute bottom-2 left-1/2 z-20 max-w-[calc(100%-1rem)] -translate-x-1/2 whitespace-pre rounded-lg bg-slate-950/85 px-3 py-2 font-mono text-[11px] leading-5 text-slate-100 shadow-lg data-[empty=true]:text-slate-400"
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
