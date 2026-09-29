"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Palette, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import {
  listProperties,
  NO_VALUE_KEY,
  setManualLooks,
  type AppearanceProfile,
  type LegendEntry,
  type ManualLook,
  type ProfileField,
  type ProfileSource,
} from "./appearance";
import type { BimElementData } from "./types";

const FIELDS: ProfileField[] = ["ifcType", "storey", "material", "discipline", "model", "name"];
const sourceKey = (source: ProfileSource) => (source.kind === "field" ? `field:${source.field}` : `prop:${source.name}`);
const sourceFromKey = (key: string): ProfileSource =>
  key.startsWith("field:") ? { kind: "field", field: key.slice(6) as ProfileField } : { kind: "property", name: key.slice(5) };

/**
 * Appearance: colour the model by a value (the Appearance Profiler) and set
 * colour / transparency on the selected elements.
 */
export function BimAppearancePanel({
  elements,
  selectedIds,
  profile,
  legend,
  onProfile,
  manual,
  onManual,
  onSelect,
  onClose,
}: {
  elements: BimElementData[];
  selectedIds: ReadonlySet<string>;
  profile: AppearanceProfile | null;
  legend: LegendEntry[] | null;
  onProfile: (profile: AppearanceProfile | null) => void;
  manual: ManualLook[];
  onManual: (manual: ManualLook[]) => void;
  onSelect: (ids: string[]) => void;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimAppearance;
  const properties = useMemo(() => listProperties(elements), [elements]);
  const [draftSource, setDraftSource] = useState(() => sourceKey(profile?.source ?? { kind: "field", field: "ifcType" }));
  const [mode, setMode] = useState<AppearanceProfile["mode"]>(profile?.mode ?? "values");
  const [bands, setBands] = useState(profile?.bands ?? 5);
  const [color, setColor] = useState("#ef4444");
  const [transparency, setTransparency] = useState(50);
  const draft = sourceFromKey(draftSource);
  const numeric = draft.kind === "property" && properties.find((p) => p.name === draft.name)?.numeric;
  const selectedGuids = useMemo(
    () => elements.filter((e) => selectedIds.has(e.id)).map((e) => e.guid).filter(Boolean),
    [elements, selectedIds],
  );
  const segmented = (active: boolean) =>
    `min-h-8 flex-1 rounded-md px-2 ${active ? "bg-teal-500/20 text-teal-200 ring-1 ring-teal-400/50" : "hover:bg-white/5"}`;
  const button =
    "flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 hover:bg-white/10 disabled:opacity-40";
  const apply = () =>
    onProfile({
      source: draft,
      mode: numeric ? mode : "values",
      bands,
      // A new source starts from generated colours; the same one keeps the user's picks.
      colors: profile && sourceKey(profile.source) === draftSource ? profile.colors : {},
      hidden: profile && sourceKey(profile.source) === draftSource ? profile.hidden : [],
    });
  const patchManual = (patch: { color?: string | null; opacity?: number | null }) =>
    onManual(setManualLooks(manual, selectedGuids, patch));

  return (
    <section
      aria-label={s.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="absolute left-2 bottom-2 z-30 flex max-h-[55%] sm:bottom-auto w-[calc(100%-1rem)] flex-col rounded-xl border border-white/15 bg-slate-950/95 text-xs text-slate-200 shadow-xl sm:left-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-[24rem]"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <h2 className="flex items-center gap-2 font-bold">
          <Palette className="size-4 text-teal-300" />
          {s.title}
        </h2>
        <button type="button" aria-label={s.close} onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
          <X className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        <fieldset className="space-y-2">
          <legend className="mb-1 font-bold">{s.profiler}</legend>
          <label className="block">
            <span className="text-slate-400">{s.colourBy}</span>
            <select
              value={draftSource}
              onChange={(e) => setDraftSource(e.target.value)}
              className="mt-1 min-h-9 w-full rounded-lg border border-white/15 bg-slate-900 px-2"
            >
              <optgroup label={s.fieldsGroup}>
                {FIELDS.map((field) => (
                  <option key={field} value={`field:${field}`}>
                    {s.fields[field]}
                  </option>
                ))}
              </optgroup>
              {properties.length > 0 && (
                <optgroup label={s.propertiesGroup}>
                  {properties.map((p) => (
                    <option key={p.name} value={`prop:${p.name}`}>
                      {p.name} ({p.count})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
          {numeric && (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1 rounded-lg bg-white/5 p-1" role="radiogroup" aria-label={s.mode}>
                {(["values", "ranges"] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={segmented(mode === m)}>
                    {s.modes[m]}
                  </button>
                ))}
              </div>
              {mode === "ranges" && (
                <label className="flex items-center gap-1">
                  <span className="text-slate-400">{s.bands}</span>
                  <select value={bands} onChange={(e) => setBands(Number(e.target.value))} className="min-h-8 rounded-lg border border-white/15 bg-slate-900 px-1">
                    {[3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={`${button} border-teal-400/50 bg-teal-500/15 text-teal-100`} onClick={apply}>
              {s.apply}
            </button>
            <button type="button" className={button} disabled={!profile} onClick={() => onProfile(null)}>
              {s.off}
            </button>
          </div>
          {profile && legend && (
            <ol className="space-y-1" aria-label={s.legend}>
              {legend.map((entry) => {
                const hidden = profile.hidden.includes(entry.key);
                return (
                  <li key={entry.key} className={`flex items-center gap-2 rounded-lg px-1 ${hidden ? "opacity-50" : ""}`}>
                    <input
                      type="color"
                      aria-label={s.pickColour(entry.label)}
                      value={entry.color}
                      onChange={(e) => onProfile({ ...profile, colors: { ...profile.colors, [entry.key]: e.target.value } })}
                      className="size-6 shrink-0 cursor-pointer rounded border border-white/20 bg-transparent"
                    />
                    <button
                      type="button"
                      title={s.selectThese}
                      onClick={() => onSelect(entry.ids)}
                      className="min-w-0 flex-1 truncate py-1 text-left hover:text-teal-200"
                    >
                      {entry.key === NO_VALUE_KEY ? s.noValue : entry.label}
                    </button>
                    <span className="shrink-0 font-mono text-slate-400">{entry.count.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}</span>
                    <button
                      type="button"
                      aria-pressed={!hidden}
                      aria-label={hidden ? s.show(entry.label) : s.hide(entry.label)}
                      onClick={() =>
                        onProfile({
                          ...profile,
                          hidden: hidden ? profile.hidden.filter((k) => k !== entry.key) : [...profile.hidden, entry.key],
                        })
                      }
                      className="grid size-7 shrink-0 place-items-center rounded hover:bg-white/10"
                    >
                      {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </fieldset>
        <fieldset className="space-y-2 border-t border-white/10 pt-3">
          <legend className="mb-1 font-bold">{s.selection(selectedGuids.length)}</legend>
          {!selectedGuids.length && <p className="text-slate-400">{s.selectFirst}</p>}
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={s.colour}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-9 shrink-0 cursor-pointer rounded border border-white/20 bg-transparent"
            />
            <button type="button" className={`${button} flex-1`} disabled={!selectedGuids.length} onClick={() => patchManual({ color })}>
              {s.applyColour}
            </button>
          </div>
          <label className="block">
            <span className="flex justify-between text-slate-400">
              {s.transparency}
              <output>{transparency}%</output>
            </span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={transparency}
              onChange={(e) => setTransparency(Number(e.target.value))}
              className="min-h-8 w-full accent-teal-400"
            />
          </label>
          <button
            type="button"
            className={`${button} w-full`}
            disabled={!selectedGuids.length}
            onClick={() => patchManual({ opacity: 1 - transparency / 100 })}
          >
            {s.applyTransparency}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={button} disabled={!selectedGuids.length} onClick={() => patchManual({ color: null, opacity: null })}>
              {s.resetSelection}
            </button>
            <button type="button" className={button} disabled={!manual.length} onClick={() => onManual([])}>
              {s.resetAll(manual.length)}
            </button>
          </div>
        </fieldset>
      </div>
    </section>
  );
}
