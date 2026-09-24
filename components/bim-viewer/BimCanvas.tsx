"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useLanguage } from "@/lib/i18n/context";
import {
  createElementMesh,
  disposeObject,
  explodedPosition,
  fitCamera,
  visibleHit,
} from "./viewer-geometry";
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
  axisDragValue,
  clipFromBox,
  createSectionBoxGizmo,
  moveFace,
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
}

export interface SectionFitRequest {
  revision: number;
  target: "selection" | "all";
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
  onSelectElement: (element: BimElementData | null, append?: boolean) => void;
  visibleLayers: Record<BimDiscipline, boolean>;
  clipPlanes: BimClipPlanes;
  onClipPlanesChange: (clip: BimClipPlanes) => void;
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

interface ModelEntry {
  source: CanvasModel;
  group: THREE.Group;
  markers: THREE.Group;
  meshes: Map<string, THREE.Mesh>;
  ready: boolean;
}

export function BimCanvas(props: BimCanvasProps) {
  const { locale } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{ update: (props: BimCanvasProps) => void } | null>(
    null,
  );
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
    scene.background = new THREE.Color("#e1e8f0");
    const federation = new THREE.Group();
    const measurementGroup = new THREE.Group();
    const hoverGroup = new THREE.Group();
    const gizmo = createSectionBoxGizmo();
    scene.add(federation, measurementGroup, hoverGroup, gizmo.root);
    const entries = new Map<string, ModelEntry>();
    const materials = new Map<string, THREE.MeshStandardMaterial>();
    const primitiveGeometries = new Map<string, THREE.BufferGeometry>();
    const highlights = new Map<THREE.Material, THREE.MeshStandardMaterial>();
    const featureEdges = new WeakMap<THREE.BufferGeometry, Set<string>>();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    const ambient = new THREE.AmbientLight(0xffffff, 0.48);
    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.28);
    const sun = new THREE.DirectionalLight(0xffffff, 0.82);
    scene.add(ambient, hemisphere, sun);
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
    let activePlanes: THREE.Plane[] = NO_PLANES;
    let clip: BimClipPlanes = current.clipPlanes;
    const applyClip = (next: BimClipPlanes) => {
      clip = next;
      planes[0].constant = next.x;
      planes[1].constant = -next.minX;
      planes[2].constant = next.y;
      planes[3].constant = -next.minY;
      planes[4].constant = next.z;
      planes[5].constant = -next.minZ;
      const nextPlanes = next.enabled ? planes : NO_PLANES;
      if (nextPlanes !== activePlanes) {
        activePlanes = nextPlanes;
        for (const m of [...materials.values(), ...highlights.values()]) {
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
    const maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    // Handles and the hover marker keep a constant on-screen size.
    const handleRadius = (p: THREE.Vector3) =>
      Math.max(1e-3, camera.position.distanceTo(p) * 0.014);
    const pointRadius = () => Math.max(0.015, span * 0.0025);

    const requestRender = () => {
      if (!disposed && !frame && !document.hidden)
        frame = requestAnimationFrame(render);
    };
    const toScreen = (p: THREE.Vector3): [number, number, boolean] => {
      const v = p.clone().project(camera);
      const rect = renderer.domElement.getBoundingClientRect();
      return [
        ((v.x + 1) / 2) * rect.width,
        ((1 - v.y) / 2) * rect.height,
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
    function render() {
      frame = 0;
      if (disposed || renderer.getContext().isContextLost()) return;
      if (controls.update()) requestRender();
      if (gizmo.root.visible) gizmo.update(clip, handleRadius);
      if (hoverGroup.visible)
        hoverMarker.scale.setScalar(
          camera.position.distanceTo(hoverMarker.position) *
            (hoverKind === "face" ? 0.005 : 0.008),
        );
      renderer.render(scene, camera);
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
      const key = [...bounds.min, ...bounds.max].join(",");
      if (key === lastBoundsKey) return;
      lastBoundsKey = key;
      const box = new THREE.Box3(
        new THREE.Vector3(...bounds.min),
        new THREE.Vector3(...bounds.max),
      );
      center = box.getCenter(new THREE.Vector3());
      span = Math.max(1, box.getSize(new THREE.Vector3()).length());
      hemisphere.position.copy(center).add(new THREE.Vector3(0, span, 0));
      sun.position.copy(center).add(new THREE.Vector3(span, span, span));
      if (grid) {
        scene.remove(grid);
        grid.geometry.dispose();
        (grid.material as THREE.Material).dispose();
      }
      grid = new THREE.GridHelper(span * 2, 40, 0x64748b, 0xcbd5e1);
      grid.position.set(center.x, box.min.y - span * 0.005, center.z);
      scene.add(grid);
      camera.far = Math.max(camera.far, span * 20);
      camera.updateProjectionMatrix();
      measurementsKey = null; // marker sizes depend on span
    };

    // ---- Models --------------------------------------------------------
    const pickable = () => {
      const list: THREE.Mesh[] = [];
      for (const entry of entries.values())
        if (entry.ready && entry.group.visible)
          for (const mesh of entry.meshes.values())
            if (mesh.visible) list.push(mesh);
      return list;
    };
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
      current.onStats({ bytes, triangles });
    };
    const removeEntry = (entry: ModelEntry) => {
      federation.remove(entry.group);
      for (const mesh of entry.meshes.values()) {
        const g = mesh.geometry;
        if (![...primitiveGeometries.values()].includes(g)) {
          g.boundsTree = undefined;
          g.dispose();
        }
      }
      disposeObject(entry.markers);
      entry.meshes.clear();
      entry.group.clear();
    };
    const buildEntry = async (entry: ModelEntry) => {
      setBuilding((n) => n + 1);
      try {
        let lastYield = performance.now();
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
          if (performance.now() - lastYield > 12) {
            await new Promise((resolve) => setTimeout(resolve, 0));
            lastYield = performance.now();
          }
        }
        for (const clash of entry.source.model.clashes) {
          const marker = new THREE.Mesh(
            new THREE.SphereGeometry(pointRadius() * 3, 12, 8),
            new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true }),
          );
          marker.position.set(...clash.point);
          entry.markers.add(marker);
        }
        entry.ready = true;
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
          entry = { source, group, markers, meshes: new Map(), ready: false };
          entries.set(source.key, entry);
          void buildEntry(entry).catch(() => {
            if (!disposed) setError(true);
          });
        }
        if (
          entry.source.visible !== source.visible ||
          entry.source.placement !== source.placement
        )
          meshStateKey = "";
        entry.source = source;
        entry.group.visible = source.visible;
        entry.group.position.set(...source.placement.position);
        entry.group.rotation.set(0, source.placement.rotationY, 0);
      }
      federation.updateMatrixWorld(true);
    };

