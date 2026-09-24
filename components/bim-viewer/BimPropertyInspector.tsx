"use client";
import React, { useState } from "react";
import { X, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { formatLength } from "./federation";
import type { BimElementData } from "./types";

import { ui } from "@/lib/i18n/ui";
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
}: {
  element: BimElementData | null;
  coordinates?: ElementCoordinates | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useLanguage();
  const v = t.bimViewerPage.properties;
  const [tab, setTab] = useState<"psets" | "tree">("psets");
  const unknown = ui(locale).bimPropertyInspector.notProvided;
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
            <span className="font-mono text-teal-300">{e.ifcType}</span>
            <h3 className="text-sm font-bold">{e.name}</h3>
            <p className="font-mono text-[10px]">{e.guid || unknown}</p>
            <p>
              {v.storey}: {e.storey || unknown}
            </p>
            <p>
              {ui(locale).bimPropertyInspector.material}: {e.material || unknown}
            </p>
            {e.source !== "ifc" && (
              <p className="text-amber-200">
                {ui(locale).bimPropertyInspector.illustrativePropertiesNotExtractedFrom}
              </p>
            )}
          </div>
          {coordinates && (
            <div className="mt-3 rounded-lg border border-teal-500/30 bg-teal-500/5 p-3">
              <h4 className="mb-2 font-semibold">
                {ui(locale).bimPropertyInspector.coordinatesIFCM}
              </h4>
              <p className="mb-2 truncate text-[10px] text-slate-400" title={coordinates.modelName}>
                {ui(locale).bimPropertyInspector.model}: {coordinates.modelName}
              </p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[11px]">
                {(["X", "Y", "Z"] as const).map((axis, i) => (
                  <React.Fragment key={axis}>
                    <dt className="text-slate-400">{ui(locale).formats.centreAxis(axis)}</dt>
                    <dd className="text-right">{formatLength(coordinates.center[i], locale)}</dd>
                  </React.Fragment>
                ))}
                <dt className="text-slate-400">{ui(locale).bimPropertyInspector.bottomElevation}</dt>
                <dd className="text-right">{formatLength(coordinates.bottom, locale)}</dd>
                <dt className="text-slate-400">{ui(locale).bimPropertyInspector.topElevation}</dt>
                <dd className="text-right">{formatLength(coordinates.top, locale)}</dd>
                {coordinates.map && (
                  <>
                    <dt className="text-slate-400">E · N · H</dt>
                    <dd className="text-right">
                      {coordinates.map.map((n) => formatLength(n, locale)).join(" · ")}
                    </dd>
                  </>
                )}
              </dl>
              <p className="mt-2 text-[10px] text-slate-500">
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
              {e.dimensions && (
                <div className="rounded-lg border border-white/10 p-3">
                  <h4 className="mb-2 font-semibold">
                    {e.dimensionsSource === "bounds"
                      ? ui(locale).bimPropertyInspector.axisAlignedBoundingDimensionsEstimate
                      : ui(locale).bimPropertyInspector.sampleDimensions}
                  </h4>
                  <dl className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["length", ui(locale).bimPropertyInspector.alongX, "m"],
                        ["width", ui(locale).bimPropertyInspector.alongY, "m"],
                        ["height", ui(locale).bimPropertyInspector.heightZ, "m"],
                        ["area", ui(locale).bimPropertyInspector.area, "m²"],
                        ["volume", ui(locale).bimPropertyInspector.volume, "m³"],
                      ] as const
                    ).map(([key, label, unit]) =>
                      e.dimensions?.[key] !== undefined ? (
                        <div key={key} className="rounded bg-white/5 p-2">
                          <dt className="text-slate-400">{label}</dt>
                          <dd className="font-mono">
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
                      {ui(locale).bimPropertyInspector.boundingDimensionsAreNotQuantities}
                    </p>
                  )}
                </div>
              )}
              {e.psets.map((pset, i) => (
                <details
                  key={`${pset.name}-${i}`}
                  open
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
                        <dd className="whitespace-pre-wrap font-mono">
                          {prop.value} {prop.unit}
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
