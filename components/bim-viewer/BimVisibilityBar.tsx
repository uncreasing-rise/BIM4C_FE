"use client";

import { Eye, Scan } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";

/** Always-visible reminder that part of the model is isolated or hidden. */
export function BimVisibilityBar({
  isolatedCount,
  hiddenCount,
  onExitIsolation,
  onShowAll,
}: {
  isolatedCount: number;
  hiddenCount: number;
  onExitIsolation: () => void;
  onShowAll: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimVisibility;
  if (!isolatedCount && !hiddenCount) return null;
  return (
    <div
      role="status"
      className="pointer-events-auto absolute left-1/2 top-3 z-20 flex max-w-[calc(100%-10rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-slate-950/90 py-1 pl-3 pr-1 text-xs text-slate-100 shadow-lg"
    >
      {isolatedCount > 0 ? (
        <Scan className="size-3.5 shrink-0 text-teal-300" />
      ) : (
        <Eye className="size-3.5 shrink-0 text-amber-300" />
      )}
      <span className="truncate">
        {[
          isolatedCount ? s.isolating(isolatedCount) : null,
          hiddenCount ? s.hidden(hiddenCount) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </span>
      {isolatedCount > 0 && (
        <button
          type="button"
          onClick={onExitIsolation}
          className="shrink-0 rounded-full bg-teal-400 px-2.5 py-1 font-semibold text-slate-950 hover:bg-teal-300"
        >
          {s.exitIsolation}
        </button>
      )}
      <button
        type="button"
        onClick={onShowAll}
        className="shrink-0 rounded-full border border-white/20 px-2.5 py-1 hover:bg-white/10"
      >
        {s.showAll} <kbd className="ml-1 font-mono text-[10px] text-slate-400">U</kbd>
      </button>
    </div>
  );
}
