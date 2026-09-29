"use client";

import { useState } from "react";
import { GitCompareArrows, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import { DIFF_COLORS, type ModelDiff } from "./compare";
import type { FederatedModel } from "./types";

export interface ComparisonState {
  oldKey: string;
  newKey: string;
  diff: ModelDiff;
}

export function BimComparePanel({
  models,
  comparison,
  onCompare,
  onExit,
  onSelect,
  onClose,
}: {
  models: FederatedModel[];
  comparison: ComparisonState | null;
  onCompare: (oldKey: string, newKey: string) => void | Promise<void>;
  onExit: () => void;
  onSelect: (ids: string[]) => void;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimCompare;
  const [oldKey, setOldKey] = useState(comparison?.oldKey ?? models[0]?.key ?? "");
  const [newKey, setNewKey] = useState(comparison?.newKey ?? models[1]?.key ?? "");
  const [busy, setBusy] = useState(false);
  const name = (key: string) => models.find((m) => m.key === key)?.model.filename ?? key;
  const select = "min-h-9 w-full rounded-lg border border-white/15 bg-slate-900 px-2";
  const groups = comparison
    ? ([
        ["added", comparison.diff.added],
        ["removed", comparison.diff.removed],
        ["geometry", comparison.diff.geometry],
        ["properties", comparison.diff.properties],
      ] as const)
    : [];

  return (
    <section
      aria-label={s.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="absolute left-2 bottom-2 z-30 max-h-[55%] sm:bottom-auto w-[calc(100%-1rem)] overflow-y-auto rounded-xl border border-white/15 bg-slate-950/95 p-4 text-xs text-slate-200 shadow-xl sm:left-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-80"
    >
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <h2 className="flex items-center gap-2 font-bold">
          <GitCompareArrows className="size-4 text-teal-300" />
          {s.title}
        </h2>
        <button type="button" aria-label={s.close} onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
          <X className="size-4" />
        </button>
      </div>
      {models.length < 2 ? (
        <p className="leading-relaxed text-slate-400">{s.needTwo}</p>
      ) : (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-slate-400">{s.older}</span>
            <select value={oldKey} onChange={(e) => setOldKey(e.target.value)} className={select}>
              {models.map((m) => (
                <option key={m.key} value={m.key}>{m.model.filename ?? m.key}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-slate-400">{s.newer}</span>
            <select value={newKey} onChange={(e) => setNewKey(e.target.value)} className={select}>
              {models.map((m) => (
                <option key={m.key} value={m.key}>{m.model.filename ?? m.key}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={busy || !models.some((m) => m.key === oldKey) || !models.some((m) => m.key === newKey) || oldKey === newKey}
            aria-busy={busy}
            onClick={async () => { setBusy(true); try { await onCompare(oldKey, newKey); } finally { setBusy(false); } }}
            className="min-h-9 w-full rounded-lg bg-teal-400 font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-40"
          >
            {busy ? ui(locale).bimClash.preparingGeometry : s.run}
          </button>
          <p className="text-[11px] leading-snug text-slate-400">{s.help}</p>
          {comparison && (
            <div className="space-y-1 border-t border-white/10 pt-3">
              <p className="mb-1 text-[11px] text-slate-400">
                {name(comparison.oldKey)} → {name(comparison.newKey)} · {s.unchanged}: {comparison.diff.unchanged.length}
              </p>
              {groups.map(([kind, ids]) => (
                <button
                  key={kind}
                  type="button"
                  disabled={!ids.length}
                  onClick={() => onSelect(ids)}
                  className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-white/5 disabled:opacity-50"
                  title={s.selectGroup}
                >
                  <span className="size-3 shrink-0 rounded-sm" style={{ background: DIFF_COLORS[kind] }} />
                  <span className="flex-1">{s.kinds[kind]}</span>
                  <span className="font-mono">{ids.length}</span>
                </button>
              ))}
              <button type="button" onClick={onExit} className="mt-2 min-h-9 w-full rounded-lg border border-white/15 hover:bg-white/10">
                {s.exit}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
