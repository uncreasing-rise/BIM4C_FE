"use client";
import React, { useMemo, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, Copy, Info, Search, X } from "lucide-react";
import { toast } from "./toast";
import { useLanguage } from "@/lib/i18n/context";
import { formatLength } from "./federation";
import { computeOrientedBounds } from "./viewer-geometry";
import type { BimElementData } from "./types";

import { ui } from "@/lib/i18n/ui";

/** Case- and accent-insensitive text for property filtering ("dien tich" finds "Diện tích"). */
const fold = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

/** Selected element position in IFC world coordinates (metres). */
export interface ElementCoordinates {
  modelName: string;
  center: [number, number, number];
  bottom: number;
  top: number;
  map?: [number, number, number];
}

export function BimPropertyInspector({
  element: e,
  coordinates,
  isOpen,
  onClose,
  onHide,
  onIsolate,
  onResetVisibility,
  onFitSelection,
  selectionCount = 1,
}: {
  selectionCount?: number;
  element: BimElementData | null;
  coordinates?: ElementCoordinates | null;
  isOpen: boolean;
  onClose: () => void;
  onHide: () => void;
  onIsolate: () => void;
  onResetVisibility: () => void;
  onFitSelection: () => void;
}) {
  const { t, locale } = useLanguage();
  const v = t.bimViewerPage.properties;
  const [tab, setTab] = useState<"psets" | "tree">("psets");
  const [filter, setFilter] = useState("");
  const [collapsed, setCollapsed] = useState<ReadonlySet<number>>(() => new Set());
  const s = ui(locale).bimPropertyInspector;
  const unknown = s.notProvided;
  const psets = useMemo(() => {
    const q = fold(filter.trim());
    return (e?.psets ?? [])
      .map((pset, index) => ({
        index,
        name: pset.name,
        properties: q && !fold(pset.name).includes(q)
          ? pset.properties.filter(
              (prop) => fold(prop.name).includes(q) || fold(prop.value).includes(q),
            )
          : pset.properties,
      }))
      .filter((pset) => !q || pset.properties.length);
  }, [e, filter]);
  const oriented = useMemo(() => {
    if (e?.orientedDimensions) return e.orientedDimensions;
    if (e?.geometryData?.positions) return computeOrientedBounds(e.geometryData.positions);
    return null;
  }, [e]);
  const copy = (text: string) => {
    void navigator.clipboard
      ?.writeText(text)
      .then(() => toast.success(`${s.copied}: ${text.length > 60 ? `${text.slice(0, 60)}…` : text}`))
      .catch(() => undefined);
  };
  if (!isOpen) return null;
  return (
    <aside
      aria-label={v.title}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="absolute inset-x-2 bottom-2 z-30 flex max-h-[85%] flex-col overflow-hidden rounded-xl border border-white/15 bg-slate-950/95 text-xs text-slate-200 shadow-xl sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-4 sm:max-h-none sm:w-96"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <h2 className="font-bold">{v.title}</h2>
        <button
          type="button"
          aria-label={ui(locale).bimPropertyInspector.closeProperties}
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
      {e ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-2 break-words">
            {selectionCount > 1 && (
              <p className="rounded-md bg-teal-500/15 px-2 py-1 text-teal-200">
                {s.selectedCount(selectionCount)}
              </p>
            )}
            <span className="font-mono text-teal-300">{e.ifcType}</span>
            <h3 className="text-sm font-bold">{e.name}</h3>
            {e.guid ? (
              <button
                type="button"
                onClick={() => copy(e.guid)}
                title={s.copyValue}
                className="group flex max-w-full items-center gap-1 font-mono text-[11px] text-slate-300 hover:text-white"
              >
                <span className="truncate">{e.guid}</span>
                <Copy className="size-3 shrink-0 opacity-0 group-hover:opacity-100" />
              </button>
            ) : (
              <p className="font-mono text-[11px]">{unknown}</p>
            )}
            <p>
              {v.storey}: {e.storey || unknown}
            </p>
            <p>
              {ui(locale).bimPropertyInspector.material}:{" "}
              {e.material || unknown}
            </p>
            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                onClick={onHide}
                className="min-h-9 rounded border border-white/15 px-2 hover:bg-white/10"
              >
                {ui(locale).bimPropertyInspector.hideElement}
              </button>
              <button
                type="button"
                onClick={onIsolate}
                className="min-h-9 rounded border border-teal-500/40 px-2 text-teal-200 hover:bg-teal-500/10"
              >
                {ui(locale).bimPropertyInspector.isolateElement}
              </button>
              <button
                type="button"
                onClick={onResetVisibility}
                className="min-h-9 rounded border border-white/15 px-2 hover:bg-white/10"
              >
                {ui(locale).bimPropertyInspector.showAllElements}
              </button>
              <button
                type="button"
                onClick={onFitSelection}
                className="col-span-3 min-h-9 rounded border border-teal-500/40 px-2 text-teal-200 hover:bg-teal-500/10"
              >
                {ui(locale).bimPropertyInspector.fitSelection}
              </button>
            </div>
            {e.source !== "ifc" && (
              <p className="text-amber-200">
                {
                  ui(locale).bimPropertyInspector
                    .illustrativePropertiesNotExtractedFrom
                }
              </p>
            )}
          </div>
          {coordinates && (
            <div className="mt-3 rounded-lg border border-teal-500/30 bg-teal-500/5 p-3">
              <h4 className="mb-2 font-semibold">
                {ui(locale).bimPropertyInspector.coordinatesIFCM}
              </h4>
              <p
                className="mb-2 truncate text-[11px] text-slate-400"
                title={coordinates.modelName}
              >
                {ui(locale).bimPropertyInspector.model}: {coordinates.modelName}
              </p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs text-slate-100">
                {(["X", "Y", "Z"] as const).map((axis, i) => (
                  <React.Fragment key={axis}>
                    <dt className="text-slate-400">
                      {ui(locale).formats.centreAxis(axis)}
                    </dt>
                    <dd className="text-right">
                      {formatLength(coordinates.center[i], locale)}
                    </dd>
                  </React.Fragment>
                ))}
                <dt className="text-slate-400">
                  {ui(locale).bimPropertyInspector.bottomElevation}
                </dt>
                <dd className="text-right">
                  {formatLength(coordinates.bottom, locale)}
                </dd>
                <dt className="text-slate-400">
                  {ui(locale).bimPropertyInspector.topElevation}
                </dt>
                <dd className="text-right">
                  {formatLength(coordinates.top, locale)}
                </dd>
                {coordinates.map && (
                  <>
                    <dt className="text-slate-400">E · N · H</dt>
                    <dd className="text-right">
                      {coordinates.map
                        .map((n) => formatLength(n, locale))
                        .join(" · ")}
                    </dd>
                  </>
                )}
              </dl>
              <p className="mt-2 text-[11px] text-slate-400">
                {ui(locale).bimPropertyInspector.centreAndElevationsComeFrom}
              </p>
            </div>
          )}
          <div className="my-3 flex gap-2" role="group" aria-label={v.title}>
            {(["psets", "tree"] as const).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={tab === id}
                onClick={() => setTab(id)}
                className={`min-h-10 flex-1 rounded-lg border px-2 ${tab === id ? "border-teal-400 text-teal-300" : "border-white/10"}`}
              >
                {id === "psets" ? v.psetsTitle : v.spatialTree}
              </button>
            ))}
          </div>
          {tab === "psets" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <label className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-slate-900 px-2">
                  <Search className="size-3.5 shrink-0 text-teal-300" />
                  <input
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder={s.searchProperties}
                    aria-label={s.searchProperties}
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
                  />
                  {filter && (
                    <button type="button" onClick={() => setFilter("")} aria-label={ui(locale).bimShortcuts.close}>
                      <X className="size-3.5 text-slate-400" />
                    </button>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setCollapsed(new Set())}
                  aria-label={s.expandAll}
                  title={s.expandAll}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/15 hover:bg-white/10"
                >
                  <ChevronsUpDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCollapsed(new Set(e.psets.map((_, i) => i)))}
                  aria-label={s.collapseAll}
                  title={s.collapseAll}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/15 hover:bg-white/10"
                >
                  <ChevronsDownUp className="size-4" />
                </button>
              </div>
              {oriented && !filter && (
                <div className="mb-3 rounded-lg border border-teal-500/30 bg-teal-950/25 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-teal-300">
                      {s.orientedDimensions}
                    </h4>
                    {oriented.rotationAngleDeg > 0 && (
                      <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-medium text-teal-300">
                        {s.rotationAngle}: {oriented.rotationAngleDeg}°
                      </span>
                    )}
                  </div>
                  <dl className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded bg-black/40 p-2">
                      <dt className="text-[10px] text-slate-400">{s.orientedLength}</dt>
                      <dd className="font-mono font-bold text-teal-200 text-sm">
                        {oriented.length.toLocaleString(locale, { maximumFractionDigits: 3 })} m
                      </dd>
                    </div>
                    <div className="rounded bg-black/40 p-2">
                      <dt className="text-[10px] text-slate-400">{s.orientedWidth}</dt>
                      <dd className="font-mono font-bold text-teal-200 text-sm">
                        {oriented.width.toLocaleString(locale, { maximumFractionDigits: 3 })} m
                      </dd>
                    </div>
                    <div className="rounded bg-black/40 p-2">
                      <dt className="text-[10px] text-slate-400">{s.orientedHeight}</dt>
                      <dd className="font-mono font-bold text-teal-200 text-sm">
                        {oriented.height.toLocaleString(locale, { maximumFractionDigits: 3 })} m
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-[10px] text-teal-200/70">
                    {s.orientedDimensionsHint}
                  </p>
                </div>
              )}
              {e.dimensions && !filter && (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <h4 className="mb-2 font-semibold text-slate-300">
                    {e.dimensionsSource === "bounds"
                      ? s.axisAlignedBoundingDimensionsEstimate
                      : s.sampleDimensions}
                  </h4>
                  <dl className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["length", s.alongX, "m"],
                        ["width", s.alongY, "m"],
                        [
                          "height",
                          s.heightZ,
                          "m",
                        ],
                      ] as const
                    ).map(([key, label, unit]) =>
                      e.dimensions?.[key] !== undefined ? (
                        <div key={key} className="rounded bg-white/5 p-2 text-center">
                          <dt className="text-[10px] text-slate-400">{label}</dt>
                          <dd className="font-mono text-xs">
                            {e.dimensions[key]!.toLocaleString(locale, {
                              maximumFractionDigits: 3,
                            })}{" "}
                            {unit}
                          </dd>
                        </div>
                      ) : null,
                    )}
                  </dl>
                  {e.dimensionsSource === "bounds" && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      {s.boundingDimensionsAreNotQuantities}
                    </p>
                  )}
                </div>
              )}
              {filter && !psets.length && (
                <p className="py-4 text-center text-slate-400">{s.noMatchingProperties}</p>
              )}
              {psets.map((pset) => (
                <details
                  key={`${pset.name}-${pset.index}`}
                  // A filter always shows its matches, even in collapsed groups.
                  open={Boolean(filter) || !collapsed.has(pset.index)}
                  onToggle={(event) => {
                    const isOpen = event.currentTarget.open;
                    if (filter) return;
                    setCollapsed((current) => {
                      const next = new Set(current);
                      if (isOpen) next.delete(pset.index);
                      else next.add(pset.index);
                      return next;
                    });
                  }}
                  className="rounded-lg border border-white/10"
                >
                  <summary className="cursor-pointer break-words p-3 font-mono text-teal-300">
                    {pset.name}
                  </summary>
                  <dl className="divide-y divide-white/10">
                    {pset.properties.map((prop, j) => (
                      <div
                        key={`${prop.name}-${j}`}
                        className="grid grid-cols-2 gap-2 break-words px-3 py-2"
                      >
                        <dt className="text-slate-400">{prop.name}</dt>
                        <dd>
                          <button
                            type="button"
                            onClick={() => copy(`${prop.value}${prop.unit ? ` ${prop.unit}` : ""}`)}
                            title={s.copyValue}
                            className="group w-full whitespace-pre-wrap rounded text-left font-mono hover:bg-white/5"
                          >
                            {prop.value} {prop.unit}
                            <Copy className="ml-1 inline size-3 opacity-0 group-hover:opacity-60" />
                          </button>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            </div>
          ) : (
            <ol className="space-y-2 break-words">
              {e.spatialPath?.length ? (
                e.spatialPath.map((node, i) => (
                  <li
                    key={node.id}
                    style={{ marginLeft: Math.min(i, 3) * 8 }}
                    className="rounded-lg border-l border-teal-500/40 bg-white/5 p-2"
                  >
                    <span className="text-teal-300">{node.type}</span>:{" "}
                    {node.name}
                  </li>
                ))
              ) : (
                <li className="text-slate-400">
                  {ui(locale).bimPropertyInspector.noIFCSpatialHierarchyIs}
                </li>
              )}
              <li className="rounded-lg border border-teal-500/40 bg-teal-500/10 p-2">
                {e.ifcType}: {e.name}
              </li>
            </ol>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-center text-slate-400">
          <Info className="size-7 text-teal-300" />
          <h3 className="font-bold text-white">{v.noSelection}</h3>
          <p>{v.noSelectionDesc}</p>
        </div>
      )}
    </aside>
  );
}
