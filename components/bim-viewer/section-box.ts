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

/**
 * Keeps min <= max on every axis. A single plane may cross its idle opposite
 * face; that face then follows it, as it cuts nothing.
 */
export function orderedClip(clip: BimClipPlanes): BimClipPlanes {
  const next = { ...clip };
  for (const axis of [0, 1, 2] as Axis[]) {
    const keys = HANDLE_KEYS[axis];
    const lower = Number(next[keys.min]);
    const upper = Number(next[keys.max]);
    if (upper >= lower) continue;
    if (clip.planeAxis === axis && clip.flip) (next as Record<string, unknown>)[keys.max] = lower;
    else (next as Record<string, unknown>)[keys.min] = upper;
  }
  return next;
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
  return orderedClip({ ...clip, [side === "min" ? keys.min : keys.max]: clamped });
}

/** The box's orientation (identity when aligned with the scene axes). */
export function clipRotation(clip: BimClipPlanes): THREE.Quaternion {
  return clip.rotation ? new THREE.Quaternion(...clip.rotation) : new THREE.Quaternion();
}

/** Bounds of `bounds` seen in a frame turned by `rotation` (box of the 8 turned corners). */
export function localBounds(bounds: BimBounds, rotation: THREE.Quaternion): BimBounds {
  const inverse = rotation.clone().invert();
  const box = new THREE.Box3();
  for (let i = 0; i < 8; i++)
    box.expandByPoint(
      new THREE.Vector3(
        i & 1 ? bounds.max[0] : bounds.min[0],
        i & 2 ? bounds.max[1] : bounds.min[1],
        i & 4 ? bounds.max[2] : bounds.min[2],
      ).applyQuaternion(inverse),
    );
  return { min: box.min.toArray(), max: box.max.toArray() };
}

const isIdentity = (q: THREE.Quaternion) => 1 - Math.abs(q.w) < 1e-9;
const withRotation = (clip: BimClipPlanes, q: THREE.Quaternion): BimClipPlanes => {
  const rest = orderedClip(clip);
  delete rest.rotation;
  return isIdentity(q) ? rest : { ...rest, rotation: q.toArray() as [number, number, number, number] };
};

/**
 * Scene point the section turns about: the box centre, or for a single
 * plane the point of the plane at the middle of the box.
 */
export function clipPivot(clip: BimClipPlanes): THREE.Vector3 {
  const local = new THREE.Vector3((clip.minX + clip.x) / 2, (clip.minY + clip.y) / 2, (clip.minZ + clip.z) / 2);
  if (clip.planeAxis !== undefined) {
    const keys = HANDLE_KEYS[clip.planeAxis];
    local.setComponent(clip.planeAxis, Number(clip[clip.flip ? keys.min : keys.max]));
  }
  return local.applyQuaternion(clipRotation(clip));
}

/**
 * The same section turned to `rotation` (absolute) about its pivot. A box
 * keeps its size; a single plane keeps passing through its pivot and its
 * other faces are re-spread over the model (`bounds`) in the new frame.
 */
export function rotateClip(clip: BimClipPlanes, rotation: THREE.Quaternion, bounds: BimBounds): BimClipPlanes {
  const pivot = clipPivot(clip).applyQuaternion(rotation.clone().invert());
  if (clip.planeAxis === undefined) {
    const half = [(clip.x - clip.minX) / 2, (clip.y - clip.minY) / 2, (clip.z - clip.minZ) / 2];
    return withRotation(
      {
        ...clip,
        minX: pivot.x - half[0],
        x: pivot.x + half[0],
        minY: pivot.y - half[1],
        y: pivot.y + half[1],
        minZ: pivot.z - half[2],
        z: pivot.z + half[2],
      },
      rotation,
    );
  }
  const span = localBounds(bounds, rotation);
  const keys = HANDLE_KEYS[clip.planeAxis];
  return withRotation(
    {
      ...clip,
      minX: span.min[0],
      minY: span.min[1],
      minZ: span.min[2],
      x: span.max[0],
      y: span.max[1],
      z: span.max[2],
      [clip.flip ? keys.min : keys.max]: pivot.getComponent(clip.planeAxis),
    },
    rotation,
  );
}

/**
 * Autodesk's "section at a surface": a single plane lying on the picked
 * face, removing what is on the viewer's side of it. `normal` must point
 * towards the viewer.
 */
export function faceClip(point: THREE.Vector3, normal: THREE.Vector3, bounds: BimBounds): BimClipPlanes {
  // The kept side of a max face is local -x, so local +x is the normal.
  const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), normal.clone().normalize());
  const span = localBounds(bounds, rotation);
  const at = point.clone().applyQuaternion(rotation.clone().invert());
  return withRotation(
    {
      minX: span.min[0],
      minY: span.min[1],
      minZ: span.min[2],
      x: at.x,
      y: span.max[1],
      z: span.max[2],
      enabled: true,
      planeAxis: 0,
      flip: false,
    },
    rotation,
  );
}

