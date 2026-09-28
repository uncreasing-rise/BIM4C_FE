"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";

export function BimShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale } = useLanguage();
  const s = ui(locale).bimShortcuts;
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const mouse: [string, string][] = [
    [s.orbitInput, s.orbit],
    [s.panInput, s.pan],
    [s.zoomInput, s.zoom],
    [s.selectInput, s.select],
    [s.multiSelectInput, s.multiSelect],
    [s.boxSelectInput, s.boxSelect],
    [s.focusInput, s.focus],
    [s.menuInput, s.menu],
  ];
  const keys: [string, string][] = [
    ["F", s.keyFocus],
    ["I", s.keyIsolate],
    ["H", s.keyHide],
    ["U", s.keyShowAll],
    ["Home", s.keyHome],
    ["Esc", s.keyEscape],
    ["Enter", s.keyFinishMeasure],
    ["Backspace", s.keyUndoPoint],
    ["Ctrl+Z / Ctrl+Y", s.keyUndoMeasure],
    ["X Y Z P L", s.keyMeasureLocks],
  ];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={s.title}
      className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-xl border border-white/15 bg-slate-950 p-0 text-xs text-slate-100 shadow-2xl backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-bold">{s.title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={s.close}
          className="grid size-8 place-items-center rounded-lg hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="grid gap-5 p-4 sm:grid-cols-2">
        {([
          [s.mouse, mouse],
          [s.keyboard, keys],
        ] as const).map(([title, rows]) => (
          <section key={title}>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-teal-300">{title}</h3>
            <dl className="space-y-1.5">
              {rows.map(([input, action]) => (
                <div key={input} className="flex items-start justify-between gap-3">
                  <dt className="text-slate-300">{action}</dt>
                  <dd>
                    <kbd className="whitespace-nowrap rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
                      {input}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <p className="border-t border-white/10 px-4 py-3 text-slate-400">{s.touch}</p>
    </dialog>
  );
}
