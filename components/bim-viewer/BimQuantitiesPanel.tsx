"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Download, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import { quantityTakeoffAsync, takeoffCsv, type TakeoffGroup, type TakeoffRow } from "./quantities";
import type { BimElementData } from "./types";

type Scope = "all" | "visible" | "selection";

export function BimQuantitiesPanel({
  elements,
  hiddenIds,
  selectedIds,
  onSelect,
  onClose,
  geometryRevision = 0,
}: {
  elements: BimElementData[];
  /** Bumped when element triangles arrive (converted models): mesh volumes may now exist. */
  geometryRevision?: number;
  hiddenIds: ReadonlySet<string>;
  selectedIds: ReadonlySet<string>;
  onSelect: (ids: string[]) => void;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimQuantities;
  const [group, setGroup] = useState<TakeoffGroup>("type");
  const [scope, setScope] = useState<Scope>(selectedIds.size ? "selection" : "all");
  const scoped = useMemo(
    () =>
      elements.filter((e) =>
        scope === "all" ? true : scope === "visible" ? !hiddenIds.has(e.id) : selectedIds.has(e.id),
      ),
    [elements, hiddenIds, scope, selectedIds],
  );
  const [result, setResult] = useState<{ scoped: BimElementData[]; group: TakeoffGroup; revision: number; rows: TakeoffRow[]; failed?: boolean } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void quantityTakeoffAsync(scoped, group, controller.signal).then((rows) => {
      if (!controller.signal.aborted) setResult({ scoped, group, revision: geometryRevision, rows });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ scoped, group, revision: geometryRevision, rows: [], failed: true });
    });
    return () => controller.abort();
  }, [scoped, group, geometryRevision]);
  const busy = result?.scoped !== scoped || result.group !== group || result.revision !== geometryRevision;
  const rows = !busy && result ? result.rows : [];
  const total = rows.reduce(
    (t, r) => ({
      count: t.count + r.count,
      volume: t.volume + r.volume,
      area: t.area + r.area,
      length: t.length + r.length,
      missing: t.missing + r.withoutQuantities,
      fromGeometry: t.fromGeometry + r.volumeFromGeometry,
      unquantified: t.unquantified + r.unquantified,
      coverage: { volume: t.coverage.volume + r.coverage.volume, area: t.coverage.area + r.coverage.area, length: t.coverage.length + r.coverage.length },
    }),
    { count: 0, volume: 0, area: 0, length: 0, missing: 0, fromGeometry: 0, unquantified: 0, coverage: { volume: 0, area: 0, length: 0 } },
  );
  // The total gets a unit only when every contributing row agrees on it.
  const totalUnit = (kind: "volume" | "area" | "length") => {
    const units = new Set(rows.filter((r) => r.coverage[kind]).map((r) => r.units[kind]));
    return units.size === 1 ? ([...units][0] ?? "") : "";
  };
  const num = (v: number, coverage: number) =>
    coverage ? v.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 4 }) : "—";
  const exportCsv = () => {
    const csv = takeoffCsv(rows, [s.groups[group], s.count, s.volume, s.unit, s.area, s.unit, s.length, s.unit, s.missing, s.volumeFromGeometry]);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `BIM4C-khoi-luong-${group}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const segmented = (active: boolean) =>
    `min-h-8 flex-1 rounded-md px-2 ${active ? "bg-teal-500/20 text-teal-200 ring-1 ring-teal-400/50" : "hover:bg-white/5"}`;

  return (
    <section
      aria-label={s.title}
      aria-busy={busy}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="absolute left-2 bottom-2 z-30 flex max-h-[55%] sm:bottom-auto w-[calc(100%-1rem)] flex-col rounded-xl border border-white/15 bg-slate-950/95 text-xs text-slate-200 shadow-xl sm:left-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-[27rem]"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <h2 className="flex items-center gap-2 font-bold">
          <Calculator className="size-4 text-teal-300" />
          {s.title}
        </h2>
        <button type="button" aria-label={s.close} onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
          <X className="size-4" />
        </button>
      </div>
      <div className="shrink-0 space-y-2 p-3">
        <div className="flex gap-1 rounded-lg bg-white/5 p-1" role="radiogroup" aria-label={s.groupBy}>
          {(["type", "storey", "material"] as const).map((g) => (
            <button key={g} type="button" role="radio" aria-checked={group === g} onClick={() => setGroup(g)} className={segmented(group === g)}>
              {s.groups[g]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1" role="radiogroup" aria-label={s.scope}>
          {(["all", "visible", "selection"] as const).map((sc) => (
            <button
              key={sc}
              type="button"
              role="radio"
              aria-checked={scope === sc}
              disabled={sc === "selection" && !selectedIds.size}
              onClick={() => setScope(sc)}
              className={`${segmented(scope === sc)} disabled:opacity-40`}
            >
              {s.scopes[sc]}
            </button>
          ))}
        </div>
      </div>
      {busy && <p role="status" className="px-3 pb-3 text-teal-200">{s.calculating}</p>}
      {!busy && result?.failed && <p role="alert" className="px-3 pb-3 text-amber-200">{s.calculationFailed}</p>}
      <div hidden={busy || result?.failed} className="min-h-0 flex-1 overflow-auto px-3">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-2 pr-2 font-semibold">{s.groups[group]}</th>
              <th className="px-1 py-2 text-right font-semibold">{s.count}</th>
              <th className="px-1 py-2 text-right font-semibold">{s.volume}</th>
              <th className="px-1 py-2 text-right font-semibold">{s.area}</th>
              <th className="py-2 pl-1 text-right font-semibold">{s.length}</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px]">
            {rows.map((r) => (
              <tr
                key={r.key}
                onClick={() => onSelect(r.ids)}
                className="cursor-pointer border-t border-white/5 hover:bg-teal-500/10"
                title={s.selectRow}
              >
                <td className="max-w-40 truncate py-1.5 pr-2 font-sans text-slate-100">{r.key}</td>
                <td className="px-1 text-right">{r.count}</td>
                <td className="px-1 text-right" title={r.volumeFromGeometry ? s.fromGeometryTitle(r.volumeFromGeometry) : undefined}>{r.volumeFromGeometry ? "≈ " : ""}{num(r.volume, r.coverage.volume)} {r.units.volume}</td>
                <td className="px-1 text-right">{num(r.area, r.coverage.area)} {r.units.area}</td>
                <td className="pl-1 text-right">{num(r.length, r.coverage.length)} {r.units.length}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-slate-950 font-mono text-[11px] font-bold text-teal-200">
            <tr className="border-t border-white/20">
              <td className="py-2 pr-2 font-sans">{s.total}</td>
              <td className="px-1 text-right">{total.count}</td>
              <td className="px-1 text-right">{total.fromGeometry ? "≈ " : ""}{num(total.volume, total.coverage.volume)} {totalUnit("volume")}</td>
              <td className="px-1 text-right">{num(total.area, total.coverage.area)} {totalUnit("area")}</td>
              <td className="pl-1 text-right">{num(total.length, total.coverage.length)} {totalUnit("length")}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div hidden={busy || result?.failed} className="shrink-0 space-y-2 border-t border-white/10 p-3">
        <p className="text-[11px] text-amber-200" role="status">
          {s.coverage}: {s.volume} {total.coverage.volume}/{total.count} · {s.area} {total.coverage.area}/{total.count} · {s.length} {total.coverage.length}/{total.count}.
        </p>
        <p className="text-[11px] leading-snug text-slate-400">
          {s.sourceNote}
          {total.unquantified > 0 && <> {s.missingNote(total.unquantified)}</>}
          {total.fromGeometry > 0 && <> {s.geometryNote(total.fromGeometry)}</>}
        </p>
        {scope === "visible" && <p className="text-[11px] leading-snug text-slate-400">{s.scopeNote}</p>}
        <button
          type="button"
          onClick={exportCsv}
          disabled={!rows.length}
          className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/15 hover:bg-white/10 disabled:opacity-40"
        >
          <Download className="size-3.5" />
          {s.export}
        </button>
      </div>
    </section>
  );
}