/** A single plane kept where it is, showing the other side (turn kept). */
export function flipClip(clip: BimClipPlanes, bounds: BimBounds): BimClipPlanes {
  if (clip.planeAxis === undefined) return clip;
  const keys = HANDLE_KEYS[clip.planeAxis];
  const at = Number(clip[clip.flip ? keys.min : keys.max]);
  const span = localBounds(bounds, clipRotation(clip));
  return orderedClip({
    ...clip,
    minX: span.min[0],
    minY: span.min[1],
    minZ: span.min[2],
    x: span.max[0],
    y: span.max[1],
    z: span.max[2],
    flip: !clip.flip,
    [clip.flip ? keys.max : keys.min]: at,
  });
}

// Scene axes → IFC names: x = X (east), y = Z (up), z = -Y (north).
const EULER_ORDER = "YXZ";

/** Turn of the section in degrees about the IFC axes X, Y and Z (up). */
export function clipAngles(clip: BimClipPlanes): { x: number; y: number; z: number } {
  const e = new THREE.Euler().setFromQuaternion(clipRotation(clip), EULER_ORDER);
  const deg = (r: number) => Math.round(THREE.MathUtils.radToDeg(r) * 10) / 10 || 0;
  return { x: deg(e.x), y: deg(-e.z), z: deg(e.y) };
}

/** Rotation from IFC-axis angles in degrees (inverse of clipAngles). */
export function rotationFromAngles(angles: { x: number; y: number; z: number }): THREE.Quaternion {
  const rad = THREE.MathUtils.degToRad;
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(angles.x), rad(angles.z), -rad(angles.y), EULER_ORDER));
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
  /** Grab targets: face arrows ({ axis, side }) and rotation rings ({ ring: axis }). */
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
  // Rotation rings, one per axis: a thin visible torus with a fatter,
  // invisible one inside it that is easy to grab.
  const ringGeometry = new THREE.TorusGeometry(1, 0.025, 8, 96);
  const ringHitGeometry = new THREE.TorusGeometry(1, 0.12, 6, 48);
  const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
  const rings: THREE.Mesh[] = [];
  for (const axis of [0, 1, 2] as Axis[]) {
    const ring = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({ color: AXIS_COLORS[axis], depthTest: false, transparent: true, opacity: 0.8 }),
    );
    ring.renderOrder = 6;
    const hit = new THREE.Mesh(ringHitGeometry, hitMaterial);
    hit.userData = { ring: axis };
    ring.add(hit);
    const normal = new THREE.Vector3();
    normal.setComponent(axis, 1);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    rings.push(ring);
    handles.push(hit);
    root.add(ring);
  }
  let highlighted: THREE.Object3D | null = null;
  const orient = new THREE.Quaternion();
  const worldOf = (local: THREE.Vector3) => root.localToWorld(local.clone());
  return {
    root,
    handles,
    update(clip, handleRadius) {
      // Everything below is in the box's own frame; the root carries its turn.
      root.quaternion.copy(clipRotation(clip));
      root.updateMatrixWorld(true);
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
      const pivot = clipPivot(clip).applyQuaternion(root.quaternion.clone().invert());
      const ringRadius = handleRadius(worldOf(pivot)) * 5;
      for (const [axis, ring] of rings.entries()) {
        // A plane turns about its two in-plane axes; turning about its normal changes nothing.
        ring.visible = clip.enabled && (!single || axis !== clip.planeAxis);
        ring.position.copy(pivot);
        const hot = highlighted === ring.children[0];
        ring.scale.setScalar(ringRadius * (hot ? 1.06 : 1));
        (ring.material as THREE.MeshBasicMaterial).opacity = hot ? 1 : 0.8;
      }
      for (const handle of handles) {
        if (handle.userData.ring !== undefined) {
          handle.visible = Boolean(handle.parent?.visible);
          continue;
        }
        const { axis, side } = handle.userData as { axis: Axis; side: Side };
        handle.visible = active.has(`${axis}:${side}`);
        handle.position.copy(center);
        handle.position.setComponent(axis, side === "min" ? min.getComponent(axis) : max.getComponent(axis));
        handle.scale.setScalar(handleRadius(worldOf(handle.position)) * (handle === highlighted ? 1.35 : 1));
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
      ringGeometry.dispose();
      ringHitGeometry.dispose();
      for (const ring of rings) (ring.material as THREE.Material).dispose();
      for (const handle of handles) (handle.material as THREE.Material).dispose();
      root.clear();
    },
  };
}
