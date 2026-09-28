/**
 * Appearance: element colours and transparency set by the user, and the
 * Appearance Profiler (as in Navisworks) that colours every element by a
 * field or property value, with a legend.
 *
 * Both are stored as definitions — manual looks by IFC GlobalId, a profile
 * by what it colours by — so they survive reopening files in another order
 * and apply to an updated model without being redone.
 */
import type { BimElementData } from "./types";

export type ProfileField = "ifcType" | "storey" | "material" | "discipline" | "model" | "name";
export type ProfileSource = { kind: "field"; field: ProfileField } | { kind: "property"; name: string };

export interface AppearanceProfile {
  source: ProfileSource;
  /** Categorical: one colour per distinct value. Range: numeric values in equal-width bands. */
  mode: "values" | "ranges";
  /** Number of bands in range mode. */
  bands: number;
  /** Colours the user picked for legend keys, replacing the generated ones. */
  colors: Record<string, string>;
  /** Legend keys whose elements are hidden. */
  hidden: string[];
}

export interface LegendEntry {
  key: string;
  label: string;
  color: string;
  count: number;
  ids: string[];
}

/** Elements with no value for the profile: listed, grey, never guessed. */
export const NO_VALUE_KEY = "∅";
const NO_VALUE_COLOR = "#94a3b8";

/** Distinct, colour-blind-aware categorical palette (Tableau 20 order, paired tones last). */
export const CATEGORY_PALETTE = [
  "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac",
  "#a0cbe8", "#ffbe7d", "#ff9d9a", "#86bcb6", "#8cd17d", "#f1ce63", "#d4a6c8", "#fabfd2", "#d7b5a6", "#79706e",
];

/** Low → high for range bands (blue → red through neutral). */
const RANGE_STOPS = ["#2c7bb6", "#abd9e9", "#ffffbf", "#fdae61", "#d7191c"];

const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** The raw value an element has for a profile source (first match across its property sets). */
export function sourceValue(element: BimElementData, source: ProfileSource, modelName?: string): string | number | null {
  if (source.kind === "field") {
    const value = source.field === "model" ? (modelName ?? element.modelKey ?? "") : element[source.field];
    return value === undefined || value === "" ? null : value;
  }
  for (const set of element.psets)
    for (const property of set.properties)
      if (property.name === source.name) return property.value === "" ? null : property.value;
  return null;
}

/**
 * Property names present on the elements, most common first, with whether
 * their values are numeric (so the panel can offer ranges).
 */
export function listProperties(elements: BimElementData[], limit = 300) {
  const stats = new Map<string, { count: number; numeric: number }>();
  for (const element of elements) {
    const seen = new Set<string>();
    for (const set of element.psets) {
      // The parser's own bookkeeping (express ids) is not a property worth profiling.
      if (set.name === "IFC") continue;
      for (const property of set.properties) {
        if (seen.has(property.name)) continue;
        seen.add(property.name);
        const s = stats.get(property.name) ?? { count: 0, numeric: 0 };
        s.count++;
        if (toNumber(property.value) !== null) s.numeric++;
        stats.set(property.name, s);
      }
    }
  }
  return [...stats]
    .map(([name, s]) => ({ name, count: s.count, numeric: s.numeric === s.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb: number[]) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

/** Colour at t ∈ [0, 1] along the range stops. */
export function rangeColor(t: number) {
  const x = Math.min(1, Math.max(0, t)) * (RANGE_STOPS.length - 1);
  const i = Math.min(RANGE_STOPS.length - 2, Math.floor(x));
  const a = hexToRgb(RANGE_STOPS[i]), b = hexToRgb(RANGE_STOPS[i + 1]);
  return rgbToHex(a.map((c, k) => c + (b[k] - c) * (x - i)));
}

const formatNumber = (n: number) => (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 1 ? n.toFixed(2) : n.toPrecision(3));

/**
 * The profile's legend: one entry per value (or band), most elements first,
 * the elements without a value last.
 */
export function buildLegend(
  elements: BimElementData[],
  profile: AppearanceProfile,
  modelNames: Map<string, string> = new Map(),
): LegendEntry[] {
  const values = elements.map((e) => sourceValue(e, profile.source, e.modelKey ? modelNames.get(e.modelKey) : undefined));
  const groups = new Map<string, { label: string; ids: string[]; order: number }>();
  const add = (key: string, label: string, id: string, order: number) => {
    const group = groups.get(key) ?? { label, ids: [], order };
    group.ids.push(id);
    groups.set(key, group);
  };
  const numbers = values.map(toNumber);
  if (profile.mode === "ranges" && numbers.some((n) => n !== null)) {
    const present = numbers.filter((n): n is number => n !== null);
    const min = Math.min(...present), max = Math.max(...present);
    const bands = Math.max(1, Math.min(12, Math.round(profile.bands)));
    const width = (max - min) / bands || 1;
    elements.forEach((e, i) => {
      const n = numbers[i];
      if (n === null) return add(NO_VALUE_KEY, NO_VALUE_KEY, e.id, Infinity);
      const band = Math.min(bands - 1, Math.floor((n - min) / width));
      const lo = min + band * width, hi = max > min ? lo + width : max;
      add(`band:${band}`, `${formatNumber(lo)} – ${formatNumber(hi)}`, e.id, band);
    });
    return [...groups]
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, g]) => ({
        key,
        label: g.label,
        count: g.ids.length,
        ids: g.ids,
        color: profile.colors[key] ?? (key === NO_VALUE_KEY ? NO_VALUE_COLOR : rangeColor(bands > 1 ? g.order / (bands - 1) : 0.5)),
      }));
  }
  elements.forEach((e, i) => {
    const value = values[i];
    if (value === null) add(NO_VALUE_KEY, NO_VALUE_KEY, e.id, Infinity);
    else add(`v:${value}`, String(value), e.id, 0);
  });
  const sorted = [...groups].sort(([ka, a], [kb, b]) =>
    ka === NO_VALUE_KEY ? 1 : kb === NO_VALUE_KEY ? -1 : b.ids.length - a.ids.length || a.label.localeCompare(b.label),
  );
  return sorted.map(([key, g], i) => ({
    key,
    label: g.label,
    count: g.ids.length,
    ids: g.ids,
    color: profile.colors[key] ?? (key === NO_VALUE_KEY ? NO_VALUE_COLOR : CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]),
  }));
}

