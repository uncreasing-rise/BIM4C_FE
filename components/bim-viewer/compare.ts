/**
 * Version comparison of two IFC models, matched by GlobalId (stable across
 * exports of the same authoring model).
 */
import type { BimElementData } from "./types";

export interface ModelDiff {
  /** Ids in the new model. */
  added: string[];
  /** Ids in the old model. */
  removed: string[];
  /** Ids in the new model whose shape or placement changed. */
  geometry: string[];
  /** Ids in the new model with the same geometry but different properties. */
  properties: string[];
  /** Ids in the new model that did not change. */
  unchanged: string[];
  /** Old-model ids that have a counterpart in the new model. */
  matchedOld: string[];
}

export const DIFF_COLORS = {
  added: "#22c55e",
  removed: "#ef4444",
  geometry: "#f59e0b",
  properties: "#a855f7",
} as const;

const mm = (v: number) => Math.round(v * 1000);

/** Placement, size and triangle count at millimetre precision. */
function geometrySignature(e: BimElementData): string {
  const triangles = e.geometryData ? e.geometryData.indices.length / 3 : 0;
  return [...e.position.map(mm), ...e.size.map((v) => mm(Math.abs(v))), triangles].join(",");
}

/**
 * Property sets without the parser's own bookkeeping (express ids differ
 * between any two exports and are not a change).
 */
function propertySignature(e: BimElementData): string {
  const sets = e.psets
    .filter((set) => set.name !== "IFC")
    .map((set) => ({
      name: set.name.replace(/\s*\(#\d+\)$/, ""),
      properties: set.properties.map((p) => `${p.name}=${p.value}${p.unit ?? ""}`).sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return JSON.stringify([e.name, e.ifcType, e.material, e.storey, sets]);
}

export function compareModels(
  oldElements: BimElementData[],
  newElements: BimElementData[],
  /** Old-model position → new-model frame (models may sit differently). */
  toNewFrame: (position: [number, number, number]) => [number, number, number] = (p) => p,
): ModelDiff {
  const byGuid = new Map<string, BimElementData>();
  for (const e of oldElements) if (e.guid) byGuid.set(e.guid, e);
  const diff: ModelDiff = { added: [], removed: [], geometry: [], properties: [], unchanged: [], matchedOld: [] };
  const seen = new Set<string>();
  for (const e of newElements) {
    const old = e.guid ? byGuid.get(e.guid) : undefined;
    if (!old) {
      diff.added.push(e.id);
      continue;
    }
    seen.add(old.guid);
    diff.matchedOld.push(old.id);
    const moved = { ...old, position: toNewFrame(old.position) };
    if (geometrySignature(moved) !== geometrySignature(e)) diff.geometry.push(e.id);
    else if (propertySignature(old) !== propertySignature(e)) diff.properties.push(e.id);
    else diff.unchanged.push(e.id);
  }
  for (const e of oldElements) if (!e.guid || !seen.has(e.guid)) diff.removed.push(e.id);
  return diff;
}