    // ---- Per-mesh state (visibility, explode, selection) -----------------
    let meshStateKey = "";
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
    const applyMeshState = (next: BimCanvasProps) => {
      const key = `${next.explodeFactor}|${JSON.stringify(next.visibleLayers)}|${[...next.selectedElementIds].join(",")}|${[...next.hiddenElementIds].join(",")}|${lastBoundsKey}`;
      if (key === meshStateKey) return;
      meshStateKey = key;
      for (const entry of entries.values()) {
        if (!entry.ready) continue;
        // Explode about the federation centre, expressed in the model frame.
        const localCenter = entry.group.worldToLocal(center.clone());
        for (const [id, mesh] of entry.meshes) {
          const element = mesh.userData.element as BimElementData;
          mesh.visible =
            next.visibleLayers[element.discipline] &&
            !next.hiddenElementIds.has(element.id);
          mesh.position.copy(
            explodedPosition(element, localCenter, next.explodeFactor),
          );
          const original = mesh.userData.baseMaterial as
            THREE.Material | THREE.Material[];
          mesh.material = next.selectedElementIds.has(id)
            ? Array.isArray(original)
              ? original.map(highlight)
              : highlight(original)
            : original;
        }
        entry.markers.visible =
          next.visibleLayers.clash && next.explodeFactor === 0;
      }
      federation.updateMatrixWorld(true);
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
      disposeObject(measurementGroup);
      labels.replaceChildren();
      // Measurements refer to assembled geometry, not presentation offsets.
      if (next.explodeFactor > 0) return;
      const markerGeometry = new THREE.SphereGeometry(pointRadius(), 12, 8);
      const marker = (p: MeasurePoint) => {
        const mesh = new THREE.Mesh(
          markerGeometry,
          new THREE.MeshBasicMaterial({
            color: SNAP_COLORS[p.snap],
            depthTest: false,
          }),
        );
        mesh.position.copy(vec(p));
        mesh.renderOrder = 3;
        measurementGroup.add(mesh);
      };
      for (const m of next.measurements) {
        m.points.forEach(marker);
        if (m.mode === "distance" && m.points.length === 2) {
          const [a, b] = m.points;
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([vec(a), vec(b)]),
            new THREE.LineBasicMaterial({ color: 0x0f766e, depthTest: false }),
          );
          line.renderOrder = 3;
          measurementGroup.add(line);
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
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices), new THREE.LineBasicMaterial({ color: 0x0f766e, depthTest: false }));
          line.renderOrder = 3;
          measurementGroup.add(line);
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
      if (next.pendingPoints.length > 1) measurementGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(next.pendingPoints.map(vec)), new THREE.LineBasicMaterial({ color: 0x0f766e, depthTest: false })));
      requestRender();
    };

    // ---- Hover: snapping preview and coordinate readout ------------------
    const hoverMarker = new THREE.Mesh(
      new THREE.SphereGeometry(1, 12, 8),
      new THREE.MeshBasicMaterial({
        color: SNAP_COLORS.face,
        depthTest: false,
      }),
    );
    hoverMarker.renderOrder = 7;
    const hoverEdge = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: SNAP_COLORS.edge,
        depthTest: false,
        linewidth: 2,
      }),
    );
    hoverEdge.renderOrder = 7;
    const rubberBand = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({
        color: 0x0f766e,
        depthTest: false,
        dashSize: 0.2,
        gapSize: 0.1,
      }),
    );
    rubberBand.renderOrder = 7;
    hoverGroup.add(hoverMarker, hoverEdge, rubberBand);
    hoverGroup.visible = false;
    let hoverKind: SnapKind = "face";

    const ray = new THREE.Raycaster();
    (ray as THREE.Raycaster & { firstHitOnly?: boolean }).firstHitOnly = true;
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
      ray.setFromCamera(ndc, camera);
      return local;
    };
    const snapLabels = (): Record<SnapKind, string> =>
      ui(localeRef.current).formats.snap;

    /** Surface hit under the pointer, snapped when measuring. */
    const pick = (clientX: number, clientY: number, snap: boolean) => {
      const pointer = castFrom(clientX, clientY);
      // A clipped nearest triangle must not hide a deeper visible surface.
      ray.firstHitOnly = activePlanes.length === 0;
      const hit = visibleHit(
        ray.intersectObjects(pickable(), false),
        activePlanes,
      );
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
      hoverGroup.visible = false;
      tooltip.hidden = true;
      readout.dataset.empty = "true";
      readout.textContent = ui(
        localeRef.current,
      ).formats.hoverToReadCoordinates;
      requestRender();
    };
    const showHover = (clientX: number, clientY: number) => {
      const measuring = current.activeTool === "measure";
      const result = pick(clientX, clientY, measuring);
      if (!result) return hideHover();
      const p = result.point.toArray() as Vec3;
      readout.dataset.empty = "false";
      readout.textContent = coordinateText(p);
      hoverGroup.visible = measuring;
      if (!measuring) {
        tooltip.hidden = true;
        return requestRender();
      }
      hoverMarker.position.copy(result.point);
      hoverKind = result.kind;
      (hoverMarker.material as THREE.MeshBasicMaterial).color.setHex(
        SNAP_COLORS[result.kind],
      );
      hoverEdge.visible = Boolean(result.edge);
      if (result.edge)
        hoverEdge.geometry.setFromPoints(
          result.edge.map((e) => new THREE.Vector3(...e)),
        );
      const pending =
        current.measureMode === "distance" ? current.pendingPoint : null;
      rubberBand.visible = Boolean(pending);
      let text = snapLabels()[result.kind];
      if (pending) {
        rubberBand.geometry.setFromPoints([vec(pending), result.point]);
        rubberBand.computeLineDistances();
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
    let drag: { axis: Axis; side: Side; pointerId: number } | null = null;
    const sectionActive = () =>
      current.activeTool === "section" && clip.enabled;
    const handleAt = (clientX: number, clientY: number) => {
      if (!sectionActive()) return null;
      castFrom(clientX, clientY);
      return ray.intersectObjects(gizmo.handles, false)[0]?.object ?? null;
    };

    // ---- Pointer events ------------------------------------------------
    const down = new Map<number, { x: number; y: number }>();
    let gesture = false;
    let hoverFrame = 0;
    let lastMove: PointerEvent | null = null;
    const pointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const handle = handleAt(e.clientX, e.clientY);
      if (handle) {
        const { axis, side } = handle.userData as { axis: Axis; side: Side };
        drag = { axis, side, pointerId: e.pointerId };
        controls.enabled = false;
        renderer.domElement.setPointerCapture(e.pointerId);
        return;
      }
      down.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (down.size > 1) gesture = true;
    };
    const pointerMove = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.pointerId) {
        castFrom(e.clientX, e.clientY);
        const anchor = gizmo.handles.find(
          (h) =>
            h.userData.axis === drag!.axis && h.userData.side === drag!.side,
        )!.position;
        const value = axisDragValue(
          ray.ray.origin.toArray() as Vec3,
          ray.ray.direction.toArray() as Vec3,
          anchor.toArray() as Vec3,
          drag.axis,
        );
        if (value !== null) {
          const b = current.sceneBounds;
          const margin = span * 0.05;
          const limits: BimBounds = {
            min: [b.min[0] - margin, b.min[1] - margin, b.min[2] - margin],
            max: [b.max[0] + margin, b.max[1] + margin, b.max[2] + margin],
          };
          applyClip(
            moveFace(clip, drag.axis, drag.side, value, limits, span * 0.001),
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
          if (!lastMove || disposed) return;
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
      if (drag && e.pointerId === drag.pointerId) {
        drag = null;
        controls.enabled = true;
        renderer.domElement.releasePointerCapture(e.pointerId);
        current.onClipPlanesChange(clip);
        return;
      }
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
      const result = pick(e.clientX, e.clientY, false);
      current.onSelectElement(
        (result?.hit.object.userData.element as BimElementData | undefined) ??
          null,
        e.shiftKey || e.ctrlKey || e.metaKey,
      );
    };

    // ---- Commands --------------------------------------------------------
    let lastView = -1;
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
          controls.enableDamping = false;
          controls.update();
          controls.enableDamping = true;
          controls.target.copy(
            fitCamera(
              camera,
              visible.isEmpty() ? fallback : visible,
              next.viewRequest.preset,
            ),
          );
          camera.far = Math.max(camera.far, span * 20);
          if (next.viewRequest.camera) {
            const saved = next.viewRequest.camera;
            camera.position.set(...saved.position);
            camera.up.set(...saved.up);
            camera.fov = saved.fov;
            controls.target.set(...saved.target);
          }
          camera.updateProjectionMatrix();
          controls.maxDistance = camera.far * 0.4;
          controls.update();
          lastView = next.viewRequest.revision;
        }
      }
      if (next.activeClashPoint && next.activeClashPoint !== lastClash) {
        controls.target.set(...next.activeClashPoint);
        camera.up.set(0, 1, 0);
        camera.position
          .copy(controls.target)
          .add(new THREE.Vector3(span * 0.15, span * 0.1, span * 0.15));
        controls.update();
      }
      lastClash = next.activeClashPoint;
      if (lastSectionFit !== next.sectionFitRequest.revision) {
        lastSectionFit = next.sectionFitRequest.revision;
        let box: THREE.Box3;
        if (
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
        try {
          const gizmoVisible = gizmo.root.visible;
          gizmo.root.visible = false;
          hoverGroup.visible = false;
          renderer.render(scene, camera);
          next.onSnapshot(renderer.domElement.toDataURL("image/png"));
          gizmo.root.visible = gizmoVisible;
        } catch {
          next.onSnapshot(null);
        }
      }
    };

    // ---- Update from props -----------------------------------------------
    let initialized = false;
    const update = (next: BimCanvasProps) => {
      current = next;
      if (!initialized) return;
      applySceneBounds(next.sceneBounds);
      reconcileModels(next.models);
      if (!drag && next.clipPlanes !== clip) applyClip(next.clipPlanes);
      gizmo.root.visible = next.activeTool === "section" && clip.enabled;
      gizmo.update(clip, handleRadius);
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
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
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
      });
      renderer.setPixelRatio(maxPixelRatio);
      renderer.localClippingEnabled = true;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.addEventListener("change", requestRender);
      // Lower raster resolution while orbiting to keep 4K screens responsive.
      controls.addEventListener("start", () => {
        renderer.setPixelRatio(Math.min(maxPixelRatio, 1));
        requestRender();
      });
      controls.addEventListener("end", () => {
        renderer.setPixelRatio(maxPixelRatio);
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
      document.addEventListener("visibilitychange", visibility);
      initialized = true;
      applyClip(current.clipPlanes);
      hideHover();
      update(current);
    };
    engineRef.current = { update };
    void Promise.resolve()
      .then(initialize)
      .catch(() => {
        if (!disposed) setError(true);
      });

    return () => {
      disposed = true;
      engineRef.current = null;
      if (frame) cancelAnimationFrame(frame);
      if (hoverFrame) cancelAnimationFrame(hoverFrame);
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
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.remove();
      }
      for (const entry of entries.values()) removeEntry(entry);
      entries.clear();
      gizmo.dispose();
      disposeObject(scene);
      materials.forEach((m) => m.dispose());
      highlights.forEach((m) => m.dispose());
      primitiveGeometries.forEach((g) => g.dispose());
      labels.replaceChildren();
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
      <div
        ref={labelsRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
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
