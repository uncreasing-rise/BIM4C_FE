/**
 * 2D sheets: floor plans cut from the model (as Autodesk's generated plan
 * views). Each element's triangles are cut by a horizontal plane; the cut
 * lines are drawn heavy, a second cut just above the floor adds the thin
 * lines of what stands on it (slab edges, bases, kerbs). Sheet coordinates
 * are metres: x east, y south (scene x and z), so north is up.
 */

export interface PlanElementLines {
  id: string;
  /** Segments as x1, y1, x2, y2, … (sheet metres). */
  cut: number[];
  below: number[];
}

export interface PlanDrawing {
  name: string;
  /** A floor plan (north up) or a vertical section (up is up). */
  kind?: "plan" | "section";
  /** Cut height (scene y, metres) and the floor line height. */
  height: number;
  floor: number;
  elements: PlanElementLines[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  /** Grid axes with their labels, in sheet coordinates. */
  grids: { tag: string; x1: number; y1: number; x2: number; y2: number }[];
}

/**
 * Segments where the plane y = h cuts the triangles, in sheet coordinates.
 * `matrix` is the mesh's world matrix (column-major, three.js order).
 */
export function cutMesh(
  positions: ArrayLike<number>,
  indices: ArrayLike<number>,
  matrix: ArrayLike<number>,
  h: number,
  out: number[] = [],
): number[] {
  return cutMeshPlane(positions, indices, matrix, PLAN_CUT(h), out);
}

type V3 = [number, number, number];

/**
 * A cutting plane (points p with n·p = d) and the sheet axes on it: sheet
 * x = u·(p − origin), sheet y = v·(p − origin).
 */
export interface SheetCut {
  normal: V3;
  d: number;
  origin: V3;
  u: V3;
  v: V3;
}

/** Floor plan at height h: sheet x east, sheet y south (north up). */
export const PLAN_CUT = (h: number): SheetCut => ({ normal: [0, 1, 0], d: h, origin: [0, 0, 0], u: [1, 0, 0], v: [0, 0, 1] });

/**
 * A vertical section through `point` looking along `view` (horizontal): the
 * sheet's x runs to the viewer's right and its y down, so up is up; y = 0 is
 * the scene's 0 elevation.
 */
export function sectionCut(point: V3, view: V3): SheetCut {
  const length = Math.hypot(view[0], view[2]) || 1;
  const n: V3 = [view[0] / length, 0, view[2] / length];
  // Right of someone looking along n (y up): n × up.
  const u: V3 = [-n[2], 0, n[0]];
  return { normal: n, d: n[0] * point[0] + n[2] * point[2], origin: [point[0], 0, point[2]], u, v: [0, -1, 0] };
}

/** Segments where the plane cuts the triangles, in the cut's sheet coordinates. */
export function cutMeshPlane(
  positions: ArrayLike<number>,
  indices: ArrayLike<number>,
  matrix: ArrayLike<number>,
  cut: SheetCut,
  out: number[] = [],
): number[] {
  const m = matrix;
  const [nx, ny, nz] = cut.normal;
  const vertexCount = positions.length / 3;
  // World coordinates once, and each vertex's signed distance to the plane:
  // most triangles are rejected on the distances alone.
  const world = new Float64Array(vertexCount * 3);
  const dist = new Float64Array(vertexCount);
  for (let v = 0; v < vertexCount; v++) {
    const x = positions[v * 3], y = positions[v * 3 + 1], z = positions[v * 3 + 2];
    const wx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const wy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const wz = m[2] * x + m[6] * y + m[10] * z + m[14];
    world[v * 3] = wx;
    world[v * 3 + 1] = wy;
    world[v * 3 + 2] = wz;
    dist[v] = nx * wx + ny * wy + nz * wz - cut.d;
  }
  const [ox, oy, oz] = cut.origin;
  const sheet = (x: number, y: number, z: number) => [
    cut.u[0] * (x - ox) + cut.u[1] * (y - oy) + cut.u[2] * (z - oz),
    cut.v[0] * (x - ox) + cut.v[1] * (y - oy) + cut.v[2] * (z - oz),
  ];
  const wy = dist;
  const edge = (a: number, b: number) => {
    const t = wy[a] / (wy[a] - wy[b]);
    const lerp = (k: number) => world[a * 3 + k] + (world[b * 3 + k] - world[a * 3 + k]) * t;
    return sheet(lerp(0), lerp(1), lerp(2));
  };
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = indices[t], b = indices[t + 1], c = indices[t + 2];
    const da = wy[a], db = wy[b], dc = wy[c];
    // Entirely on one side (touching counts as above, so faces lying in the plane add nothing).
    if ((da >= 0 && db >= 0 && dc >= 0) || (da < 0 && db < 0 && dc < 0)) continue;
    const points: number[][] = [];
    if (da >= 0 !== db >= 0) points.push(edge(a, b));
    if (db >= 0 !== dc >= 0) points.push(edge(b, c));
    if (dc >= 0 !== da >= 0) points.push(edge(c, a));
    if (points.length === 2) out.push(points[0][0], points[0][1], points[1][0], points[1][1]);
  }
  return out;
}

