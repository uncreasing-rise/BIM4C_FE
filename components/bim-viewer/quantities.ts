/**
 * Quantity take-off from the quantities stored in the IFC file (Qto_* sets,
 * IfcElementQuantity). Bounding boxes are never used as quantities: they
 * overstate anything diagonal, hollow or openings-cut. When a file carries no
 * volume, the element’s own closed mesh supplies a geometric estimate; areas and
 * lengths depend on conventions (which face, which axis) and stay file-only.
 */
import type { BimElementData, BimGeometryData } from "./types";
import { yieldToBrowser } from "./yield";

export type TakeoffGroup = "type" | "storey" | "material";

export interface TakeoffRow {
  key: string;
  ids: string[];
  count: number;
  volume: number;
  area: number;
  length: number;
  coverage: { volume: number; area: number; length: number };
  /** Elements in the group whose file carries none of the three quantities. */
  withoutQuantities: number;
  /** Elements whose volume was computed from their mesh (no file quantity). */
  volumeFromGeometry: number;
  /** Elements that add nothing to any total: no file quantity and no closed mesh. */
  unquantified: number;
  units: { volume?: string; area?: string; length?: string };
}

// Preference order: the net figure first, gross as a fallback.
const VOLUME = ["NetVolume", "VolumeNet", "GrossVolume", "VolumeGross", "Volume", "TotalVolume"];
const AREA = ["NetArea", "NetSideArea", "NetFootprintArea", "NetFloorArea", "GrossArea", "GrossSideArea", "GrossFootprintArea", "GrossFloorArea", "Area", "TotalArea"];
const LENGTH = ["NetLength", "Length", "GrossLength", "TotalLength", "NominalLength"];

type Found = { value: number; unit?: string } | null;

/** Unknown or absent units cannot safely contribute to an SI total. */
export function quantityInSI(value: number, unit: string | undefined, dimension: 1 | 2 | 3): Found {
  if (!Number.isFinite(value) || value < 0 || !unit) return null;
  const normalized = unit.toLowerCase().trim().replaceAll("²", "2").replaceAll("³", "3").replace(/[\s^]/g, "")
    .replace(/^(square|sq\.?)/, "").replace(/^(cubic|cu\.?)/, "");
  const match = normalized.match(/^(m|mm|cm|dm|km|ft|in|metre|meter|millimetre|millimeter|centimetre|centimeter|foot|feet|inch|inches)([23])?$/);
  if (!match) return null;
  const explicitDimension = match[2] ? Number(match[2]) : /^(square|sq\.?)/i.test(unit.trim()) ? 2 : /^(cubic|cu\.?)/i.test(unit.trim()) ? 3 : 1;
  if (explicitDimension !== dimension) return null;
  const scales: Record<string, number> = { m: 1, metre: 1, meter: 1, mm: .001, millimetre: .001, millimeter: .001, cm: .01, centimetre: .01, centimeter: .01, dm: .1, km: 1000, ft: .3048, foot: .3048, feet: .3048, in: .0254, inch: .0254, inches: .0254 };
  const converted = value * scales[match[1]] ** dimension;
  return Number.isFinite(converted) ? { value: converted, unit: dimension === 1 ? "m" : dimension === 2 ? "m²" : "m³" } : null;
}

function find(element: BimElementData, names: string[], dimension: 1 | 2 | 3): Found {
  // Explicit quantity sets win over similarly named generic properties.
  const isQuantitySet = (name: string) => /qto|quantit/i.test(name);
  const tiers = [element.psets.filter((p) => isQuantitySet(p.name)), element.psets.filter((p) => !isQuantitySet(p.name))];
  for (const sets of tiers)
    for (const wanted of names)
      for (const pset of sets)
      for (const property of pset.properties) {
        const name = property.name.split(".").at(-1);
        if (name === wanted && typeof property.value === "number") {
          const quantity = quantityInSI(property.value, property.unit, dimension);
          if (quantity) return quantity;
        }
      }
  return null;
}

/**
 * Volume enclosed by a triangle mesh (sum of signed tetrahedra), or null when
 * the mesh is not closed and consistently oriented. Closure is checked by
 * edge incidence before summing; two reference points also check stability.
 */
export function meshVolume(geometry: BimGeometryData | undefined): number | null {
  if (!geometry?.indices?.length || !geometry.positions?.length) return null;
  const p = geometry.positions, idx = geometry.indices;
  if (p.length % 3 || idx.length % 3) return null;
  // Translation-invariant signed volume alone does not prove closure: opposite
  // missing faces can cancel. Require two oppositely directed uses of every
  // welded edge, including meshes with split vertices for face normals.
  const vertices = new Map<string, number>();
  const welded = new Uint32Array(p.length / 3);
  for (let i = 0; i < welded.length; i++) {
    const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
    const key = `${x},${y},${z}`;
    let vertex = vertices.get(key);
    if (vertex === undefined) { vertex = vertices.size; vertices.set(key, vertex); }
    welded[i] = vertex;
  }
  const vertexCount = vertices.size;
  if (vertexCount * vertexCount > Number.MAX_SAFE_INTEGER) return null;
  // Numeric edge IDs avoid building long coordinate strings for every edge.
  // Each directed use adds 4 +/- 1: exactly two opposite uses total 8.
  const edges = new Map<number, number>();
  for (let t = 0; t < idx.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const ai = idx[t + e], bi = idx[t + (e + 1) % 3];
      if (!Number.isInteger(ai) || ai < 0 || ai >= welded.length) return null;
      if (!Number.isInteger(bi) || bi < 0 || bi >= welded.length) return null;
      const a = welded[ai], b = welded[bi];
      if (a === b) return null;
      const key = Math.min(a, b) * vertexCount + Math.max(a, b);
      const uses = (edges.get(key) ?? 0) + (a < b ? 5 : 3);
      if (uses > 8) return null;
      edges.set(key, uses);
    }
  }
  for (const uses of edges.values()) if (uses !== 8) return null;
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < p.length; i += 3) {
    minX = Math.min(minX, p[i]); maxX = Math.max(maxX, p[i]);
    minY = Math.min(minY, p[i + 1]); maxY = Math.max(maxY, p[i + 1]);
    minZ = Math.min(minZ, p[i + 2]); maxZ = Math.max(maxZ, p[i + 2]);
  }
  const signed = (ox: number, oy: number, oz: number) => {
    let v = 0;
    for (let t = 0; t + 2 < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      const ax = p[a] - ox, ay = p[a + 1] - oy, az = p[a + 2] - oz;
      const bx = p[b] - ox, by = p[b + 1] - oy, bz = p[b + 2] - oz;
      const cx = p[c] - ox, cy = p[c + 1] - oy, cz = p[c + 2] - oz;
      v += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
    }
    return v / 6;
  };
  const v1 = signed(minX, minY, minZ);
  const v2 = signed(maxX + (maxX - minX), maxY + (maxY - minY), maxZ + (maxZ - minZ));
  if (!Number.isFinite(v1) || Math.abs(v1) < 1e-9) return null;
  return Math.abs(v1 - v2) <= 1e-4 * Math.abs(v1) + 1e-9 ? Math.abs(v1) : null;
}

