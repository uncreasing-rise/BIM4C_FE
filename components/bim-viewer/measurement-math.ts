import type { MeasureLock, MeasureMode, MeasurementPoint, MeasureUnits } from "./types";

/** Angle ABC in degrees; area of triangle ABC in square scene metres. */
export function triangleMetrics(points: MeasurementPoint[]) {
  if (points.length !== 3) return null;
  const [a, b, c] = points;
  const u = [a.x - b.x, a.y - b.y, a.z - b.z];
  const v = [c.x - b.x, c.y - b.y, c.z - b.z];
  const lu = Math.hypot(...u), lv = Math.hypot(...v);
  if (lu < 1e-9 || lv < 1e-9) return null;
  const cross = Math.hypot(u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]);
  const dot = u[0]*v[0]+u[1]*v[1]+u[2]*v[2];
  return { angle: Math.atan2(cross, dot) * 180 / Math.PI, area: cross / 2 };
}

const sub = (a: MeasurementPoint, b: MeasurementPoint) => [a.x - b.x, a.y - b.y, a.z - b.z];

/** Total length of an open polyline through the points, in scene metres. */
export function polylineLength(points: MeasurementPoint[]) {
  let length = 0;
  for (let i = 1; i < points.length; i++) length += Math.hypot(...sub(points[i], points[i - 1]));
  return length;
}

/**
 * Area and perimeter of the closed polygon through the points (Newell's
 * method, so it works on any plane, not only horizontal floors). `planArea`
 * is its footprint on the horizontal plane (scene Y is up). A non-planar
 * outline gives the area of its best-fit projection; null below 3 points.
 */
export function polygonMetrics(points: MeasurementPoint[]) {
  if (points.length < 3) return null;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    nx += (a.y - b.y) * (a.z + b.z);
    ny += (a.z - b.z) * (a.x + b.x);
    nz += (a.x - b.x) * (a.y + b.y);
  }
  const perimeter = polylineLength(points) + Math.hypot(...sub(points[0], points.at(-1)!));
  return { area: Math.hypot(nx, ny, nz) / 2, planArea: Math.abs(ny) / 2, perimeter };
}

/** Points each mode needs before it can be completed (open-ended modes: the minimum). */
export const MEASURE_POINTS = {
  point: 1,
  distance: 2,
  multipoint: 2,
  polyline: 2,
  accumulate: 2,
  angle: 3,
  triangle: 3,
  polygon: 3,
  shortest: 2,
  arc: 3,
} as const satisfies Record<MeasureMode, number>;
/** Modes that keep taking points until the user finishes them (Enter). */
export const isOpenEnded = (mode: MeasureMode) =>
  mode === "polyline" || mode === "polygon" || mode === "multipoint" || mode === "accumulate";
/** Most points one measurement may hold (the session schema enforces the same). */
export const MAX_MEASURE_POINTS = 1000;

const distance = (a: MeasurementPoint, b: MeasurementPoint) => Math.hypot(...sub(a, b));

/** Point to multiple points: distance from the base (first point) to each other point. */
export const multipointDistances = (points: MeasurementPoint[]) =>
  points.slice(1).map((p) => distance(points[0], p));

/** Accumulate: separate segments from consecutive pairs of points (a lone last point is ignored). */
export function accumulateSegments<T extends MeasurementPoint>(points: T[]) {
  const segments: [T, T][] = [];
  for (let i = 1; i < points.length; i += 2) segments.push([points[i - 1], points[i]]);
  return { segments, total: segments.reduce((sum, [a, b]) => sum + distance(a, b), 0) };
}

/**
 * The points a finished measurement keeps, or null when there are too few.
 * Accumulate drops an unpaired last point.
 */
export function finishedPoints<T extends MeasurementPoint>(mode: MeasureMode, points: T[]): T[] | null {
  const kept = mode === "accumulate" && points.length % 2 ? points.slice(0, -1) : points;
  return kept.length >= MEASURE_POINTS[mode] ? kept : null;
}

/**
 * Where the preview line to the cursor starts while points are being placed:
 * the base for point to multiple points, nothing between accumulate segments,
 * otherwise the last point.
 */
export function rubberBandAnchor<T extends MeasurementPoint>(mode: MeasureMode, pending: T[]): T | null {
  if (!pending.length || mode === "point" || mode === "shortest") return null;
  if (mode === "multipoint") return pending[0];
  if (mode === "accumulate" && pending.length % 2 === 0) return null;
  return pending.at(-1)!;
}

