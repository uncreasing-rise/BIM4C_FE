import type { MeasurementPoint } from "./types";

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
