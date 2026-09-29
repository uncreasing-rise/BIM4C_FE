/**
 * Version comparison of two IFC models, matched by GlobalId (stable across
 * exports of the same authoring model).
 */
import type { BimElementData } from "./types";
import { timeSlicer } from "./yield";

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
function geometrySignature(e: BimElementData, transform: (p: [number, number, number]) => [number, number, number]): string {
  const geometry = e.geometryData;
  if (!geometry) return [...transform(e.position).map(mm), ...e.size.map(mm), ...(e.quaternion ?? e.rotation ?? [])].join(",");
  // Actual triangle coordinates, independent of vertex numbering and winding.
  const vertices = new Uint32Array(geometry.positions.length / 3);
  for (let i = 0; i < vertices.length; i++) {
    const point = transform([geometry.positions[i * 3] + e.position[0], geometry.positions[i * 3 + 1] + e.position[1], geometry.positions[i * 3 + 2] + e.position[2]]);
    let h = 2166136261;
    for (const value of point) h = Math.imul(h ^ mm(value), 16777619);
    vertices[i] = h >>> 0;
  }
  let sum = 0, xor = 0, second = 0;
  for (let i = 0; i < geometry.indices.length; i += 3) {
    const keys = [vertices[geometry.indices[i]], vertices[geometry.indices[i + 1]], vertices[geometry.indices[i + 2]]].sort((a, b) => a - b);
    let h = 2166136261;
    for (const key of keys) h = Math.imul(h ^ key, 16777619);
    sum = (sum + h) | 0; xor ^= h; second = (second + Math.imul(h, h ^ 0x9e3779b9)) | 0;
  }
  return `${geometry.indices.length}:${sum}:${xor}:${second}`;
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

function* comparisonSteps(
  oldElements: BimElementData[],
  newElements: BimElementData[],
  /** Old-model position → new-model frame (models may sit differently). */
  toNewFrame: (position: [number, number, number]) => [number, number, number] = (p) => p,
): Generator<void, ModelDiff> {
  const byGuid = new Map<string, BimElementData>();
  for (const e of oldElements) if (e.guid) byGuid.set(e.guid, e);
  const diff: ModelDiff = { added: [], removed: [], geometry: [], properties: [], unchanged: [], matchedOld: [] };
  const seen = new Set<string>();
  for (const e of newElements) {
    yield;
    const old = e.guid ? byGuid.get(e.guid) : undefined;
    if (!old) {
      diff.added.push(e.id);
      continue;
    }
    seen.add(old.guid);
    diff.matchedOld.push(old.id);
    if (geometrySignature(old, toNewFrame) !== geometrySignature(e, (p) => p)) diff.geometry.push(e.id);
    else if (propertySignature(old) !== propertySignature(e)) diff.properties.push(e.id);
    else diff.unchanged.push(e.id);
  }
  for (const e of oldElements) if (!e.guid || !seen.has(e.guid)) diff.removed.push(e.id);
  return diff;
}

export function compareModels(...args: Parameters<typeof comparisonSteps>): ModelDiff {
  const steps = comparisonSteps(...args);
  let step = steps.next();
  while (!step.done) step = steps.next();
  return step.value;
}

export async function compareModelsAsync(...args: Parameters<typeof comparisonSteps>): Promise<ModelDiff> {
  const steps = comparisonSteps(...args);
  const yieldWork = timeSlicer();
  let step = steps.next();
  while (!step.done) { await yieldWork(); step = steps.next(); }
  return step.value;
}