type V3 = [number, number, number];
export const LOCK_SYMBOLS: Record<NonNullable<MeasureLock>, string> = { x: "X", y: "Y", z: "Z", perpendicular: "⊥", parallel: "∥" };
export interface LockConstraint {
  kind: "line" | "plane";
  /** Unit direction of the line, or normal of the plane. */
  direction: V3;
}

/**
 * The constraint a lock puts on the next point, in scene axes (Y up; IFC X =
 * scene x, IFC Y = scene -z, IFC Z = scene y): a line through the previous
 * point, or for "parallel" a plane through it. Perpendicular and parallel
 * follow the surface the previous point was picked on: null without one.
 */
export function lockConstraint(lock: MeasureLock, normal?: V3): LockConstraint | null {
  if (lock === "x") return { kind: "line", direction: [1, 0, 0] };
  if (lock === "y") return { kind: "line", direction: [0, 0, -1] };
  if (lock === "z") return { kind: "line", direction: [0, 1, 0] };
  if (lock === null || !normal) return null;
  const length = Math.hypot(...normal);
  if (length < 1e-9) return null;
  const direction = normal.map((n) => n / length) as V3;
  return { kind: lock === "perpendicular" ? "line" : "plane", direction };
}

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** `point` moved onto the constraint through `anchor` (its closest point on the line or plane). */
export function constrainPoint(anchor: V3, point: V3, constraint: LockConstraint): V3 {
  const d = constraint.direction;
  const t = dot([point[0] - anchor[0], point[1] - anchor[1], point[2] - anchor[2]], d);
  return constraint.kind === "line"
    ? [anchor[0] + d[0] * t, anchor[1] + d[1] * t, anchor[2] + d[2] * t]
    : [point[0] - d[0] * t, point[1] - d[1] * t, point[2] - d[2] * t];
}

/**
 * Point on the constraint through `anchor` that the pointer ray designates,
 * for when the cursor is over empty space: the closest point to the ray on a
 * line, the ray's crossing on a plane. Null when the ray runs parallel to it.
 */
export function constrainRay(anchor: V3, origin: V3, rayDirection: V3, constraint: LockConstraint): V3 | null {
  const d = constraint.direction;
  const w: V3 = [origin[0] - anchor[0], origin[1] - anchor[1], origin[2] - anchor[2]];
  if (constraint.kind === "plane") {
    const denom = dot(rayDirection, d);
    if (Math.abs(denom) < 1e-9) return null;
    const t = -dot(w, d) / denom;
    if (t < 0) return null;
    return [origin[0] + rayDirection[0] * t, origin[1] + rayDirection[1] * t, origin[2] + rayDirection[2] * t];
  }
  // Closest points of the lines anchor + d·s and origin + r·t (|d| = 1).
  const b = dot(d, rayDirection), c = dot(rayDirection, rayDirection);
  const denom = c - b * b;
  if (Math.abs(denom) < 1e-9 * c) return null;
  const s = (dot(d, w) * c - b * dot(rayDirection, w)) / denom;
  return [anchor[0] + d[0] * s, anchor[1] + d[1] * s, anchor[2] + d[2] * s];
}

/** Points along the arc marking angle ABC, `radius` from B; empty for a straight or degenerate angle. */
export function angleArc(points: MeasurementPoint[], radius: number, segments = 24): V3[] {
  if (points.length !== 3) return [];
  const [a, b, c] = points;
  const u = sub(a, b), v = sub(c, b);
  const lu = Math.hypot(...u), lv = Math.hypot(...v);
  if (lu < 1e-9 || lv < 1e-9) return [];
  const un = u.map((n) => n / lu), vn = v.map((n) => n / lv);
  const angle = Math.acos(Math.min(1, Math.max(-1, un[0] * vn[0] + un[1] * vn[1] + un[2] * vn[2])));
  const sin = Math.sin(angle);
  // A straight (or zero) angle spans no plane: no arc to draw.
  if (sin < 1e-6) return [];
  const centre = [b.x, b.y, b.z];
  const arc: V3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * angle;
    const wa = Math.sin(angle - t) / sin, wb = Math.sin(t) / sin;
    arc.push([0, 1, 2].map((k) => centre[k] + (un[k] * wa + vn[k] * wb) * radius) as V3);
  }
  return arc;
}

/**
 * The circle through three points (any plane) and the arc from A through B
 * to C: centre, radius, the angle it spans and its length. Null for
 * collinear or repeated points.
 */