/** A manual look, keyed by IFC GlobalId in sessions. */
export interface ManualLook {
  guid: string;
  color?: string;
  /** 0 (invisible) … 1 (opaque). */
  opacity?: number;
}

export interface ResolvedAppearance {
  colors: Map<string, string>;
  opacities: Map<string, number>;
  /** Hidden through the legend's eye toggles. */
  hidden: Set<string>;
}

/**
 * Element id → colour / opacity: the profile first, the user's own looks on
 * top (a colour picked for one element wins over its legend colour).
 */
export function resolveAppearance(
  elements: BimElementData[],
  legend: LegendEntry[] | null,
  profile: AppearanceProfile | null,
  manual: ManualLook[],
): ResolvedAppearance {
  const colors = new Map<string, string>();
  const opacities = new Map<string, number>();
  const hidden = new Set<string>();
  if (legend && profile) {
    const hiddenKeys = new Set(profile.hidden);
    for (const entry of legend)
      for (const id of entry.ids) {
        colors.set(id, entry.color);
        if (hiddenKeys.has(entry.key)) hidden.add(id);
      }
  }
  if (manual.length) {
    const byGuid = new Map(manual.map((look) => [look.guid, look]));
    for (const element of elements) {
      const look = byGuid.get(element.guid);
      if (!look) continue;
      if (look.color) colors.set(element.id, look.color);
      if (look.opacity !== undefined && look.opacity < 1) opacities.set(element.id, Math.max(0, look.opacity));
    }
  }
  return { colors, opacities, hidden };
}

/**
 * Changes the look of these GUIDs: a value sets that part, null clears it,
 * undefined keeps it (setting a colour keeps a transparency set earlier).
 * Looks left with nothing are dropped.
 */
export function setManualLooks(
  manual: ManualLook[],
  guids: string[],
  patch: { color?: string | null; opacity?: number | null },
): ManualLook[] {
  const byGuid = new Map(manual.map((look) => [look.guid, look]));
  for (const guid of guids) {
    const look: ManualLook = { ...byGuid.get(guid), guid };
    if (patch.color === null) delete look.color;
    else if (patch.color !== undefined) look.color = patch.color;
    if (patch.opacity === null || (patch.opacity !== undefined && patch.opacity >= 1)) delete look.opacity;
    else if (patch.opacity !== undefined) look.opacity = Math.max(0, patch.opacity);
    if (look.color === undefined && look.opacity === undefined) byGuid.delete(guid);
    else byGuid.set(guid, look);
  }
  return [...byGuid.values()];
}