/** Bounds of every line in the drawing (grids included), with a margin. */
export function drawingBounds(elements: PlanElementLines[], grids: PlanDrawing["grids"] = [], margin = 0.05) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const add = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };
  for (const e of elements)
    for (const list of [e.cut, e.below]) for (let i = 0; i + 1 < list.length; i += 2) add(list[i], list[i + 1]);
  for (const g of grids) {
    add(g.x1, g.y1);
    add(g.x2, g.y2);
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  const pad = Math.max(maxX - minX, maxY - minY, 1) * margin;
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

/** SVG path data for a segment list ("M x y L x y …"), rounded to the millimetre. */
export function segmentsPath(segments: number[]) {
  const r = (v: number) => Math.round(v * 1000) / 1000;
  let d = "";
  for (let i = 0; i + 3 < segments.length; i += 4) d += `M${r(segments[i])} ${r(segments[i + 1])}L${r(segments[i + 2])} ${r(segments[i + 3])}`;
  return d;
}

/** Standard drawing scales, largest detail first. */
export const SCALES = [20, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000];

/** The most detailed standard scale at which `width` × `height` metres fit the paper (mm). */
export function fitScale(width: number, height: number, paperW: number, paperH: number) {
  return SCALES.find((s) => (width * 1000) / s <= paperW && (height * 1000) / s <= paperH) ?? SCALES.at(-1)!;
}

const esc = (text: string) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * The drawing as a stand-alone A3 landscape sheet (SVG in millimetres): the
 * plan at a standard scale, a north arrow, a scale bar and a title block.
 */
export function sheetSvg(
  drawing: PlanDrawing,
  title: { project: string; sheet: string; date: string; scaleLabel: string; north: string },
): string {
  const W = 420, H = 297, M = 10, titleH = 28;
  const areaW = W - 2 * M, areaH = H - 2 * M - titleH;
  const b = drawing.bounds;
  const scale = fitScale(b.maxX - b.minX, b.maxY - b.minY, areaW, areaH);
  const k = 1000 / scale; // mm on paper per metre
  const ox = M + (areaW - (b.maxX - b.minX) * k) / 2 - b.minX * k;
  const oy = M + (areaH - (b.maxY - b.minY) * k) / 2 - b.minY * k;
  const tx = (d: string) => `<g transform="translate(${ox.toFixed(3)} ${oy.toFixed(3)}) scale(${k.toFixed(6)})">${d}</g>`;
  const below = drawing.elements.map((e) => (e.below.length ? `<path d="${segmentsPath(e.below)}"/>` : "")).join("");
  const cut = drawing.elements.map((e) => (e.cut.length ? `<path d="${segmentsPath(e.cut)}"/>` : "")).join("");
  const grids = drawing.grids
    .map((g) => `<line x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}"/>`)
    .join("");
  const bubbles = drawing.grids
    .flatMap((g) => [
      [g.x1, g.y1],
      [g.x2, g.y2],
    ].map(([x, y]) => `<g transform="translate(${(ox + x * k).toFixed(2)} ${(oy + y * k).toFixed(2)})"><circle r="3.2" fill="#fff" stroke="#1e293b" stroke-width="0.35"/><text y="1.2" font-size="3.2" text-anchor="middle" font-weight="700">${esc(g.tag)}</text></g>`))
    .join("");
  // Scale bar: a round length close to 40 mm on paper.
  const target = (40 / 1000) * scale;
  const bar = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best), 1);
  const barMm = (bar / scale) * 1000;
  const ty = H - M - titleH;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" font-family="Inter, Arial, sans-serif">
<rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>
<rect x="${M / 2}" y="${M / 2}" width="${W - M}" height="${H - M}" fill="none" stroke="#0f172a" stroke-width="0.5"/>
<g fill="none" stroke-linecap="round">
<g stroke="#94a3b8" stroke-width="${(0.18 / k).toFixed(5)}" stroke-dasharray="${(6 / k).toFixed(4)} ${(1.5 / k).toFixed(4)} ${(0.8 / k).toFixed(4)} ${(1.5 / k).toFixed(4)}">${tx(grids)}</g>
<g stroke="#64748b" stroke-width="${(0.13 / k).toFixed(5)}">${tx(below)}</g>
<g stroke="#0f172a" stroke-width="${(0.5 / k).toFixed(5)}">${tx(cut)}</g>
</g>
${bubbles}
${drawing.kind === "section" ? "" : `<g transform="translate(${W - M - 12} ${M + 14})"><circle r="7" fill="none" stroke="#0f172a" stroke-width="0.35"/><path d="M0 -6 L3 4 L0 2 L-3 4 Z" fill="#0f172a"/><text y="-8.5" font-size="3.5" text-anchor="middle" font-weight="700">${esc(title.north)}</text></g>`}
<g transform="translate(${M + 4} ${ty - 6})"><rect width="${(barMm / 2).toFixed(2)}" height="1.6" fill="#0f172a"/><rect x="${(barMm / 2).toFixed(2)}" width="${(barMm / 2).toFixed(2)}" height="1.6" fill="none" stroke="#0f172a" stroke-width="0.25"/><text y="-1.2" font-size="2.8">0</text><text x="${barMm.toFixed(2)}" y="-1.2" font-size="2.8" text-anchor="end">${bar} m</text></g>
<g transform="translate(${M / 2} ${ty})" font-size="3.4">
<rect width="${W - M}" height="${titleH + M / 2}" fill="none" stroke="#0f172a" stroke-width="0.5"/>
<line x1="${W - M - 120}" y1="0" x2="${W - M - 120}" y2="${titleH + M / 2}" stroke="#0f172a" stroke-width="0.35"/>
<text x="6" y="11" font-size="6" font-weight="700">${esc(title.sheet)}</text>
<text x="6" y="20">${esc(title.project)}</text>
<text x="${W - M - 114}" y="11">${esc(title.scaleLabel)}: 1:${scale} (A3)</text>
<text x="${W - M - 114}" y="20">${esc(title.date)}</text>
<text x="${W - M - 114}" y="28" font-size="2.6" fill="#64748b">BIM4C</text>
</g>
</svg>`;
}