export function arcThrough(points: MeasurementPoint[]) {
  if (points.length !== 3) return null;
  const [a, b, c] = points;
  const ab = sub(b, a), ac = sub(c, a);
  const n = cross3(ab, ac);
  const n2 = n[0] * n[0] + n[1] * n[1] + n[2] * n[2];
  const scale = Math.max(dot3(ab, ab), dot3(ac, ac));
  if (n2 < 1e-12 * scale * scale) return null;
  // Circumcentre: A + (|AC|² (n × AB) + |AB|² (AC × n)) / (2 |n|²).
  const p = cross3(n, ab), q = cross3(ac, n);
  const lac = dot3(ac, ac), lab = dot3(ab, ab);
  const centre: V3 = [0, 1, 2].map((k) => [a.x, a.y, a.z][k] + (lac * p[k] + lab * q[k]) / (2 * n2)) as V3;
  const radius = Math.hypot(a.x - centre[0], a.y - centre[1], a.z - centre[2]);
  // Angles around the normal, from A.
  const normal = n.map((v) => v / Math.sqrt(n2)) as V3;
  const u = [a.x - centre[0], a.y - centre[1], a.z - centre[2]].map((v) => v / radius) as V3;
  const w = cross3(normal, u);
  const angleOf = (pt: MeasurementPoint) => {
    const d: V3 = [pt.x - centre[0], pt.y - centre[1], pt.z - centre[2]];
    const t = Math.atan2(dot3(d, w), dot3(d, u));
    return t < 0 ? t + 2 * Math.PI : t;
  };
  const tb = angleOf(b), tc = angleOf(c);
  // Counter-clockwise from A reaches B before C, or the arc goes the other way.
  const span = tb <= tc ? tc : 2 * Math.PI - tc;
  const direction = tb <= tc ? 1 : -1;
  return {
    centre,
    radius,
    normal,
    /** Degrees swept from A to C through B. */
    angle: (span * 180) / Math.PI,
    length: radius * span,
    /** Points along the arc, for drawing. */
    sample(segments = 48): V3[] {
      return Array.from({ length: segments + 1 }, (_, i) => {
        const t = direction * span * (i / segments);
        const cos = Math.cos(t), sin = Math.sin(t);
        return [0, 1, 2].map((k) => centre[k] + radius * (u[k] * cos + w[k] * sin)) as V3;
      });
    },
  };
}

const cross3 = (a: V3 | number[], b: V3 | number[]): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot3 = (a: V3 | number[], b: V3 | number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * One line of text for a measurement's result, in the chosen units (issue
 * descriptions, BCF comments). `pointText` formats a single point's coordinates.
 */
export function describeMeasurement(
  m: { mode: MeasureMode; points: MeasurementPoint[] },
  units: MeasureUnits,
  locale: string,
  pointText: (p: MeasurementPoint) => string,
): string {
  const len = (v: number) => formatMeasure(v, 1, units, locale);
  const area = (v: number) => formatMeasure(v, 2, units, locale);
  const deg = (v: number) => `${v.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 2 })}°`;
  const [a, b] = m.points;
  switch (m.mode) {
    case "distance":
      return `L = ${len(distance(a, b))}`;
    case "shortest":
      return `min = ${len(distance(a, b))}`;
    case "multipoint":
      return multipointDistances(m.points).map((d, i) => `→${i + 1} = ${len(d)}`).join("; ");
    case "polyline":
      return `Σ L = ${len(polylineLength(m.points))}`;
    case "accumulate":
      return `Σ L = ${len(accumulateSegments(m.points).total)}`;
    case "polygon": {
      const p = polygonMetrics(m.points);
      return p ? `A = ${area(p.area)}; P = ${len(p.perimeter)}` : "—";
    }
    case "angle":
    case "triangle": {
      const t = triangleMetrics(m.points);
      return t ? (m.mode === "angle" ? deg(t.angle) : `A = ${area(t.area)}`) : "—";
    }
    case "arc": {
      const arc = arcThrough(m.points);
      return arc ? `R = ${len(arc.radius)}; ⌒ = ${len(arc.length)}; ${deg(arc.angle)}` : "—";
    }
    case "point":
      return pointText(a);
  }
}

/** Metres per display unit. */
export const UNIT_METRES: Record<MeasureUnits["unit"], number> = { m: 1, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254 };
export const DEFAULT_MEASURE_UNITS: MeasureUnits = { unit: "m", precision: 3 };

/** A length (dimension 1) or area (dimension 2) given in metres, in the chosen unit with its symbol. */
export function formatMeasure(metres: number, dimension: 1 | 2, units: MeasureUnits, locale: string): string {
  const value = metres / UNIT_METRES[units.unit] ** dimension;
  const digits = Math.min(6, Math.max(0, Math.round(units.precision)));
  const text = (value === 0 ? 0 : value).toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${text} ${units.unit}${dimension === 2 ? "²" : ""}`;
}
