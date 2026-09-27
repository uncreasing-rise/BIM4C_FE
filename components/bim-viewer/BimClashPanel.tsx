"use client";

import { useEffect, useMemo, useState } from "react";
import { Crosshair, LogOut, Play, Square } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import type { ClashRules, ClashSet } from "./clash-detection";
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
 * optionally element types), set the rules, run, then review the results
 * grouped by element with filters, status and keyboard stepping.
 */
export function BimClashPanel({
  models,
  test,
  onTestChange,
  clashes,
  activeClashId,
  running,
  onRun,
  onCancel,
  onFocus,
  onStatus,
  sectionAround,
  onSectionAround,
  inClashView,
  onExit,
}: {
  models: { key: string; name: string; elements: BimElementData[] }[];
  test: ClashTest;
  onTestChange: (test: ClashTest) => void;
  clashes: BimClashItem[];
  activeClashId: string | null;
  running: boolean;
  onRun: () => void;
  onCancel: () => void;
  onFocus: (clash: BimClashItem) => void;
  onStatus: (id: string, status: Status) => void;
  sectionAround: boolean;
  onSectionAround: (on: boolean) => void;
  inClashView: boolean;
  onExit: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimClash;
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [model, setModel] = useState<string>("all");
  const [query, setQuery] = useState("");
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
  const nameOf = (key?: string) => models.find((m) => m.key === key)?.name ?? key ?? "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clashes.filter(
      (c) =>
        (severity === "all" || c.severity === severity) &&
        (status === "all" || c.status === status) &&
        (model === "all" || c.modelA === model || c.modelB === model) &&
        (!q || [c.title, c.typeA, c.typeB].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [clashes, model, query, severity, status]);
  // Grouped by element A, the way a reviewer works through one element's conflicts.
  const groups = useMemo(() => {
    const map = new Map<string, BimClashItem[]>();
    for (const c of filtered) map.set(c.elementA, [...(map.get(c.elementA) ?? []), c]);
    return [...map.values()];
  }, [filtered]);
  const ordered = useMemo(() => groups.flat(), [groups]);
  const shown = useMemo(() => {
    const out: BimClashItem[][] = [];
    let rows = 0;
    for (const group of groups) {
      if (rows >= limit) break;
      out.push(group.slice(0, limit - rows));
      rows += group.length;
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
                <span className="text-slate-500">{count}</span>
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
      </section>

      {clashes.length ? (
        <section className="space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            <select className={field} aria-label={s.severity} value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "all")}>
              <option value="all">{s.severity}: {s.all}</option>
              {(["high", "medium", "low"] as const).map((v) => (
                <option key={v} value={v}>{s.severities[v]}</option>
              ))}
            </select>
            <select className={field} aria-label={s.status} value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
              <option value="all">{s.status}: {s.all}</option>
              {(["open", "in_review", "resolved"] as const).map((v) => (
                <option key={v} value={v}>{s.statuses[v]}</option>
              ))}
            </select>
            <select className={field} aria-label={s.model} value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="all">{s.model}: {s.all}</option>
              {models.map((m) => (
                <option key={m.key} value={m.key}>{m.name}</option>
              ))}
            </select>
          </div>
          <input className={field} placeholder={s.search} aria-label={s.search} value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex items-center justify-between gap-2 text-slate-400">
            <span>{s.results(filtered.length, clashes.length)}</span>
            <label className="flex items-center gap-1.5">
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
          <p className="text-[11px] text-slate-500">{s.keys}</p>
          {!filtered.length && <p className="text-slate-400">{s.noMatch}</p>}
          <ul className="space-y-2">
            {shown.map((group) => (
              <li key={group[0].elementA} className="rounded-lg border border-white/10">
                <p className="truncate border-b border-white/10 px-2 py-1 font-semibold text-red-200" title={group[0].title.split(" × ")[0]}>
                  {group[0].title.split(" × ")[0]} <span className="font-normal text-slate-500">· {group.length}</span>
                </p>
                <ul>
                  {group.map((c) => {
                    const active = c.id === activeClashId;
                    return (
                      <li key={c.id} className={`flex items-center gap-1.5 px-2 py-1.5 ${active ? "bg-teal-500/15" : ""}`}>
                        <button type="button" onClick={() => onFocus(c)} aria-pressed={active} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                          <Crosshair className={`size-3.5 shrink-0 ${active ? "text-teal-300" : "text-slate-500"}`} />
                          <span className={`shrink-0 rounded px-1 text-[10px] ${SEVERITY_TONE[c.severity]}`}>{s.severities[c.severity]}</span>
                          <span className="min-w-0 flex-1 truncate text-green-200" title={c.description}>
                            {c.title.split(" × ")[1] ?? c.title}
                          </span>
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
                          {(["open", "in_review", "resolved"] as const).map((v) => (
                            <option key={v} value={v}>{s.statuses[v]}</option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
                </ul>
                {models.length > 1 && (
                  <p className="border-t border-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                    {nameOf(group[0].modelA)} × {nameOf(group[0].modelB)}
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
        <p className="text-slate-400">{s.noResults}</p>
      )}
    </div>
  );
}
