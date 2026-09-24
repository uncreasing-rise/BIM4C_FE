/**
 * Measurement snapping (vertex / midpoint / edge / face), independent of Three.js.
 *
 * Meshes are triangulated, so every quad face has a diagonal that is not a real
 * edge. Only "feature edges" — boundary edges and edges whose two faces meet
 * at more than a threshold angle — are offered as snap targets.
 */
import type { SnapKind, SnapSettings } from "./types";

export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

const KEY_PRECISION = 1e4; // 0.1 mm in model metres

function vertexKey(positions: ArrayLike<number>, index: number): string {
  const i = index * 3;
  return `${Math.round(positions[i] * KEY_PRECISION)},${Math.round(positions[i + 1] * KEY_PRECISION)},${Math.round(positions[i + 2] * KEY_PRECISION)}`;
}

/** Order-independent key of the edge between two vertex indices. */
export function edgeKey(positions: ArrayLike<number>, a: number, b: number): string {
  const ka = vertexKey(positions, a);
  const kb = vertexKey(positions, b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

function faceNormal(positions: ArrayLike<number>, a: number, b: number, c: number): Vec3 {
  const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
  const ux = positions[b * 3] - ax, uy = positions[b * 3 + 1] - ay, uz = positions[b * 3 + 2] - az;
  const vx = positions[c * 3] - ax, vy = positions[c * 3 + 1] - ay, vz = positions[c * 3 + 2] - az;
  const n: Vec3 = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  const length = Math.hypot(...n) || 1;
  return [n[0] / length, n[1] / length, n[2] / length];
}

/**
 * Keys of every feature edge in an indexed triangle mesh. Vertices are matched
 * by position, so meshes with split vertices (per-face normals) still work.
 */
export function buildFeatureEdges(
  positions: ArrayLike<number>,
  indices: ArrayLike<number>,
  thresholdDeg = 20,
): Set<string> {
  const normals = new Map<string, Vec3[]>();
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const tri = [indices[t], indices[t + 1], indices[t + 2]];
    const n = faceNormal(positions, tri[0], tri[1], tri[2]);
    for (let e = 0; e < 3; e++) {
      const key = edgeKey(positions, tri[e], tri[(e + 1) % 3]);
      const list = normals.get(key);
      if (list) list.push(n);
      else normals.set(key, [n]);
    }
  }
  const cosThreshold = Math.cos((thresholdDeg * Math.PI) / 180);
  const features = new Set<string>();
  for (const [key, list] of normals) {
    if (list.length === 1) {
      features.add(key); // open boundary
      continue;
    }
    const [a] = list;
    // Any neighbour folding away by more than the threshold makes it a feature.
    if (list.some((b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] < cosThreshold))
      features.add(key);
  }
  return features;
}

export interface SnapInput {
  /** Hit triangle corners in scene coordinates. */
  triangle: [Vec3, Vec3, Vec3];
  /** Which of the edges (v0-v1, v1-v2, v2-v0) are feature edges. */
  featureEdges: [boolean, boolean, boolean];
  hitPoint: Vec3;
  /** Scene point → screen pixels. */
  project: (point: Vec3) => Vec2;
  pointer: Vec2;
  tolerancePx: number;
  settings: SnapSettings;
}

export interface SnapResult {
  point: Vec3;
  kind: SnapKind;
  /** For edge/midpoint snaps: the snapped edge, for drawing. */
  edge?: [Vec3, Vec3];
}

const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const screenDistance = (a: Vec2, b: Vec2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function snapPoint(input: SnapInput): SnapResult {
  const { triangle, featureEdges, project, pointer, tolerancePx, settings } = input;
  const edges = ([0, 1, 2] as const)
    .filter((i) => featureEdges[i])
    .map((i) => [triangle[i], triangle[(i + 1) % 3]] as [Vec3, Vec3]);

  if (settings.vertex) {
    // Only corners that lie on a real edge; interior fan vertices are not corners.
    const corners = triangle.filter((_, i) => featureEdges[i] || featureEdges[(i + 2) % 3]);
    let best: { point: Vec3; d: number } | null = null;
    for (const corner of corners) {
      const d = screenDistance(project(corner), pointer);
      if (d <= tolerancePx && (!best || d < best.d)) best = { point: corner, d };
    }
    if (best) return { point: best.point, kind: "vertex" };
  }

  if (settings.midpoint) {
    let best: { point: Vec3; edge: [Vec3, Vec3]; d: number } | null = null;
    for (const edge of edges) {
      const mid = lerp(edge[0], edge[1], 0.5);
      const d = screenDistance(project(mid), pointer);
      if (d <= tolerancePx && (!best || d < best.d)) best = { point: mid, edge, d };
    }
    if (best) return { point: best.point, kind: "midpoint", edge: best.edge };
  }

  if (settings.edge) {
    let best: { point: Vec3; edge: [Vec3, Vec3]; d: number } | null = null;
    for (const edge of edges) {
      const a = project(edge[0]);
      const b = project(edge[1]);
      const abx = b[0] - a[0], aby = b[1] - a[1];
      const lengthSq = abx * abx + aby * aby;
      const t = lengthSq
        ? Math.min(1, Math.max(0, ((pointer[0] - a[0]) * abx + (pointer[1] - a[1]) * aby) / lengthSq))
        : 0;
      const d = screenDistance([a[0] + abx * t, a[1] + aby * t], pointer);
      // Screen-space t is a close approximation along the edge; the snapped
      // point is always exactly on the 3D edge line.
      if (d <= tolerancePx && (!best || d < best.d))
        best = { point: lerp(edge[0], edge[1], t), edge, d };
    }
    if (best) return { point: best.point, kind: "edge", edge: best.edge };
  }

  return { point: input.hitPoint, kind: "face" };
}
