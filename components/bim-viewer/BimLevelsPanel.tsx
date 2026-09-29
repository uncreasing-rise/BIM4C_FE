"use client";

import { Building2, LayoutGrid, MousePointerClick, Scan, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import { formatLength } from "./federation";
import type { BimLevel } from "./levels";

/** Autodesk-style Levels panel: plan cut, isolate or select one storey. */
export function BimLevelsPanel({
  levels,
  activeLevelId,
  elevationOffset,
  multipleModels,
  onPlan,
  onIsolate,
  onSelect,
  onClearPlan,
  onClose,
}: {
  levels: BimLevel[];
  activeLevelId: string | null;
  /** Scene y → IFC elevation. */
  elevationOffset: number;
  multipleModels: boolean;
  onPlan: (level: BimLevel) => void;
  onIsolate: (level: BimLevel) => void;
  onSelect: (level: BimLevel) => void;
  onClearPlan: () => void;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimLevels;
  const action =
    "grid size-7 shrink-0 place-items-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-teal-400";
  return (
    <section
      aria-label={s.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="absolute left-2 bottom-2 z-30 flex max-h-[55%] sm:bottom-auto w-[calc(100%-1rem)] flex-col rounded-xl border border-white/15 bg-slate-950/95 text-xs text-slate-200 shadow-xl sm:left-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-80"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <h2 className="flex items-center gap-2 font-bold">
          <Building2 className="size-4 text-teal-300" />
          {s.title} ({levels.length})
        </h2>
        <button type="button" aria-label={s.close} onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
          <X className="size-4" />
        </button>
      </div>
      <p className="shrink-0 px-4 pt-2 text-[11px] leading-snug text-slate-400">{s.help}</p>
      {levels.length === 0 ? (
        <p className="p-4 text-slate-400">{s.empty}</p>
      ) : (
        <ol className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
          {/* Highest first, like the storey list of a section drawing. */}
          {[...levels].reverse().map((level) => {
            const active = level.id === activeLevelId;
            return (
              <li
                key={level.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${active ? "bg-teal-500/15 ring-1 ring-teal-400/50" : "hover:bg-white/5"}`}
              >
                <button type="button" onClick={() => onPlan(level)} className="min-w-0 flex-1 text-left" title={s.plan}>
                  <span className={`block truncate font-semibold ${active ? "text-teal-200" : "text-slate-100"}`}>{level.name}</span>
                  <span className="block truncate font-mono text-[11px] text-slate-400">
                    {s.elevation} {formatLength(level.bottom + elevationOffset, locale, 2)} m · {level.ids.length} {s.elements}
                    {multipleModels ? ` · ${level.modelName}` : ""}
                  </span>
                </button>
                <button type="button" className={action} onClick={() => onPlan(level)} aria-label={`${s.plan}: ${level.name}`} title={s.plan}>
                  <LayoutGrid className="size-3.5" />
                </button>
                <button type="button" className={action} onClick={() => onIsolate(level)} aria-label={`${s.isolate}: ${level.name}`} title={s.isolate}>
                  <Scan className="size-3.5" />
                </button>
                <button type="button" className={action} onClick={() => onSelect(level)} aria-label={`${s.select}: ${level.name}`} title={s.select}>
                  <MousePointerClick className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
      {activeLevelId && (
        <div className="shrink-0 border-t border-white/10 p-2">
          <button type="button" onClick={onClearPlan} className="flex min-h-9 w-full items-center justify-center rounded-lg border border-white/15 hover:bg-white/10">
            {s.clearPlan}
          </button>
        </div>
      )}
    </section>
  );
}
