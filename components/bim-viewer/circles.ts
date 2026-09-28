/**
 * Circular edges of a triangle mesh (pipe ends, round columns, holes), for
 * snapping to a circle's centre. A circle is a closed loop of feature edges
 * (see snapping.ts) whose vertices are coplanar and equidistant from their
 * centroid. Found once per geometry, in its own coordinates.
 */
import { edgeKey, vertexKey, type Vec3 } from "./snapping";

export interface CircleFeature {
  centre: Vec3;
  normal: Vec3;
  radius: number;
}

/** Tessellated circles have at least this many segments; fewer is a polygon. */
const MIN_SEGMENTS = 8;
const MAX_SEGMENTS = 1024;
/** Radius and plane tolerance, relative to the radius. */
const TOLERANCE = 0.02;

export function findCircles(
  positions: ArrayLike<number>,
  indices: ArrayLike<number>,
  featureEdges: Set<string>,
): CircleFeature[] {
  // Feature-edge graph over welded vertices (keys from edgeKey's vertex part).
  const point = new Map<string, Vec3>();
  const neighbours = new Map<string, Set<string>>();
  for (let t = 0; t + 2 < indices.length; t += 3)
    for (let e = 0; e < 3; e++) {
      const a = indices[t + e], b = indices[t + ((e + 1) % 3)];
      if (!featureEdges.has(edgeKey(positions, a, b))) continue;
      const ka = vertexKey(positions, a), kb = vertexKey(positions, b);
      for (const [k, i] of [[ka, a], [kb, b]] as const)
        if (!point.has(k)) point.set(k, [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]);
      if (!neighbours.has(ka)) neighbours.set(ka, new Set());
      if (!neighbours.has(kb)) neighbours.set(kb, new Set());
      neighbours.get(ka)!.add(kb);
      neighbours.get(kb)!.add(ka);
    }
  const circles: CircleFeature[] = [];
  const visited = new Set<string>();
  for (const start of neighbours.keys()) {
    if (visited.has(start) || neighbours.get(start)!.size !== 2) continue;
    // Walk a simple loop: every vertex on it has exactly two feature edges.
    const loop = [start];
    visited.add(start);
    let previous = start;
    let current = [...neighbours.get(start)!][0];
    let closed = false;
    while (loop.length <= MAX_SEGMENTS) {
      if (current === start) {
        closed = true;
        break;
      }
      const next = neighbours.get(current)!;
      if (next.size !== 2 || visited.has(current)) break;
      visited.add(current);
      loop.push(current);
      const [x, y] = [...next];
      [previous, current] = [current, x === previous ? y : x];
    }
    if (!closed || loop.length < MIN_SEGMENTS) continue;
    const circle = fitCircle(loop.map((k) => point.get(k)!));
    if (circle) circles.push(circle);
  }
  return circles;
}

/** The circle through a closed loop of points, or null if they are not on one. */
export function fitCircle(points: Vec3[]): CircleFeature | null {
  const n = points.length;
  const centre: Vec3 = [0, 0, 0];
  for (const p of points) for (let k = 0; k < 3; k++) centre[k] += p[k] / n;
  // Newell's normal of the loop.
  const normal: Vec3 = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const a = points[i], b = points[(i + 1) % n];
    normal[0] += (a[1] - b[1]) * (a[2] + b[2]);
    normal[1] += (a[2] - b[2]) * (a[0] + b[0]);
    normal[2] += (a[0] - b[0]) * (a[1] + b[1]);
  }
  const length = Math.hypot(...normal);
  if (length < 1e-12) return null;
  for (let k = 0; k < 3; k++) normal[k] /= length;
  let radius = 0;
  for (const p of points) radius += Math.hypot(p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]) / n;
  if (radius < 1e-6) return null;
  const tolerance = TOLERANCE * radius + 1e-5;
  for (const p of points) {
    const d: Vec3 = [p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]];
    if (Math.abs(Math.hypot(...d) - radius) > tolerance) return null;
    if (Math.abs(d[0] * normal[0] + d[1] * normal[1] + d[2] * normal[2]) > tolerance) return null;
  }
  return { centre, normal, radius };
}
