"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";

type GuideTab = "navigation" | "setups" | "capacity";
const TABS: GuideTab[] = ["navigation", "setups", "capacity"];

const heading = "mb-2 text-[11px] font-semibold uppercase tracking-wider text-teal-300";
const code = "rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[11px]";

export function BimShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale } = useLanguage();
  const s = ui(locale).bimShortcuts;
  const g = ui(locale).bimGuide;
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<GuideTab>("navigation");

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
      className="m-auto max-h-[min(44rem,calc(100%-2rem))] w-[min(46rem,calc(100%-2rem))] flex-col rounded-xl border border-white/15 bg-slate-950 p-0 text-xs text-slate-100 shadow-2xl backdrop:bg-black/60 open:flex"
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
      <div role="tablist" aria-label={s.title} className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 pt-2">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`bim-guide-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`bim-guide-panel-${id}`}
            onClick={() => setTab(id)}
            className={`whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2 font-semibold transition-colors ${
              tab === id ? "border-teal-300 text-teal-200" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {g.tabs[id]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`bim-guide-panel-${tab}`}
        aria-labelledby={`bim-guide-tab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {tab === "navigation" && (
          <>
            <div className="grid gap-5 p-4 sm:grid-cols-2">
              {([
                [s.mouse, mouse],
                [s.keyboard, keys],
              ] as const).map(([title, rows]) => (
                <section key={title}>
                  <h3 className={heading}>{title}</h3>
                  <dl className="space-y-1.5">
                    {rows.map(([input, action]) => (
                      <div key={input} className="flex items-start justify-between gap-3">
                        <dt className="text-slate-300">{action}</dt>
                        <dd>
                          <kbd className={`whitespace-nowrap ${code}`}>{input}</kbd>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
            <p className="border-t border-white/10 px-4 py-3 text-slate-400">{s.touch}</p>
          </>
        )}

        {tab === "setups" && (
          <div className="space-y-5 p-4">
            <p className="text-slate-300">{g.setupsIntro}</p>
            <div className="grid gap-3 md:grid-cols-3">
              {g.setups.map((setup) => (
                <section key={setup.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <h3 className="mb-2 text-sm font-bold text-teal-200">{setup.name}</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-slate-500">{g.device}</dt>
                      <dd className="text-slate-200">{setup.device}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-slate-500">{g.model}</dt>
                      <dd className="text-slate-200">{setup.model}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-slate-500">{g.settings}</dt>
                      <dd>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-300">
                          {setup.settings.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </section>
              ))}
            </div>
            <section>
              <h3 className={heading}>{g.urlTitle}</h3>
              <dl className="space-y-2">
                {g.urlParams.map(([param, description]) => (
                  <div key={param} className="grid gap-1 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-3">
                    <dt>
                      <code className={`break-all ${code}`}>{param}</code>
                    </dt>
                    <dd className="text-slate-300">{description}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        )}

        {tab === "capacity" && (
          <div className="space-y-5 p-4">
            <p className="text-slate-300">{g.capacityIntro}</p>
            <section>
              <h3 className={heading}>{g.limitsTitle}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] border-collapse text-left">
                  <tbody>
                    {g.limits.map(([item, value, note]) => (
                      <tr key={item} className="border-b border-white/10 align-top last:border-0">
                        <th scope="row" className="py-2 pr-3 font-semibold text-slate-200">{item}</th>
                        <td className="whitespace-nowrap py-2 pr-3 font-mono text-teal-200">{value}</td>
                        <td className="py-2 text-slate-400">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <h3 className={heading}>{g.benchmarksTitle}</h3>
              <dl className="space-y-2">
                {g.benchmarks.map(([scenario, result]) => (
                  <div key={scenario} className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-3">
                    <dt className="font-semibold text-slate-200">{scenario}</dt>
                    <dd className="text-slate-300">{result}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-slate-500">{g.benchmarkNote}</p>
            </section>
            <section>
              <h3 className={heading}>{g.tipsTitle}</h3>
              <ul className="list-disc space-y-1 pl-4 text-slate-300">
                {g.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </dialog>
  );
}
