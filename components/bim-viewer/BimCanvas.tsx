"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useLanguage } from "@/lib/i18n/context";
import {
  clippingPlanes,
  createElementMesh,
  disposeObject,
  explodedPosition,
  fitCamera,
  getModelBounds,
  visibleHit,
} from "./viewer-geometry";
import type {
  BimClipPlanes,
  BimElementData,
  BimModelDefinition,
  BimTool,
  BimViewPreset,
  ActiveMeasurement,
  BimDiscipline,
} from "./types";

export interface BimCanvasProps {
  model: BimModelDefinition;
  activeTool: BimTool;
  selectedElementId: string | null;
  onSelectElement: (element: BimElementData | null) => void;
  visibleLayers: Record<BimDiscipline, boolean>;
  clipPlanes: BimClipPlanes;
  explodeFactor: number;
  activeClashPoint: [number, number, number] | null;
  activeViewPreset: BimViewPreset;
  viewRevision: number;
  snapshotRevision: number;
  onSnapshot: (data: string | null) => void;
  onStats: (stats: { bytes: number; triangles: number }) => void;
  onMeasurementChange: (measurement: ActiveMeasurement | null) => void;
  activeMeasurement: ActiveMeasurement | null;
}

export function BimCanvas(props: BimCanvasProps) {
  const { locale } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{ update: (props: BimCanvasProps) => void } | null>(
    null,
  );
  const latestRef = useRef(props);
  const [error, setError] = useState(false);
  const [building, setBuilding] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    latestRef.current = props;
    engineRef.current?.update(props);
  }, [props]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const model = props.model;
    let disposed = false;
    let frame = 0;
    let ready = false;
    let current = latestRef.current;
    let lastView = -1,
      lastSnapshot = current.snapshotRevision;
    let lastClash: BimCanvasProps["activeClashPoint"] = null;
    let lastMeasurement: ActiveMeasurement | null | undefined;
    const scene = new THREE.Scene();
    // Light drafting background improves contrast without changing model geometry.
    scene.background = new THREE.Color("#e1e8f0");
    const group = new THREE.Group(),
      markers = new THREE.Group(),
      measurement = new THREE.Group();
    scene.add(group, markers, measurement);
    const boundsData = getModelBounds(model);
    const bounds = new THREE.Box3(
      new THREE.Vector3(...boundsData.min),
      new THREE.Vector3(...boundsData.max),
    );
    const center = bounds.getCenter(new THREE.Vector3());
    const span = Math.max(1, bounds.getSize(new THREE.Vector3()).length());
    const meshes = new Map<string, THREE.Mesh>();
    const materials = new Map<string, THREE.MeshStandardMaterial>();
    const geometries = new Map<string, THREE.BufferGeometry>();
    const highlights = new Map<THREE.Material, THREE.MeshStandardMaterial>();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, span * 20);
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let observer: ResizeObserver;
    let activePlanes: THREE.Plane[] = [];
    let interacting = false;
    const maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const requestRender = () => {
      if (!disposed && !frame && !document.hidden)
        frame = requestAnimationFrame(render);
    };
    function render() {
      frame = 0;
      if (disposed || renderer.getContext().isContextLost()) return;
      if (controls.update()) requestRender();
      renderer.render(scene, camera);
    }
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setError(true);
    };
    const pointRadius = Math.max(0.015, span * 0.002);
    const update = (next: BimCanvasProps) => {
      current = next;
      if (!ready) return;
      activePlanes = clippingPlanes(next.clipPlanes);
      for (const m of [...materials.values(), ...highlights.values()]) {
        const changed = m.clippingPlanes?.length !== activePlanes.length;
        m.clippingPlanes = activePlanes;
        if (changed) m.needsUpdate = true;
      }
      for (const [id, mesh] of meshes) {
        const element = mesh.userData.element as BimElementData;
        mesh.visible = next.visibleLayers[element.discipline];
        mesh.position.copy(
          explodedPosition(element, center, next.explodeFactor),
        );
        const original = mesh.userData.baseMaterial as
          THREE.Material | THREE.Material[];
        const highlight = (m: THREE.Material) => {
          if (!highlights.has(m)) {
            const h = (m as THREE.MeshStandardMaterial).clone();
            h.emissive.setHex(0x06b6d4);
            h.emissiveIntensity = 0.65;
            highlights.set(m, h);
          }
          const h = highlights.get(m)!;
          h.clippingPlanes = activePlanes;
          return h;
        };
        mesh.material =
          id === next.selectedElementId
            ? Array.isArray(original)
              ? original.map(highlight)
              : highlight(original)
            : original;
      }
      markers.visible = next.visibleLayers.clash && next.explodeFactor === 0;
      group.updateMatrixWorld(true);
      if (lastView !== next.viewRevision) {
        const visibleBounds = new THREE.Box3();
        for (const mesh of meshes.values())
          if (mesh.visible)
            visibleBounds.union(
              mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld),
            );
        // Stop residual orbit damping before applying a repeatable view command.
        controls.enableDamping = false;
        controls.update();
        controls.enableDamping = true;
        controls.target.copy(
          fitCamera(
            camera,
            visibleBounds.isEmpty() ? bounds : visibleBounds,
            next.activeViewPreset,
          ),
        );
        controls.maxDistance = camera.far * 0.4;
        controls.update();
        lastView = next.viewRevision;
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
      if (next.activeMeasurement !== lastMeasurement) {
        disposeObject(measurement);
        lastMeasurement = next.activeMeasurement;
        const m = next.activeMeasurement;
        if (m) {
          const material = new THREE.MeshBasicMaterial({
            color: 0x14b8a6,
            depthTest: false,
          });
          const geo = new THREE.SphereGeometry(pointRadius, 12, 8);
          for (const p of [m.p1, m.p2])
            if (p) {
              const marker = new THREE.Mesh(geo, material);
              marker.position.set(p.x, p.y, p.z);
              marker.renderOrder = 2;
              measurement.add(marker);
            }
          if (m.p2) {
            const geo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(m.p1.x, m.p1.y, m.p1.z),
              new THREE.Vector3(m.p2.x, m.p2.y, m.p2.z),
            ]);
            const line = new THREE.Line(
              geo,
              new THREE.LineBasicMaterial({
                color: 0x14b8a6,
                depthTest: false,
              }),
            );
            line.renderOrder = 2;
            measurement.add(line);
          }
        }
      }
      if (lastSnapshot !== next.snapshotRevision) {
        lastSnapshot = next.snapshotRevision;
        try {
          renderer.render(scene, camera);
          next.onSnapshot(renderer.domElement.toDataURL("image/png"));
        } catch {
          next.onSnapshot(null);
        }
      }
      requestRender();
    };
    const down = new Map<number, { x: number; y: number }>();
    let gesture = false;
    const pointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (down.size > 1) gesture = true;
    };
    const pointerCancel = () => {
      down.clear();
      gesture = false;
    };
    const pointerUp = (e: PointerEvent) => {
      const start = down.get(e.pointerId);
      down.delete(e.pointerId);
      const multi = gesture;
      if (!down.size) gesture = false;
      if (
        !ready ||
        !start ||
        multi ||
        e.button !== 0 ||
        Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6
      )
        return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      // BVH-backed meshes can stop at the nearest triangle instead of sorting
      // every triangle in a large model. This affects picking only, never geometry.
      (ray as THREE.Raycaster & { firstHitOnly?: boolean }).firstHitOnly = true;
      camera.updateMatrixWorld();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      // Keep all BVH intersections: the nearest triangle may be clipped away.
      const hit = visibleHit(
        ray.intersectObjects(
          [...meshes.values()].filter((m) => m.visible),
          false,
        ),
        activePlanes,
      );
      if (current.activeTool === "measure") {
        if (!hit) return;
        const p2 = { x: hit.point.x, y: hit.point.y, z: hit.point.z };
        const m = current.activeMeasurement;
        if (!m || m.p2) current.onMeasurementChange({ p1: p2 });
        else {
          const p1 = m.p1;
          const deltaX = Math.abs(p2.x - p1.x),
            deltaY = Math.abs(p2.y - p1.y),
            deltaZ = Math.abs(p2.z - p1.z);
          current.onMeasurementChange({
            p1,
            p2,
            deltaX,
            deltaY,
            deltaZ,
            distance: Math.hypot(deltaX, deltaY, deltaZ),
          });
        }
      } else current.onSelectElement(hit?.object.userData.element ?? null);
    };
    const resize = () => {
      const width = Math.max(1, container.clientWidth),
        height = Math.max(1, container.clientHeight);
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
    const initialize = async () => {
      if (disposed) return;
      setError(false);
      setBuilding(true);
      renderer = new THREE.WebGLRenderer({
        // Keep rendering quality independent of model element count.
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.localClippingEnabled = true;
      // Keep source IFC colors linear and predictable on the light drafting canvas.
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.addEventListener("change", requestRender);
      const interactionStart = () => {
        if (interacting) return;
        interacting = true;
        // Keep full geometry and restore the final pixel ratio after the gesture.
        // Lowering raster samples during a drag removes frame stalls on 4K screens.
        renderer.setPixelRatio(Math.min(maxPixelRatio, 1));
        requestRender();
      };
      const interactionEnd = () => {
        interacting = false;
        renderer.setPixelRatio(maxPixelRatio);
        requestRender();
      };
      controls.addEventListener("start", interactionStart);
      controls.addEventListener("end", interactionEnd);
      scene.add(new THREE.AmbientLight(0xffffff, 0.48));
      const hemisphere = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.28);
      hemisphere.position.copy(center).add(new THREE.Vector3(0, span, 0));
      scene.add(hemisphere);
      const light = new THREE.DirectionalLight(0xffffff, 0.82);
      light.position.copy(center).add(new THREE.Vector3(span, span, span));
      scene.add(light);
      const grid = new THREE.GridHelper(span * 2, 40, 0x64748b, 0xcbd5e1);
      grid.position.set(center.x, bounds.min.y - span * 0.005, center.z);
      scene.add(grid);
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(container);
      renderer.domElement.addEventListener("pointerdown", pointerDown);
      renderer.domElement.addEventListener("pointerup", pointerUp);
      renderer.domElement.addEventListener("pointercancel", pointerCancel);
      document.addEventListener("visibilitychange", visibility);
      let lastYield = performance.now();
      for (const e of model.elements) {
        if (disposed) return;
        const mesh = createElementMesh(e, materials, geometries);
        group.add(mesh);
        meshes.set(e.id, mesh);
        if (performance.now() - lastYield > 12) {
          await new Promise((r) => setTimeout(r, 0));
          lastYield = performance.now();
        }
      }
      if (disposed) return;
      for (const clash of model.clashes) {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(pointRadius * 3, 12, 8),
          new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true }),
        );
        m.position.set(...clash.point);
        markers.add(m);
      }
      ready = true;
      update(current);
      setBuilding(false);
      let bytes = 0,
        triangles = 0;
      const unique = new Set<THREE.BufferGeometry>();
      for (const mesh of meshes.values()) {
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
    engineRef.current = { update };
    // Defer state changes until after the effect has installed its cleanup.
    void Promise.resolve()
      .then(initialize)
      .catch(() => {
        if (!disposed) {
          setError(true);
          setBuilding(false);
        }
      });
    return () => {
      disposed = true;
      ready = false;
      engineRef.current = null;
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      controls?.removeEventListener("change", requestRender);
      controls?.dispose();
      if (renderer) {
        renderer.domElement.removeEventListener("pointerdown", pointerDown);
        renderer.domElement.removeEventListener("pointerup", pointerUp);
        renderer.domElement.removeEventListener("pointercancel", pointerCancel);
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          onContextLost,
        );
        renderer.domElement.remove();
      }
      disposeObject(scene);
      materials.forEach((m) => m.dispose());
      highlights.forEach((m) => m.dispose());
      geometries.forEach((g) => g.dispose());
      meshes.clear();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [props.model, retry]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        aria-label={
          locale === "vi"
            ? "Mô hình 3D: kéo để xoay, cuộn để phóng to"
            : "3D model: drag to orbit, scroll to zoom"
        }
      />
      {building && !error && (
        <div
          role="status"
          className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-950/70 text-sm"
        >
          {locale === "vi" ? "Đang dựng mô hình…" : "Building model…"}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 p-5 text-center"
        >
          <p>
            {locale === "vi"
              ? "Không thể hiển thị 3D. Hãy thử lại hoặc kiểm tra hỗ trợ WebGL của trình duyệt."
              : "3D rendering is unavailable. Retry or check your browser's WebGL support."}
          </p>
          <button
            type="button"
            onClick={() => setRetry((n) => n + 1)}
            className="rounded-lg border px-4 py-2"
          >
            {locale === "vi" ? "Thử lại" : "Retry"}
          </button>
        </div>
      )}
    </div>
  );
}