// Meshes do not change once loaded; a take-off re-runs on every scope change.
const volumeCache = new WeakMap<BimGeometryData, number | null>();
const geometryVolume = (element: BimElementData) => {
  // Converted models' triangles arrive later: nothing to remember yet.
  if (!element.geometryData) return null;
  if (!volumeCache.has(element.geometryData)) volumeCache.set(element.geometryData, meshVolume(element.geometryData));
  return volumeCache.get(element.geometryData) ?? null;
};

const fileQuantityCache = new WeakMap<BimElementData["psets"], { volume: Found; area: Found; length: Found }>();
export function elementQuantities(element: BimElementData) {
  let file = fileQuantityCache.get(element.psets);
  if (!file) {
    file = { volume: find(element, VOLUME, 3), area: find(element, AREA, 2), length: find(element, LENGTH, 1) };
    fileQuantityCache.set(element.psets, file);
  }
  const fileVolume = file.volume;
  const meshed = fileVolume ? null : geometryVolume(element);
  return {
    volume: fileVolume ?? (meshed === null ? null : { value: meshed, unit: "m³" }),
    volumeFromGeometry: !fileVolume && meshed !== null,
    area: file.area,
    length: file.length,
  };
}

const groupKey = (e: BimElementData, by: TakeoffGroup) =>
  (by === "type" ? e.ifcType : by === "storey" ? e.storey : e.material) || "—";

function appendQuantity(rows: Map<string, TakeoffRow>, element: BimElementData, by: TakeoffGroup) {
    const key = groupKey(element, by);
    const row =
      rows.get(key) ??
      { key, ids: [], count: 0, volume: 0, area: 0, length: 0, coverage: { volume: 0, area: 0, length: 0 }, withoutQuantities: 0, volumeFromGeometry: 0, unquantified: 0, units: {} };
    rows.set(key, row);
    row.ids.push(element.id);
    row.count++;
    const q = elementQuantities(element);
    // "Without quantities" describes the file, even where the mesh gave a volume.
    if ((!q.volume || q.volumeFromGeometry) && !q.area && !q.length) row.withoutQuantities++;
    if (q.volumeFromGeometry) row.volumeFromGeometry++;
    if (!q.volume && !q.area && !q.length) row.unquantified++;
    if (q.volume) {
      row.coverage.volume++;
      row.volume += q.volume.value;
      row.units.volume ??= q.volume.unit;
    }
    if (q.area) {
      row.coverage.area++;
      row.area += q.area.value;
      row.units.area ??= q.area.unit;
    }
    if (q.length) {
      row.coverage.length++;
      row.length += q.length.value;
      row.units.length ??= q.length.unit;
    }
}

export function quantityTakeoff(elements: BimElementData[], by: TakeoffGroup): TakeoffRow[] {
  const rows = new Map<string, TakeoffRow>();
  for (const element of elements) appendQuantity(rows, element, by);
  return [...rows.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Same totals as the synchronous calculation, with input/paint opportunities
 * between slices. A changed scope cancels the old calculation, not just its UI. */
export async function quantityTakeoffAsync(
  elements: BimElementData[], by: TakeoffGroup, signal: AbortSignal,
  yieldControl: () => Promise<void> = yieldToBrowser,
): Promise<TakeoffRow[]> {
  const rows = new Map<string, TakeoffRow>();
  await yieldControl();
  let started = performance.now();
  for (let i = 0; i < elements.length; i++) {
    signal.throwIfAborted();
    appendQuantity(rows, elements[i], by);
    if (performance.now() - started >= 8 || i % 128 === 127) {
      await yieldControl();
      started = performance.now();
    }
  }
  signal.throwIfAborted();
  return [...rows.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** CSV with a BOM so Excel opens Vietnamese text correctly. */
export function takeoffCsv(rows: TakeoffRow[], headers: string[]): string {
  const cell = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = [headers.map(cell).join(",")];
  for (const r of rows)
    lines.push(
      [r.key, r.count, r.coverage.volume ? r.volume : "", r.units.volume ?? "", r.coverage.area ? r.area : "", r.units.area ?? "", r.coverage.length ? r.length : "", r.units.length ?? "", r.withoutQuantities, r.volumeFromGeometry]
        .map(cell)
        .join(","),
    );
  return `﻿${lines.join("\r\n")}`;
}
