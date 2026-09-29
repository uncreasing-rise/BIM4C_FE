"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Crosshair, Download, LogOut, Play, Square, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import { typePairKey, type ClashRules, type ClashSet } from "./clash-detection";
import {
  CLASH_STATUSES,
  clashReportCsv,
  groupClashes,
  type ClashGroupBy,
  type ClashHistoryItem,
  type ClashReviewEntry,
  type ClashRun,
} from "./clash-review";
import type { BimClashItem, BimElementData } from "./types";

export interface ClashTest {
  a: ClashSet;
  b: ClashSet;
  rules: ClashRules;
}

type Status = BimClashItem["status"];
type Severity = BimClashItem["severity"];

const PAGE = 200;

const SEVERITY_TONE: Record<Severity, string> = {
  high: "bg-red-500/20 text-red-200",
  medium: "bg-amber-500/20 text-amber-200",
  low: "bg-sky-500/20 text-sky-200",
};

/**
 * Clash detective in the manner of Navisworks: pick model A and model B (and
 * optionally element types), set the rules, run, then review the results —
 * grouped, filtered, assigned, annotated and followed across runs.
 */
export function BimClashPanel({
  models,
  test,
  onTestChange,
  clashes,
  activeClashId,
  running,
  checked,
  onRun,
  onCancel,
  onFocus,
  onStatus,
  sectionAround,
  onSectionAround,
  inClashView,
  onExit,
  onExportBcf,
  review,
  onReview,
  reviewer,
  onReviewer,
  newIds,
  runs,
  levelOf,
}: {
  models: { key: string; name: string; elements: BimElementData[] }[];
  test: ClashTest;
  onTestChange: (test: ClashTest) => void;
  clashes: BimClashItem[];
  activeClashId: string | null;
  running: boolean;
  /** The current test has been run (so an empty list means no clashes). */
  checked: boolean;
  onRun: () => void;
  onCancel: () => void;
  onFocus: (clash: BimClashItem) => void;
  onStatus: (id: string, status: Status) => void;
  sectionAround: boolean;
  onSectionAround: (on: boolean) => void;
  inClashView: boolean;
  onExit: () => void;
  /** Download every result as BCF 2.1 topics with a viewpoint on the clash. */
  onExportBcf: () => void;
  review: Record<string, ClashReviewEntry>;
  /** Assignment or note changes on one clash (recorded in its history). */
  onReview: (id: string, change: Omit<ClashHistoryItem, "at">) => void;
  reviewer: string;
  onReviewer: (name: string) => void;
  /** Clashes the last run found for the first time. */
  newIds: ReadonlySet<string>;
  runs: ClashRun[];
  levelOf: (elementId: string) => string;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimClash;
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [model, setModel] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [groupBy, setGroupBy] = useState<ClashGroupBy>("elementA");
  const [radius, setRadius] = useState(3);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pairA, setPairA] = useState("");
  const [pairB, setPairB] = useState("");
  /** Rows drawn; thousands of results render in pages of PAGE. */
  const [limit, setLimit] = useState(PAGE);

  const typesOf = useMemo(() => {
    const map = new Map<string, [string, number][]>();
    for (const m of models) {
      const counts = new Map<string, number>();
      for (const e of m.elements) counts.set(e.ifcType, (counts.get(e.ifcType) ?? 0) + 1);
      map.set(m.key, [...counts].sort((x, y) => x[0].localeCompare(y[0])));
    }
    return map;
  }, [models]);
  const allTypes = useMemo(() => [...new Set([...typesOf.values()].flat().map(([t]) => t))].sort(), [typesOf]);
  const nameOf = (key?: string) => models.find((m) => m.key === key)?.name ?? key ?? "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clashes.filter(
      (c) =>
        (severity === "all" || c.severity === severity) &&
        (status === "all" || c.status === status) &&
        (model === "all" || c.modelA === model || c.modelB === model) &&
        (!q ||
          [c.title, c.typeA, c.typeB, review[c.id]?.assignee, review[c.id]?.note].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [clashes, model, query, review, severity, status]);
  const groups = useMemo(() => groupClashes(filtered, groupBy, levelOf, radius), [filtered, groupBy, levelOf, radius]);
  const ordered = useMemo(() => groups.flatMap((g) => g.clashes), [groups]);
  const shown = useMemo(() => {
    const out: typeof groups = [];
    let rows = 0;
    for (const group of groups) {
      if (rows >= limit) break;
      out.push({ ...group, clashes: group.clashes.slice(0, limit - rows) });
      rows += group.clashes.length;
    }
    return out;
  }, [groups, limit]);

  // [ and ] step through the filtered results.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select")) return;
      if (e.key !== "[" && e.key !== "]") return;
      if (!ordered.length) return;
      e.preventDefault();
      const at = ordered.findIndex((c) => c.id === activeClashId);
      const next = e.key === "]" ? (at + 1) % ordered.length : at <= 0 ? ordered.length - 1 : at - 1;
      onFocus(ordered[next]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeClashId, onFocus, ordered]);

  const exportReport = () => {
    const csv = clashReportCsv(
      groups.map((g) => ({ ...g, label: groupBy === "proximity" ? s.area(g.label) : g.label })),
      review,
      { headers: s.reportHeaders, status: s.statuses, severity: s.severities },
      (id) => newIds.has(id),
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `BIM4C-clash-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const field = "h-8 w-full rounded-md border border-white/15 bg-slate-900 px-2 outline-none focus:border-teal-400";
  const side = (which: "a" | "b") => {
    const set = test[which];
    const types = typesOf.get(set.modelKey) ?? [];
    const chosen = new Set(set.types ?? []);
    const setSide = (next: ClashSet) => onTestChange({ ...test, [which]: next });
    return (
      <fieldset className="min-w-0 space-y-1.5 rounded-lg border border-white/10 p-2">
        <legend className={`px-1 font-bold ${which === "a" ? "text-red-300" : "text-green-300"}`}>
          {which === "a" ? s.modelA : s.modelB}
        </legend>
        <select
          className={field}
          value={set.modelKey}
          aria-label={which === "a" ? s.modelA : s.modelB}
          onChange={(e) => setSide({ modelKey: e.target.value })}
        >
          {models.map((m) => (
            <option key={m.key} value={m.key}>
              {m.name}
            </option>
          ))}
        </select>
        <details className="rounded-md border border-white/10">
          <summary className="cursor-pointer px-2 py-1 text-slate-300">
            {chosen.size ? s.typesChosen(chosen.size) : s.allTypes}
          </summary>
          <div className="max-h-40 space-y-0.5 overflow-y-auto px-2 pb-2">
            {types.map(([type, count]) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-3.5 accent-teal-400"
                  checked={chosen.has(type)}
                  onChange={() => {
                    const next = new Set(chosen);
                    if (next.has(type)) next.delete(type);
                    else next.add(type);
                    setSide({ ...set, types: [...next] });
                  }}
                />
                <span className="min-w-0 flex-1 truncate">{type}</span>
                <span className="text-slate-400">{count}</span>
              </label>
            ))}
          </div>
        </details>
      </fieldset>
    );
  };

  if (!models.length) return <p className="text-slate-400">{s.needModel}</p>;
  const rules = test.rules;
  const setRules = (next: Partial<ClashRules>) => onTestChange({ ...test, rules: { ...rules, ...next } });
  const mm = (m: number) => Math.round(m * 1000);
  const ignored = rules.ignoredTypePairs ?? [];
  const time = (iso: string) =>
    new Date(iso).toLocaleString(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="space-y-3">
      <section className="space-y-2" aria-label={s.setup}>
        <div className="grid grid-cols-2 gap-2">
          {side("a")}
          {side("b")}
        </div>
        <fieldset className="space-y-2 rounded-lg border border-white/10 p-2">
          <legend className="px-1 font-bold">{s.rules}</legend>
          <div className="grid grid-cols-2 gap-1" role="radiogroup">
            {(["hard", "clearance"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                role="radio"
                aria-checked={rules.kind === kind}
                onClick={() => setRules({ kind })}
                className={`min-h-8 rounded-lg border px-2 ${rules.kind === kind ? "border-teal-400 bg-teal-500/15 text-teal-200" : "border-white/10 hover:bg-white/5"}`}
              >
                {s[kind]}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="mb-0.5 block text-slate-400">{rules.kind === "hard" ? s.toleranceMm : s.clearanceMm}</span>
            <input
              type="number"
              min={0}
              step={5}
              className={field}
              value={mm(rules.kind === "hard" ? rules.tolerance : rules.clearance)}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value) || 0) / 1000;
                setRules(rules.kind === "hard" ? { tolerance: value } : { clearance: value });
              }}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-teal-400"
              checked={rules.ignoreSameDiscipline}
              onChange={(e) => setRules({ ignoreSameDiscipline: e.target.checked })}
            />
            {s.ignoreSameDiscipline}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-teal-400"
              checked={rules.ignoreSameAssembly ?? false}
              onChange={(e) => setRules({ ignoreSameAssembly: e.target.checked })}
            />
            {s.ignoreSameAssembly}
          </label>
          <div className="space-y-1">
            <span className="block text-slate-400">{s.ignoredPairs}</span>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-1">
              {[
                [pairA, setPairA],
                [pairB, setPairB],
              ].map(([value, set], i) => (
                <select
                  key={i}
                  aria-label={`${s.ignoredPairs} ${i + 1}`}
                  className={field}
                  value={value as string}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                >
                  <option value="">—</option>
                  {allTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ))}
              <button
                type="button"
                disabled={!pairA || !pairB || ignored.some((p) => p === typePairKey(pairA, pairB))}
                onClick={() => setRules({ ignoredTypePairs: [...ignored, typePairKey(pairA, pairB)] })}
                className="h-8 rounded-md border border-white/15 px-2 hover:bg-white/10 disabled:opacity-40"
              >
                {s.addPair}
              </button>
            </div>
            {ignored.length > 0 && (
              <ul className="flex flex-wrap gap-1">
                {ignored.map((pair) => {
                  const label = pair.replace("|", " × ");
                  return (
                    <li key={pair} className="flex items-center gap-1 rounded bg-white/10 py-0.5 pl-2 pr-0.5 text-[11px]">
                      {label}
                      <button
                        type="button"
                        aria-label={s.removePair(label)}
                        onClick={() => setRules({ ignoredTypePairs: ignored.filter((p) => p !== pair) })}
                        className="grid size-5 place-items-center rounded hover:bg-white/10"
                      >
                        <X className="size-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </fieldset>
        {running ? (
          <button type="button" onClick={onCancel} className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/15 hover:bg-white/5">
            <Square className="size-4" /> {s.cancel}
          </button>
        ) : (
          <button type="button" onClick={onRun} className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-teal-400 font-semibold text-slate-950 hover:bg-teal-300">
            <Play className="size-4" /> {s.run}
          </button>
        )}
        {runs.length > 0 && (
          <details className="rounded-lg border border-white/10">
            <summary className="cursor-pointer px-2 py-1 font-bold">
              {s.runs} ({runs.length})
            </summary>
            <ol className="max-h-32 space-y-1 overflow-y-auto px-2 pb-2 text-[11px] text-slate-300">
              {[...runs].reverse().map((run) => (
                <li key={run.at}>
                  <span className="text-slate-400">{time(run.at)}</span> · {run.label}
                  <br />
                  {s.runLine(run.total, run.added, run.active, run.resolved)}
                </li>
              ))}
            </ol>
          </details>
        )}
      </section>

      {clashes.length ? (
        <section className="space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            <select className={field} aria-label={s.filterBy(s.severity)} value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "all")}>
              <option value="all">{s.severity}: {s.all}</option>
              {(["high", "medium", "low"] as const).map((v) => (
                <option key={v} value={v}>{s.severities[v]}</option>
              ))}
            </select>
            <select className={field} aria-label={s.filterBy(s.status)} value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
              <option value="all">{s.status}: {s.all}</option>
              {CLASH_STATUSES.map((v) => (
                <option key={v} value={v}>{s.statuses[v]}</option>
              ))}
            </select>
            <select className={field} aria-label={s.filterBy(s.model)} value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="all">{s.model}: {s.all}</option>
              {models.map((m) => (
                <option key={m.key} value={m.key}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-1.5">
            <select className={field} aria-label={s.groupBy} value={groupBy} onChange={(e) => setGroupBy(e.target.value as ClashGroupBy)}>
              {(["elementA", "level", "typePair", "proximity"] as const).map((g) => (
                <option key={g} value={g}>
                  {s.groupBy}: {s.groupings[g]}
                </option>
              ))}
            </select>
            {groupBy === "proximity" && (
              <input
                type="number"
                min={0.5}
                step={0.5}
                aria-label={s.proximityRadius}
                title={s.proximityRadius}
                className={`${field} w-20`}
                value={radius}
                onChange={(e) => setRadius(Math.max(0.5, Number(e.target.value) || 3))}
              />
            )}
          </div>
          <input className={field} placeholder={s.search} aria-label={s.search} value={query} onChange={(e) => setQuery(e.target.value)} />
          <label className="flex items-center gap-2">
            <span className="shrink-0 text-slate-400">{s.reviewer}</span>
            <input className={field} placeholder={s.reviewerPlaceholder} value={reviewer} onChange={(e) => onReviewer(e.target.value)} />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
            <span>{s.results(filtered.length, clashes.length)}</span>
            <div className="ml-auto flex gap-1">
              <button type="button" onClick={exportReport} className="flex min-h-7 items-center gap-1 rounded border border-white/15 px-2 hover:bg-white/10">
                <Download className="size-3.5" /> {s.reportCsv}
              </button>
              <button type="button" onClick={onExportBcf} className="min-h-7 rounded border border-white/15 px-2 hover:bg-white/10">
                {s.exportBcf}
              </button>
            </div>
            <label className="flex w-full items-center gap-1.5">
              <input type="checkbox" className="size-3.5 accent-teal-400" checked={sectionAround} onChange={(e) => onSectionAround(e.target.checked)} />
              {s.sectionAround}
            </label>
          </div>
          {inClashView && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-teal-400/40 bg-teal-500/10 px-2 py-1.5">
              <span className="text-teal-100">{s.legend}</span>
              <button type="button" onClick={onExit} className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 hover:bg-white/10">
                <LogOut className="size-3.5" /> {s.exit}
              </button>
            </div>
          )}
          <p className="text-[11px] text-slate-400">{s.keys}</p>
          {!filtered.length && <p className="text-slate-400">{s.noMatch}</p>}
          <ul className="space-y-2">
            {shown.map((group) => (
              <li key={group.key} className="rounded-lg border border-white/10">
                <p className="truncate border-b border-white/10 px-2 py-1 font-semibold text-red-200" title={group.label}>
                  {groupBy === "proximity" ? s.area(group.label) : group.label}{" "}
                  <span className="font-normal text-slate-400">· {groups.find((g) => g.key === group.key)?.clashes.length}</span>
                </p>
                <ul>
                  {group.clashes.map((c) => {
                    const active = c.id === activeClashId;
                    const entry = review[c.id];
                    const open = expanded === c.id;
                    return (
                      <li key={c.id} className={active ? "bg-teal-500/15" : ""}>
                        <div className="flex items-center gap-1.5 px-2 py-1.5">
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-label={s.history}
                            onClick={() => setExpanded(open ? null : c.id)}
                            className="grid size-5 shrink-0 place-items-center rounded hover:bg-white/10"
                          >
                            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                          </button>
                          <button type="button" onClick={() => onFocus(c)} aria-pressed={active} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                            <Crosshair className={`size-3.5 shrink-0 ${active ? "text-teal-300" : "text-slate-400"}`} />
                            <span className={`shrink-0 rounded px-1 text-[11px] ${SEVERITY_TONE[c.severity]}`}>{s.severities[c.severity]}</span>
                            {newIds.has(c.id) && (
                              <span className="shrink-0 rounded bg-fuchsia-500/25 px-1 text-[11px] text-fuchsia-100">{s.newBadge}</span>
                            )}
                            <span className="min-w-0 flex-1 truncate text-green-200" title={c.description}>
                              {groupBy === "elementA" ? (c.title.split(" × ")[1] ?? c.title) : c.title}
                            </span>
                            {entry?.assignee && <span className="max-w-20 shrink-0 truncate text-[11px] text-sky-200">@{entry.assignee}</span>}
                            {c.kind === "clearance" && c.distance !== undefined && (
                              <span className="shrink-0 font-mono text-slate-400">
                                {s.gap} {mm(c.distance)} mm
                              </span>
                            )}
                          </button>
                          <select
                            aria-label={s.status}
                            value={c.status}
                            onChange={(e) => onStatus(c.id, e.target.value as Status)}
                            className="h-7 shrink-0 rounded border border-white/15 bg-slate-900 px-1 text-[11px]"
                          >
                            {CLASH_STATUSES.map((v) => (
                              <option key={v} value={v}>{s.statuses[v]}</option>
                            ))}
                          </select>
                        </div>
                        {open && (
                          <div className="space-y-1.5 border-t border-white/5 px-2 py-2">
                            <label className="flex items-center gap-2">
                              <span className="w-16 shrink-0 text-slate-400">{s.assignee}</span>
                              <input
                                className={field}
                                defaultValue={entry?.assignee ?? ""}
                                onBlur={(e) => {
                                  if (e.target.value !== (entry?.assignee ?? "")) onReview(c.id, { assignee: e.target.value });
                                }}
                              />
                            </label>
                            <label className="block">
                              <span className="text-slate-400">{s.note}</span>
                              <textarea
                                rows={2}
                                className="mt-0.5 w-full rounded-md border border-white/15 bg-slate-900 p-2 outline-none focus:border-teal-400"
                                defaultValue={entry?.note ?? ""}
                                onBlur={(e) => {
                                  if (e.target.value !== (entry?.note ?? "")) onReview(c.id, { note: e.target.value });
                                }}
                              />
                            </label>
                            {entry?.history.length ? (
                              <ol className="max-h-28 space-y-0.5 overflow-y-auto text-[11px] text-slate-400" aria-label={s.history}>
                                {[...entry.history].reverse().map((h, i) => (
                                  <li key={i}>
                                    {time(h.at)}
                                    {h.by && ` · ${h.by}`}
                                    {h.status && ` · ${s.statuses[h.status]}`}
                                    {h.auto && ` (${s.autoResolved})`}
                                    {h.assignee !== undefined && ` · ${s.assignee}: ${h.assignee || "—"}`}
                                    {h.note !== undefined && ` · ${s.note}: ${h.note || "—"}`}
                                  </li>
                                ))}
                              </ol>
                            ) : null}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {models.length > 1 && groupBy === "elementA" && (
                  <p className="border-t border-white/5 px-2 py-0.5 text-[11px] text-slate-400">
                    {nameOf(group.clashes[0].modelA)} × {nameOf(group.clashes[0].modelB)}
                  </p>
                )}
              </li>
            ))}
          </ul>
          {ordered.length > limit && (
            <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="min-h-8 w-full rounded-lg border border-white/15 hover:bg-white/5">
              {s.more(ordered.length - limit)}
            </button>
          )}
        </section>
      ) : (
        <p className={checked ? "text-emerald-300" : "text-slate-400"}>{checked ? s.noClashesFound : s.noResults}</p>
      )}
    </div>
  );
}
