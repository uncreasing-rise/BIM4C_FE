/**
 * Clash review in the manner of Navisworks' Clash Detective: grouping the
 * results, following them across test runs (new / active / resolved),
 * assignment, notes and a status history, and a CSV report. Pure data, so
 * the panel and the session share one set of rules.
 */
import type { BimClashItem } from "./types";

export type ClashStatus = BimClashItem["status"];
export const CLASH_STATUSES: ClashStatus[] = ["open", "in_review", "approved", "resolved"];

export type ClashGroupBy = "elementA" | "level" | "typePair" | "proximity";

export interface ClashHistoryItem {
  /** ISO time. */
  at: string;
  status?: ClashStatus;
  assignee?: string;
  note?: string;
  /** Reviewer name, when one was given. */
  by?: string;
  /** Set by a test run (a clash that no longer occurs), not by a person. */
  auto?: boolean;
}

export interface ClashReviewEntry {
  assignee?: string;
  note?: string;
  history: ClashHistoryItem[];
}

export interface ClashRun {
  at: string;
  /** What was tested, for the history list ("A × B · hard 10 mm"). */
  label: string;
  total: number;
  added: number;
  active: number;
  resolved: number;
}

export interface ClashGroup {
  key: string;
  label: string;
  clashes: BimClashItem[];
}

/** Keep a history this long per clash, and this many runs. */
export const HISTORY_LIMIT = 50;
export const RUNS_LIMIT = 30;

/**
 * Results in groups, largest first. Proximity joins clashes whose points are
 * within `radius` of each other (transitively), as a reviewer treats one
 * congested spot as one problem.
 */
export function groupClashes(
  clashes: BimClashItem[],
  by: ClashGroupBy,
  levelOf: (elementId: string) => string,
  radius = 3,
): ClashGroup[] {
  const groups = new Map<string, ClashGroup>();
  const add = (key: string, label: string, clash: BimClashItem) => {
    const group = groups.get(key) ?? { key, label, clashes: [] };
    group.clashes.push(clash);
    groups.set(key, group);
  };
  if (by === "proximity") {
    const parent = clashes.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    // Grid hash with cells of the radius: neighbours are in the 27 cells around.
    const cell = (v: number) => Math.floor(v / radius);
    const grid = new Map<string, number[]>();
    clashes.forEach((c, i) => {
      const [x, y, z] = c.point.map(cell);
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          for (let dz = -1; dz <= 1; dz++)
            for (const j of grid.get(`${x + dx},${y + dy},${z + dz}`) ?? [])
              if (Math.hypot(...c.point.map((v, k) => v - clashes[j].point[k])) <= radius) parent[find(i)] = find(j);
      const key = `${x},${y},${z}`;
      grid.set(key, [...(grid.get(key) ?? []), i]);
    });
    clashes.forEach((c, i) => add(`p${find(i)}`, "", c));
    // Areas are numbered from the busiest.
    return [...groups.values()]
      .sort((a, b) => b.clashes.length - a.clashes.length)
      .map((g, i) => ({ ...g, label: `#${i + 1}` }));
  }
  for (const c of clashes) {
    if (by === "elementA") add(c.elementA, c.title.split(" × ")[0], c);
    else if (by === "level") {
      const level = levelOf(c.elementA) || levelOf(c.elementB);
      add(level || "—", level || "—", c);
    } else {
      const pair = [c.typeA ?? "?", c.typeB ?? "?"].sort().join(" × ");
      add(pair, pair, c);
    }
  }
  return [...groups.values()].sort((a, b) => b.clashes.length - a.clashes.length || a.label.localeCompare(b.label));
}

/**
 * A new run against the previous one: which clashes are new, which remain,
 * and which no longer occur (they are resolved by the change that removed them).
 */
export function compareRuns(previousIds: string[] | null, currentIds: string[]) {
  const previous = new Set(previousIds ?? []);
  const current = new Set(currentIds);
  return {
    added: currentIds.filter((id) => !previous.has(id)),
    active: currentIds.filter((id) => previous.has(id)),
    gone: [...previous].filter((id) => !current.has(id)),
  };
}

/** Records a change on a clash: the new value and a history line. */
export function reviewChange(
  review: Record<string, ClashReviewEntry>,
  id: string,
  change: Omit<ClashHistoryItem, "at">,
  at = new Date().toISOString(),
): Record<string, ClashReviewEntry> {
  const entry = review[id] ?? { history: [] };
  return {
    ...review,
    [id]: {
      ...entry,
      ...(change.assignee !== undefined && { assignee: change.assignee || undefined }),
      ...(change.note !== undefined && { note: change.note || undefined }),
      history: [...entry.history, { at, ...change }].slice(-HISTORY_LIMIT),
    },
  };
}

const cell = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** The clash report as CSV (UTF-8 with BOM so spreadsheet apps read Vietnamese correctly). */
export function clashReportCsv(
  groups: ClashGroup[],
  review: Record<string, ClashReviewEntry>,
  labels: { headers: string[]; status: Record<ClashStatus, string>; severity: Record<BimClashItem["severity"], string> },
  isNew: (id: string) => boolean,
): string {
  const rows: unknown[][] = [labels.headers];
  for (const group of groups)
    for (const c of group.clashes) {
      const r = review[c.id];
      rows.push([
        group.label,
        c.title.split(" × ")[0],
        c.typeA,
        c.title.split(" × ")[1] ?? "",
        c.typeB,
        labels.severity[c.severity],
        labels.status[c.status] + (isNew(c.id) ? " *" : ""),
        c.kind === "clearance" && c.distance !== undefined ? Math.round(c.distance * 1000) : "",
        ...c.point.map((v) => v.toFixed(3)),
        r?.assignee ?? "",
        r?.note ?? "",
        r?.history.at(-1)?.at.slice(0, 16).replace("T", " ") ?? "",
      ]);
    }
  return "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
