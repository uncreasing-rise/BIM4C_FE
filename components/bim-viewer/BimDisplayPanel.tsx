"use client";

import { RotateCcw, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import {
  DEFAULT_DISPLAY,
  ENVIRONMENTS,
  type DisplaySettings,
  type ViewerEnvironment,
} from "./render-pipeline";

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg p-2 hover:bg-white/5">
      <span>
        <span className="block font-semibold text-slate-100">{label}</span>
        <span className="block text-[11px] leading-snug text-slate-400">{hint}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-slate-700 transition-colors peer-checked:bg-teal-500 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-300 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  );
}

/** Autodesk-style viewer settings: visual style, lighting and projection. */
export function BimDisplayPanel({
  settings,
  onChange,
  onClose,
}: {
  settings: DisplaySettings;
  onChange: (next: DisplaySettings) => void;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimDisplay;
  const set = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) =>
    onChange({ ...settings, [key]: value });
  return (
    <section
      aria-label={s.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="absolute left-2 bottom-2 z-30 max-h-[55%] sm:bottom-auto w-[calc(100%-1rem)] overflow-y-auto rounded-xl border border-white/15 bg-slate-950/95 p-4 text-xs text-slate-200 shadow-xl sm:left-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-80"
    >
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <h2 className="font-bold">{s.title}</h2>
        <button type="button" aria-label={s.close} onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-white/10">
          <X className="size-4" />
        </button>
      </div>

      <h3 className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-teal-300">{s.visualStyle}</h3>
      <Switch label={s.edges} hint={s.edgesHint} checked={settings.edges} onChange={(v) => set("edges", v)} />
      <Switch label={s.ambientOcclusion} hint={s.ambientOcclusionHint} checked={settings.ambientOcclusion} onChange={(v) => set("ambientOcclusion", v)} />
      <Switch label={s.grid} hint={s.gridHint} checked={settings.grid} onChange={(v) => set("grid", v)} />
      <Switch label={s.sectionCaps} hint={s.sectionCapsHint} checked={settings.sectionCaps} onChange={(v) => set("sectionCaps", v)} />
      <Switch label={s.ifcGrids} hint={s.ifcGridsHint} checked={settings.ifcGrids} onChange={(v) => set("ifcGrids", v)} />
      <Switch label={s.minimap} hint={s.minimapHint} checked={settings.minimap} onChange={(v) => set("minimap", v)} />

      <h3 className="mb-2 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-teal-300">{s.projection}</h3>
      <div className="grid grid-cols-2 gap-1 px-2" role="radiogroup" aria-label={s.projection}>
        {(["perspective", "orthographic"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={settings.projection === value}
            onClick={() => set("projection", value)}
            className={`min-h-9 rounded-lg border px-2 ${settings.projection === value ? "border-teal-400 bg-teal-500/15 text-teal-200" : "border-white/10 hover:bg-white/5"}`}
          >
            {s[value]}
          </button>
        ))}
      </div>
      <p className="mt-1 px-2 text-[11px] text-slate-400">{s.projectionHint}</p>

      <h3 className="mb-2 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-teal-300">{s.environment}</h3>
      <div className="grid grid-cols-2 gap-2 px-2" role="radiogroup" aria-label={s.environment}>
        {(Object.keys(ENVIRONMENTS) as ViewerEnvironment[]).map((value) => {
          const env = ENVIRONMENTS[value];
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={settings.environment === value}
              onClick={() => set("environment", value)}
              className={`overflow-hidden rounded-lg border text-center ${settings.environment === value ? "border-teal-400 ring-2 ring-teal-400/30" : "border-white/10 hover:border-white/30"}`}
            >
              <span aria-hidden="true" className="block h-10" style={{ background: `linear-gradient(${env.top}, ${env.bottom})` }} />
              <span className="block py-1">{s.environments[value]}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange({ ...DEFAULT_DISPLAY })}
        className="mt-4 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/15 hover:bg-white/10"
      >
        <RotateCcw className="size-3.5" />
        {s.reset}
      </button>
    </section>
  );
}
