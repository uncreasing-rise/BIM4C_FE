/**
 * Rectangle ("window") selection, AutoCAD/Autodesk style:
 * dragging left → right selects what lies wholly inside the rectangle,
 * dragging right → left ("crossing") also selects what the rectangle touches.
 */
import * as THREE from "three";

export interface ScreenRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type BoxMode = "window" | "crossing";

export const boxMode = (startX: number, endX: number): BoxMode =>
  endX >= startX ? "window" : "crossing";

export function rectFrom(x0: number, y0: number, x1: number, y1: number): ScreenRect {
  return { left: Math.min(x0, x1), top: Math.min(y0, y1), right: Math.max(x0, x1), bottom: Math.max(y0, y1) };
}

const corner = new THREE.Vector3();

/**
 * Whether a world-space box is picked by the rectangle. `project` maps world
 * → screen pixels and says whether the point is in front of the camera.
 * `planes` are active section planes: a box cut away entirely is not picked.
 */
export function boxPicked(
  box: THREE.Box3,
  rect: ScreenRect,
  mode: BoxMode,
  project: (p: THREE.Vector3) => [number, number, boolean],
  planes: THREE.Plane[] = [],
): boolean {
  if (box.isEmpty()) return false;
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  let allInFront = true;
  const kept = planes.map(() => false);
  for (let i = 0; i < 8; i++) {
    corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
    planes.forEach((plane, p) => {
      if (plane.distanceToPoint(corner) >= 0) kept[p] = true;
    });
    const [x, y, inFront] = project(corner);
    if (!inFront) allInFront = false;
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  if (kept.some((k) => !k)) return false;
  if (mode === "window")
    return allInFront && left >= rect.left && right <= rect.right && top >= rect.top && bottom <= rect.bottom;
  return left <= rect.right && right >= rect.left && top <= rect.bottom && bottom >= rect.top;
}
