/**
 * Quantity take-off from the quantities stored in the IFC file (Qto_* sets,
 * IfcElementQuantity). Bounding boxes are never used as quantities: they
 * overstate anything diagonal, hollow or openings-cut.
 */
import type { BimElementData } from "./types";

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
  units: { volume?: string; area?: string; length?: string };
}

// Preference order: the net figure first, gross as a fallback.
const VOLUME = ["NetVolume", "GrossVolume", "Volume"];
const AREA = ["NetArea", "GrossArea", "NetSideArea", "GrossSideArea", "NetFootprintArea", "GrossFootprintArea", "Area"];
const LENGTH = ["Length", "NetLength", "GrossLength"];

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

export function elementQuantities(element: BimElementData) {
  return { volume: find(element, VOLUME), area: find(element, AREA), length: find(element, LENGTH) };
}

const groupKey = (e: BimElementData, by: TakeoffGroup) =>
  (by === "type" ? e.ifcType : by === "storey" ? e.storey : e.material) || "—";

export function quantityTakeoff(elements: BimElementData[], by: TakeoffGroup): TakeoffRow[] {
  const rows = new Map<string, TakeoffRow>();
  for (const element of elements) {
    const key = groupKey(element, by);
    const row =
      rows.get(key) ??
      { key, ids: [], count: 0, volume: 0, area: 0, length: 0, withoutQuantities: 0, units: {} };
    rows.set(key, row);
    row.ids.push(element.id);
    row.count++;
    const q = elementQuantities(element);
    if (!q.volume && !q.area && !q.length) row.withoutQuantities++;
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
      [r.key, r.count, r.volume || "", r.units.volume ?? "", r.area || "", r.units.area ?? "", r.length || "", r.units.length ?? "", r.withoutQuantities]
        .map(cell)
        .join(","),
    );
  return `﻿${lines.join("\r\n")}`;
}
