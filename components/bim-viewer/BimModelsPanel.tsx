"use client";

import { Eye, EyeOff, Focus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  distanceBetween,
  formatLength,
  modelOrigin,
  sceneToWorld,
} from "./federation";
import type { FederatedModel, ModelAlignment } from "./types";

import { ui } from "@/lib/i18n/ui";
import { buildSpatialTree } from "./spatial-tree";
import { BimSpatialTree } from "./BimSpatialTree";
/** Beyond this, two "shared coordinate" models are probably not in the same system. */
const FAR_APART_METRES = 5_000;

interface Props {
  models: FederatedModel[];
  onClose: () => void;
  onToggleVisible: (key: string) => void;
  onRemove: (key: string) => void;
  onFocus: (key: string) => void;
  onAlignment: (key: string, alignment: ModelAlignment) => void;
  onOffset: (key: string, offset: FederatedModel["offset"]) => void;
  onAddFiles: () => void;
  selectedElementId: string | null;
  onSelectElement: (
    element: FederatedModel["model"]["elements"][number],
  ) => void;
}

export function BimModelsPanel(p: Props) {
  const { locale } = useLanguage();
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState("all");
  const [storey, setStorey] = useState("all");
  const [resultLimit, setResultLimit] = useState(100);
  const fmt = (n: number) => formatLength(n, locale);
  const primary = p.models[0];
  const primaryOrigin = primary ? modelOrigin(primary.model) : null;
  const storeys = useMemo(
    () =>
      [
        ...new Set(
          p.models.flatMap((model) =>
            model.model.elements
              .map((element) => element.storey)
              .filter(Boolean),
          ),
        ),
      ].sort(),
    [p.models],
  );
  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    return p.models
      .flatMap((m) =>
        m.model.elements.map((element) => ({ model: m, element })),
      )
      .filter(
        ({ model, element }) =>
          (discipline === "all" || element.discipline === discipline) &&
          (storey === "all" || element.storey === storey) &&
          [
            model.model.filename,
            element.name,
            element.ifcType,
            element.storey,
            element.guid,
            element.material,
            ...element.psets.flatMap((pset) => [pset.name, ...pset.properties.map((property) => `${property.name} ${property.value}`)]),
          ]
            .filter(Boolean)
            .some(
              (value) => !q || value!.toLocaleLowerCase(locale).includes(q),
            ),
      );
  }, [discipline, locale, p.models, query, storey]);
  const tree = useMemo(() => buildSpatialTree(results), [results]);
  return (
    <section
      aria-label={ui(locale).bimModelsPanel.loadedModels}
      onKeyDown={(e) => {
        if (e.key === "Escape") p.onClose();
      }}
      className="absolute left-2 top-2 z-30 max-h-[calc(100%-1rem)] w-[calc(100%-1rem)] overflow-y-auto rounded-xl border border-white/15 bg-slate-950/95 p-4 text-xs text-slate-200 shadow-xl sm:left-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-96"
    >
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <h2 className="font-bold">
          {ui(locale).bimModelsPanel.loadedModels} ({p.models.length})
        </h2>
        <button
          type="button"
          aria-label={ui(locale).bimModelsPanel.close}
          onClick={p.onClose}
          className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
      <p className="mb-3 leading-relaxed text-slate-400">
        {ui(locale).bimModelsPanel.filesThatShareACoordinate}
      </p>
      <label className="mb-3 flex min-h-10 items-center gap-2 rounded-lg border border-white/15 bg-slate-900 px-2">
        <Search className="size-4 shrink-0 text-teal-300" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setResultLimit(100); }}
          placeholder="Search element, type, storey..."
          aria-label="Search model elements"
          className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-500"
        />
      </label>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <select
          value={discipline}
          onChange={(e) => { setDiscipline(e.target.value); setResultLimit(100); }}
          aria-label="Filter by discipline"
          className="min-h-9 rounded border border-white/15 bg-slate-900 px-2 text-xs"
        >
          <option value="all">All disciplines</option>
          <option value="architecture">Architecture</option>
          <option value="structure">Structure</option>
          <option value="mep">MEP</option>
        </select>
        <select
          value={storey}
          onChange={(e) => { setStorey(e.target.value); setResultLimit(100); }}
          aria-label="Filter by storey"
          className="min-h-9 min-w-0 rounded border border-white/15 bg-slate-900 px-2 text-xs"
        >
          <option value="all">All storeys</option>
          {storeys.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <details className="mb-3 rounded-lg border border-white/10">
        <summary className="cursor-pointer px-3 py-2 text-teal-200">
          Spatial model tree
        </summary>
        <div className="max-h-64 space-y-1 overflow-y-auto p-1">
          {tree.map((node) => <BimSpatialTree key={node.id} node={node} selectedId={p.selectedElementId} onSelect={p.onSelectElement} />)}
        </div>
      </details>
      {(query || discipline !== "all" || storey !== "all") && (
        <div className="mb-3 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-1">
          {!results.length && (
            <p className="p-2 text-slate-400">No matching elements.</p>
          )}
          {results.slice(0, resultLimit)
            .map(({ model, element }) => (
              <button
                type="button"
                key={element.id}
                onClick={() => p.onSelectElement(element)}
                className={`block w-full rounded-md px-2 py-2 text-left hover:bg-white/10 ${p.selectedElementId === element.id ? "bg-teal-500/15 text-teal-200" : ""}`}
              >
                <span className="block truncate font-semibold">
                  {element.name || element.ifcType}
                </span>
                <span className="block truncate text-[10px] text-slate-400">
                  {element.ifcType} · {element.storey || "No storey"} ·{" "}
                  {model.model.filename}
                </span>
              </button>
            ))}
          {resultLimit < results.length && <button type="button" onClick={() => setResultLimit((limit) => limit + 100)} className="min-h-9 w-full rounded border border-white/15 text-teal-200">+ {Math.min(100, results.length - resultLimit)} ({resultLimit}/{results.length})</button>}
        </div>
      )}
      <ul className="space-y-3">
        {p.models.map((m, index) => {
          const origin = sceneToWorld(modelOrigin(m.model), [0, 0, 0]);
          const far =
            index > 0 &&
            m.alignment === "shared" &&
            primaryOrigin &&
            distanceBetween(modelOrigin(m.model), primaryOrigin) >
              FAR_APART_METRES;
          const setOffset = (patch: Partial<FederatedModel["offset"]>) =>
            p.onOffset(m.key, { ...m.offset, ...patch });
          return (
            <li key={m.key} className="rounded-lg border border-white/10 p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-semibold"
                    title={m.model.filename}
                  >
                    {index === 0 && (
                      <span className="mr-1 rounded bg-teal-500/20 px-1 text-[10px] text-teal-300">
                        {ui(locale).bimModelsPanel.base}
                      </span>
                    )}
                    {m.model.filename}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {m.model.schema} · {m.model.elements.length}{" "}
                    {ui(locale).bimModelsPanel.elements}
                  </p>
                </div>
                <button
                  type="button"
                  aria-pressed={m.visible}
                  aria-label={
                    m.visible
                      ? ui(locale).bimModelsPanel.hide
                      : ui(locale).bimModelsPanel.show
                  }
                  title={
                    m.visible
                      ? ui(locale).bimModelsPanel.hide
                      : ui(locale).bimModelsPanel.show
                  }
                  onClick={() => p.onToggleVisible(m.key)}
                  className="grid size-8 place-items-center rounded-lg hover:bg-white/10"
                >
                  {m.visible ? (
                    <Eye className="size-4 text-teal-300" />
                  ) : (
                    <EyeOff className="size-4 text-slate-500" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label={ui(locale).bimModelsPanel.zoomToModel}
                  title={ui(locale).bimModelsPanel.zoomToModel}
                  onClick={() => p.onFocus(m.key)}
                  className="grid size-8 place-items-center rounded-lg hover:bg-white/10"
                >
                  <Focus className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={ui(locale).bimModelsPanel.removeModel}
                  title={ui(locale).bimModelsPanel.removeModel}
                  onClick={() => p.onRemove(m.key)}
                  className="grid size-8 place-items-center rounded-lg text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <dl className="mt-2 space-y-1 font-mono text-[10px] text-slate-300">
                <div>
                  <dt className="inline text-slate-500">
                    {ui(locale).bimModelsPanel.fileOrigin}
                  </dt>
                  <dd className="inline">
                    X {fmt(origin[0])} · Y {fmt(origin[1])} · Z {fmt(origin[2])}
                  </dd>
                </div>
                {m.model.mapConversion && (
                  <div>
                    <dt className="inline text-slate-500">
                      {ui(locale).bimModelsPanel.georeference}
                    </dt>
                    <dd className="inline">
                      {m.model.mapConversion.crsName ?? "CRS"} · E{" "}
                      {fmt(m.model.mapConversion.eastings)} · N{" "}
                      {fmt(m.model.mapConversion.northings)}
                    </dd>
                  </div>
                )}
              </dl>
              {far && (
                <p
                  role="alert"
                  className="mt-2 rounded bg-amber-500/10 p-2 text-amber-200"
                >
                  {ui(locale).bimModelsPanel.thisModelIsMoreThan}
                </p>
              )}
              {index > 0 && (
                <details className="mt-2 rounded border border-white/10">
                  <summary className="cursor-pointer px-2 py-1.5 text-slate-300">
                    {ui(locale).bimModelsPanel.alignment}
                  </summary>
                  <div className="space-y-2 p-2">
                    <div className="grid grid-cols-2 gap-1" role="radiogroup">
                      {(
                        [
                          [
                            "shared",
                            ui(locale).bimModelsPanel.sharedCoordinates,
                          ],
                          ["origin", ui(locale).bimModelsPanel.byOrigin],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={m.alignment === value}
                          onClick={() => p.onAlignment(m.key, value)}
                          className={`min-h-8 rounded border px-2 ${m.alignment === value ? "border-teal-400 bg-teal-500/15 text-teal-200" : "border-white/10"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {ui(locale).bimModelsPanel.extraMoveAlongIFCAxes}
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {(
                        [
                          ["x", "ΔX"],
                          ["y", "ΔY"],
                          ["z", "ΔZ"],
                          ["rotationDeg", ui(locale).bimModelsPanel.rot],
                        ] as const
                      ).map(([field, label]) => (
                        <label key={field} className="grid gap-0.5">
                          <span className="text-[10px] text-slate-400">
                            {label}
                          </span>
                          <input
                            type="number"
                            step={field === "rotationDeg" ? 0.1 : 0.001}
                            value={m.offset[field]}
                            onChange={(e) => {
                              const n = Number(e.target.value);
                              if (Number.isFinite(n)) setOffset({ [field]: n });
                            }}
                            className="h-8 w-full min-w-0 rounded border border-white/15 bg-slate-900 px-1 font-mono"
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        p.onOffset(m.key, { x: 0, y: 0, z: 0, rotationDeg: 0 })
                      }
                      className="min-h-8 w-full rounded border border-white/15 hover:bg-white/10"
                    >
                      {ui(locale).bimModelsPanel.clearAdjustment}
                    </button>
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={p.onAddFiles}
        className="mt-3 min-h-10 w-full rounded-lg border border-teal-500/40 bg-teal-500/10 text-teal-200 hover:bg-teal-500/20"
      >
        {ui(locale).bimModelsPanel.addIFCFilesToThe}
      </button>
    </section>
  );
}
