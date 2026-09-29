/**
 * Quantity take-off from the quantities stored in the IFC file (Qto_* sets,
 * IfcElementQuantity). Bounding boxes are never used as quantities: they
 * overstate anything diagonal, hollow or openings-cut. When a file carries no
 * volume, the element’s own closed mesh gives an exact one instead; areas and
 * lengths depend on conventions (which face, which axis) and stay file-only.
 */
import type { BimElementData, BimGeometryData } from "./types";

export type TakeoffGroup = "type" | "storey" | "material";

export interface TakeoffRow {
  key: string;
  ids: string[];
  count: number;
  volume: number;
  area: number;
  length: number;
  /** Elements in the group whose file carries none of the three quantities. */
  withoutQuantities: number;
  /** Elements whose volume was computed from their mesh (no file quantity). */
  volumeFromGeometry: number;
  /** Elements that add nothing to any total: no file quantity and no closed mesh. */
  unquantified: number;
  units: { volume?: string; area?: string; length?: string };
}

// Preference order: the net figure first, gross as a fallback.
const VOLUME = ["NetVolume", "GrossVolume", "Volume", "TotalVolume", "VolumeNet", "VolumeGross"];
const AREA = ["NetArea", "GrossArea", "NetSideArea", "GrossSideArea", "NetFootprintArea", "GrossFootprintArea", "Area", "TotalArea", "CrossSectionArea", "GrossFloorArea", "NetFloorArea", "OuterSurfaceArea"];
const LENGTH = ["Length", "NetLength", "GrossLength", "TotalLength", "NominalLength", "Height", "Width"];

type Found = { value: number; unit?: string } | null;

function find(element: BimElementData, names: string[]): Found {
  for (const wanted of names)
    for (const pset of element.psets)
      for (const property of pset.properties) {
        const name = property.name.split(".").at(-1);
        if (name === wanted && typeof property.value === "number" && Number.isFinite(property.value))
          return { value: property.value, unit: property.unit };
      }
  return null;
}

/**
 * Volume enclosed by a triangle mesh (sum of signed tetrahedra), or null when
 * the mesh is not closed. For a closed surface the sum does not depend on the
 * reference point; an open one (a single face, a pipe without end caps) gives
 * different sums from two points, which is how it is detected.
 */
export function meshVolume(geometry: BimGeometryData | undefined): number | null {
  if (!geometry?.indices?.length || !geometry.positions?.length) return null;
  const p = geometry.positions, idx = geometry.indices;
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
const volumeCache = new WeakMap<BimElementData, number | null>();
const geometryVolume = (element: BimElementData) => {
  // Converted models' triangles arrive later: nothing to remember yet.
  if (!element.geometryData) return null;
  if (!volumeCache.has(element)) volumeCache.set(element, meshVolume(element.geometryData));
  return volumeCache.get(element) ?? null;
};

export function elementQuantities(element: BimElementData) {
  const fileVolume = find(element, VOLUME);
  const meshed = fileVolume ? null : geometryVolume(element);
  return {
    volume: fileVolume ?? (meshed === null ? null : { value: meshed, unit: "m³" }),
    volumeFromGeometry: !fileVolume && meshed !== null,
    area: find(element, AREA),
    length: find(element, LENGTH),
  };
}

const groupKey = (e: BimElementData, by: TakeoffGroup) =>
  (by === "type" ? e.ifcType : by === "storey" ? e.storey : e.material) || "—";

export function quantityTakeoff(elements: BimElementData[], by: TakeoffGroup): TakeoffRow[] {
  const rows = new Map<string, TakeoffRow>();
  for (const element of elements) {
    const key = groupKey(element, by);
    const row =
      rows.get(key) ??
      { key, ids: [], count: 0, volume: 0, area: 0, length: 0, withoutQuantities: 0, volumeFromGeometry: 0, unquantified: 0, units: {} };
    rows.set(key, row);
    row.ids.push(element.id);
    row.count++;
    const q = elementQuantities(element);
    // "Without quantities" describes the file, even where the mesh gave a volume.
    if ((!q.volume || q.volumeFromGeometry) && !q.area && !q.length) row.withoutQuantities++;
    if (q.volumeFromGeometry) row.volumeFromGeometry++;
    if (!q.volume && !q.area && !q.length) row.unquantified++;
    if (q.volume) {
      row.volume += q.volume.value;
      row.units.volume ??= q.volume.unit;
    }
    if (q.area) {
      row.area += q.area.value;
      row.units.area ??= q.area.unit;
    }
    if (q.length) {
      row.length += q.length.value;
      row.units.length ??= q.length.unit;
    }
  }
  return [...rows.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** CSV with a BOM so Excel opens Vietnamese text correctly. */
export function takeoffCsv(rows: TakeoffRow[], headers: string[]): string {
  const cell = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = [headers.map(cell).join(",")];
  for (const r of rows)
    lines.push(
      [r.key, r.count, r.volume || "", r.units.volume ?? "", r.area || "", r.units.area ?? "", r.length || "", r.units.length ?? "", r.withoutQuantities, r.volumeFromGeometry]
        .map(cell)
        .join(","),
    );
  return `﻿${lines.join("\r\n")}`;
}
