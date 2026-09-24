import * as THREE from "three";
import type { BimBounds, BimClipPlanes } from "./types";

export type Axis = 0 | 1 | 2;
export type Side = "min" | "max";
type V3 = [number, number, number];

export const HANDLE_KEYS: Record<Axis, Record<Side, keyof BimClipPlanes>> = {
  0: { min: "minX", max: "x" },
  1: { min: "minY", max: "y" },
  2: { min: "minZ", max: "z" },
};

// Scene axes: x = IFC X (east), y = elevation, z = -IFC Y (north).
const AXIS_COLORS: Record<Axis, number> = { 0: 0xef4444, 1: 0x3b82f6, 2: 0x22c55e };

/**
 * Value along `axis` of the point on the axis line through `anchor` that is
 * closest to the pointer ray. Returns null when the ray is (nearly) parallel
 * to the axis, i.e. dragging would be unstable.
 */
export function axisDragValue(rayOrigin: V3, rayDirection: V3, anchor: V3, axis: Axis): number | null {
  const d: V3 = [0, 0, 0];
  d[axis] = 1;
  const r = rayDirection;
  const w0: V3 = [anchor[0] - rayOrigin[0], anchor[1] - rayOrigin[1], anchor[2] - rayOrigin[2]];
  const b = d[0] * r[0] + d[1] * r[1] + d[2] * r[2];
  const c = r[0] * r[0] + r[1] * r[1] + r[2] * r[2];
  const dd = d[0] * w0[0] + d[1] * w0[1] + d[2] * w0[2];
  const e = r[0] * w0[0] + r[1] * w0[1] + r[2] * w0[2];
  const denominator = c - b * b; // |d| = 1
  if (Math.abs(denominator) < 1e-6 * c) return null;
  const s = (b * e - c * dd) / denominator;
  return anchor[axis] + s;
}

/** Moves one face of the box, keeping it inside the allowed range and ordered. */
export function moveFace(clip: BimClipPlanes, axis: Axis, side: Side, value: number, limits: BimBounds, minGap: number): BimClipPlanes {
  const keys = HANDLE_KEYS[axis];
  const lower = Number(clip[keys.min]);
  const upper = Number(clip[keys.max]);
  const clamped =
    side === "min"
      ? Math.min(Math.max(value, limits.min[axis]), upper - minGap)
      : Math.max(Math.min(value, limits.max[axis]), lower + minGap);
  return { ...clip, [side === "min" ? keys.min : keys.max]: clamped };
}

export function clipFromBox(box: THREE.Box3, enabled = true): BimClipPlanes {
  return {
    minX: box.min.x,
    minY: box.min.y,
    minZ: box.min.z,
    x: box.max.x,
    y: box.max.y,
    z: box.max.z,
    enabled,
  };
}

export interface SectionBoxGizmo {
  root: THREE.Group;
  handles: THREE.Mesh[];
  /** `handleRadius` maps a handle position to its world radius (screen-constant sizing). */
  update(clip: BimClipPlanes, handleRadius: (position: THREE.Vector3) => number): void;
  highlight(handle: THREE.Object3D | null): void;
  dispose(): void;
}

/** Wireframe box plus one draggable handle at the centre of each face. */
export function createSectionBoxGizmo(): SectionBoxGizmo {
  const root = new THREE.Group();
  root.name = "section-box";
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
    new THREE.LineBasicMaterial({ color: 0x0f766e, depthTest: false, transparent: true, opacity: 0.9 }),
  );
  edges.renderOrder = 5;
  const faces = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.BackSide }),
  );
  faces.renderOrder = 4;
  root.add(edges, faces);
  const handleGeometry = new THREE.SphereGeometry(1, 16, 12);
  const handles: THREE.Mesh[] = [];
  for (const axis of [0, 1, 2] as Axis[])
    for (const side of ["min", "max"] as Side[]) {
      const handle = new THREE.Mesh(
        handleGeometry,
        new THREE.MeshBasicMaterial({ color: AXIS_COLORS[axis], depthTest: false, transparent: true, opacity: 0.9 }),
      );
      handle.renderOrder = 6;
      handle.userData = { axis, side };
      handles.push(handle);
      root.add(handle);
    }
  let highlighted: THREE.Object3D | null = null;
  return {
    root,
    handles,
    update(clip, handleRadius) {
      const min = new THREE.Vector3(clip.minX, clip.minY, clip.minZ);
      const max = new THREE.Vector3(clip.x, clip.y, clip.z);
      const size = max.clone().sub(min);
      const center = min.clone().add(max).multiplyScalar(0.5);
      for (const object of [edges, faces]) {
        object.position.copy(center);
        object.scale.set(Math.max(size.x, 1e-6), Math.max(size.y, 1e-6), Math.max(size.z, 1e-6));
      }
      for (const handle of handles) {
        const { axis, side } = handle.userData as { axis: Axis; side: Side };
        handle.position.copy(center);
        handle.position.setComponent(axis, side === "min" ? min.getComponent(axis) : max.getComponent(axis));
        handle.scale.setScalar(handleRadius(handle.position) * (handle === highlighted ? 1.5 : 1));
      }
    },
    highlight(handle) {
      highlighted = handle;
    },
    dispose() {
      edges.geometry.dispose();
      (edges.material as THREE.Material).dispose();
      faces.geometry.dispose();
      (faces.material as THREE.Material).dispose();
      handleGeometry.dispose();
      for (const handle of handles) (handle.material as THREE.Material).dispose();
      root.clear();
    },
  };
}
