/**
 * Coordinate handling for federated (multi-file) IFC models.
 *
 * Axes: IFC is Z-up (X east, Y north, Z elevation); the Three.js scene is Y-up.
 * web-ifc converts IFC (X, Y, Z) to scene (x, y, z) = (X, Z, -Y).
 *
 * Precision: web-ifc moves each file near the origin and reports that shift.
 * Survey coordinates (hundreds of kilometres) are kept here in float64 and
 * only *differences* between models reach the float32 GPU buffers, so aligned
 * models stay millimetre-accurate.
 */
import type {
  BimBounds,
  BimMapConversion,
  BimModelDefinition,
  FederatedModel,
  MeasurementPoint,
  ModelPlacement,
} from "./types";

export type Vec3 = [number, number, number];

export const ifcToScene = ([x, y, z]: Vec3): Vec3 => [x, z, -y];
export const sceneToIfc = ([x, y, z]: Vec3): Vec3 => [x, -z, y];

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const zeroToPositive = (v: Vec3): Vec3 => v.map((n) => (n === 0 ? 0 : n)) as Vec3;

/** True origin of the model's local frame, in scene axes (float64). */
export function modelOrigin(model: BimModelDefinition): Vec3 {
  const t = model.coordination?.translation;
  return t ? zeroToPositive([-t[0], -t[1], -t[2]]) : [0, 0, 0];
}

export function resolvePlacement(
  federated: Pick<FederatedModel, "model" | "alignment" | "offset">,
  sceneOrigin: Vec3,
): ModelPlacement {
  const base: Vec3 =
    federated.alignment === "shared"
      ? sub(modelOrigin(federated.model), sceneOrigin)
      : [0, 0, 0];
  const { x, y, z, rotationDeg } = federated.offset;
  return {
    position: add(base, ifcToScene([x, y, z])),
    // A positive IFC rotation about +Z (counter-clockwise in plan) equals a
    // positive rotation about the scene's +Y axis.
    rotationY: (rotationDeg * Math.PI) / 180,
  };
}

/** Local model point → scene point (rotation about vertical, then translation). */
export function applyPlacement(point: Vec3, placement: ModelPlacement): Vec3 {
  const c = Math.cos(placement.rotationY);
  const s = Math.sin(placement.rotationY);
  const [x, y, z] = point;
  return add([x * c + z * s, y, -x * s + z * c], placement.position);
}

export function placedBounds(bounds: BimBounds, placement: ModelPlacement): BimBounds {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const x of [bounds.min[0], bounds.max[0]])
    for (const y of [bounds.min[1], bounds.max[1]])
      for (const z of [bounds.min[2], bounds.max[2]]) {
        const p = applyPlacement([x, y, z], placement);
        for (let i = 0; i < 3; i++) {
          min[i] = Math.min(min[i], p[i]);
          max[i] = Math.max(max[i], p[i]);
        }
      }
  return { min, max };
}

export function unionBounds(list: BimBounds[]): BimBounds | null {
  if (!list.length) return null;
  const min: Vec3 = [...list[0].min];
  const max: Vec3 = [...list[0].max];
  for (const b of list.slice(1))
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], b.min[i]);
      max[i] = Math.max(max[i], b.max[i]);
    }
  return { min, max };
}

/** Scene point → IFC world coordinates (X east, Y north, Z elevation). */
export function sceneToWorld(point: Vec3 | MeasurementPoint, sceneOrigin: Vec3): Vec3 {
  const p: Vec3 = Array.isArray(point) ? point : [point.x, point.y, point.z];
  return zeroToPositive(sceneToIfc(add(p, sceneOrigin)));
}

/** IFC world coordinates → map Eastings / Northings / Height via IfcMapConversion. */
export function worldToMap([x, y, z]: Vec3, map: BimMapConversion): Vec3 {
  const c = Math.cos(map.rotation);
  const s = Math.sin(map.rotation);
  return [
    map.eastings + map.scale * (x * c - y * s),
    map.northings + map.scale * (x * s + y * c),
    map.orthogonalHeight + z,
  ];
}

export interface DistanceSummary {
  distance: number;
  /** Plan (horizontal) distance. */
  horizontal: number;
  /** Signed deltas in IFC axes: east, north, elevation. */
  dx: number;
  dy: number;
  dz: number;
}

export function distanceSummary(a: MeasurementPoint, b: MeasurementPoint): DistanceSummary {
  const [dx, dy, dz] = sceneToIfc([b.x - a.x, b.y - a.y, b.z - a.z]);
  return {
    distance: Math.hypot(dx, dy, dz),
    horizontal: Math.hypot(dx, dy),
    dx: dx === 0 ? 0 : dx,
    dy: dy === 0 ? 0 : dy,
    dz: dz === 0 ? 0 : dz,
  };
}

export function formatLength(value: number, locale: string, digits = 3): string {
  return value.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function distanceBetween(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
