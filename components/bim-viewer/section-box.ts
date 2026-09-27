import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
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
 * Faces of the box that cut: all six for a section box, one for a single
 * section plane (its max face, or its min face when flipped).
 */
export function activeFaces(clip: BimClipPlanes): { axis: Axis; side: Side }[] {
  if (!clip.enabled) return [];
  if (clip.planeAxis === undefined)
    return ([0, 1, 2] as Axis[]).flatMap((axis) => [
      { axis, side: "min" as const },
      { axis, side: "max" as const },
    ]);
  return [{ axis: clip.planeAxis, side: clip.flip ? "min" : "max" }];
}

/** Index into the canvas's six persistent planes (see BimCanvas applyClip). */
export const planeIndex = (axis: Axis, side: Side) => axis * 2 + (side === "max" ? 0 : 1);

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
  // A single plane is free to cross the whole model.
  const single = clip.planeAxis === axis;
  const clamped =
    side === "min"
      ? Math.min(Math.max(value, limits.min[axis]), single ? limits.max[axis] : upper - minGap)
      : Math.max(Math.min(value, limits.max[axis]), single ? limits.min[axis] : lower + minGap);
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

/**
 * A single section plane on `axis` through the middle of the model; the
 * other faces span the model so nothing else is cut.
 */
export function planeClip(bounds: BimBounds, axis: Axis, flip = false): BimClipPlanes {
  const keys = HANDLE_KEYS[axis];
  const middle = (bounds.min[axis] + bounds.max[axis]) / 2;
  return {
    minX: bounds.min[0],
    minY: bounds.min[1],
    minZ: bounds.min[2],
    x: bounds.max[0],
    y: bounds.max[1],
    z: bounds.max[2],
    [flip ? keys.min : keys.max]: middle,
    enabled: true,
    planeAxis: axis,
    flip,
  };
}

export interface SectionBoxGizmo {
  root: THREE.Group;
  handles: THREE.Mesh[];
  /** `handleRadius` maps a handle position to its world size (screen-constant sizing). */
  update(clip: BimClipPlanes, handleRadius: (position: THREE.Vector3) => number): void;
  highlight(handle: THREE.Object3D | null): void;
  dispose(): void;
}

/** Arrow along +Y from the origin, 2 units long: shaft plus cone head. */
function arrowGeometry() {
  const shaft = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 12).translate(0, 0.6, 0);
  const head = new THREE.ConeGeometry(0.34, 0.8, 20).translate(0, 1.6, 0);
  // A wider, invisible-looking base makes the arrow easy to grab at its root.
  const collar = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16).translate(0, 0.06, 0);
  const merged = mergeGeometries([shaft, head, collar]);
  for (const g of [shaft, head, collar]) g.dispose();
  return merged!;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Section gizmo in the style of Autodesk viewers: a translucent box (or a
 * single plane) with one draggable arrow per active face, pointing outwards.
 */
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
  // Single-plane mode: a tinted sheet with a crisp outline where the cut is.
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }),
  );
  sheet.renderOrder = 4;
  const sheetOutline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
    new THREE.LineBasicMaterial({ color: 0x0f766e, depthTest: false, transparent: true, opacity: 0.9 }),
  );
  sheetOutline.renderOrder = 5;
  root.add(edges, faces, sheet, sheetOutline);

  const geometry = arrowGeometry();
  const handles: THREE.Mesh[] = [];
  for (const axis of [0, 1, 2] as Axis[])
    for (const side of ["min", "max"] as Side[]) {
      const handle = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: AXIS_COLORS[axis], depthTest: false, transparent: true, opacity: 0.92 }),
      );
      handle.renderOrder = 6;
      const outward = new THREE.Vector3();
      outward.setComponent(axis, side === "max" ? 1 : -1);
      handle.quaternion.setFromUnitVectors(UP, outward);
      handle.userData = { axis, side };
      handles.push(handle);
      root.add(handle);
    }
  let highlighted: THREE.Object3D | null = null;
  const orient = new THREE.Quaternion();
  return {
    root,
    handles,
    update(clip, handleRadius) {
      const min = new THREE.Vector3(clip.minX, clip.minY, clip.minZ);
      const max = new THREE.Vector3(clip.x, clip.y, clip.z);
      const size = max.clone().sub(min);
      const center = min.clone().add(max).multiplyScalar(0.5);
      const single = clip.planeAxis !== undefined;
      edges.visible = faces.visible = !single;
      sheet.visible = sheetOutline.visible = single;
      for (const object of [edges, faces]) {
        object.position.copy(center);
        object.scale.set(Math.max(size.x, 1e-6), Math.max(size.y, 1e-6), Math.max(size.z, 1e-6));
      }
      if (single) {
        const axis = clip.planeAxis!;
        const at = clip.flip ? min.getComponent(axis) : max.getComponent(axis);
        const normal = new THREE.Vector3();
        normal.setComponent(axis, 1);
        orient.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        // The sheet spans the model across the two other axes, with a margin.
        const across = ([0, 1, 2] as Axis[]).filter((a) => a !== axis);
        const w = size.getComponent(across[0]) * 1.08;
        const h = size.getComponent(across[1]) * 1.08;
        for (const object of [sheet, sheetOutline]) {
          object.position.copy(center).setComponent(axis, at);
          object.quaternion.copy(orient);
          // PlaneGeometry lies in local XY; map its axes onto the two cross axes.
          const localX = new THREE.Vector3(1, 0, 0).applyQuaternion(orient);
          const alongFirst = Math.abs(localX.getComponent(across[0])) > 0.5;
          object.scale.set(Math.max(alongFirst ? w : h, 1e-6), Math.max(alongFirst ? h : w, 1e-6), 1);
        }
      }
      const active = new Set(activeFaces(clip).map((f) => `${f.axis}:${f.side}`));
      for (const handle of handles) {
        const { axis, side } = handle.userData as { axis: Axis; side: Side };
        handle.visible = active.has(`${axis}:${side}`);
        handle.position.copy(center);
        handle.position.setComponent(axis, side === "min" ? min.getComponent(axis) : max.getComponent(axis));
        handle.scale.setScalar(handleRadius(handle.position) * (handle === highlighted ? 1.35 : 1));
        (handle.material as THREE.MeshBasicMaterial).opacity = handle === highlighted ? 1 : 0.92;
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
      sheet.geometry.dispose();
      (sheet.material as THREE.Material).dispose();
      sheetOutline.geometry.dispose();
      (sheetOutline.material as THREE.Material).dispose();
      geometry.dispose();
      for (const handle of handles) (handle.material as THREE.Material).dispose();
      root.clear();
    },
  };
}
