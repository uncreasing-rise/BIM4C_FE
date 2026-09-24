"use client";
import { triangleMetrics } from "./measurement-math";
import React from "react";
import { Crosshair, Download, RotateCcw, Scan, Trash2, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { defaultClip } from "./viewer-geometry";
import {
  distanceSummary,
  formatLength,
  sceneToWorld,
  worldToMap,
  type Vec3,
} from "./federation";
import type {
  BimBounds,
  BimClashItem,
  BimClipPlanes,
  BimDiscipline,
  BimMapConversion,
  BimTool,
  MeasureMode,
  MeasurePoint,
  Measurement,
  SnapSettings,
  BimSavedView,
  BimLocalIssue,
  BimViewPreset,
} from "./types";

import { ui } from "@/lib/i18n/ui";
interface Props {
  activeTool: BimTool;
  onCloseTool: () => void;
  clipPlanes: BimClipPlanes;
  onChangeClipPlanes: (planes: BimClipPlanes) => void;
  onFitSection: (target: "selection" | "all") => void;
  hasSelection: boolean;
  bounds: BimBounds;
  sceneOrigin: Vec3;
  mapConversion?: BimMapConversion;
  measureMode: MeasureMode;
  onMeasureMode: (mode: MeasureMode) => void;
  snapSettings: SnapSettings;
  onSnapSettings: (settings: SnapSettings) => void;
  measurements: Measurement[];
  pendingPoint: MeasurePoint | null;
  onRemoveMeasurement: (id: string) => void;
  onClearMeasurements: () => void;
  explodeFactor: number;
  onChangeExplodeFactor: (value: number) => void;
  visibleLayers: Record<BimDiscipline, boolean>;
  onToggleLayer: (layer: BimDiscipline) => void;
  clashes: BimClashItem[];
  onFocusClash: (clash: BimClashItem) => void;
  activeClashId: string | null;
  onRunClashCheck: () => void;
  savedViews: BimSavedView[];
  currentViewPreset: BimViewPreset;
  selectedElementIds: ReadonlySet<string>;
  onSaveView: (name: string) => void;
  onApplyView: (view: BimSavedView) => void;
  onDeleteView: (id: string) => void;
  selectedElementId: string | null;
  issues: BimLocalIssue[];
  onAddIssue: (title: string, description: string) => void;
  onToggleIssue: (id: string) => void;
  onDeleteIssue: (id: string) => void;
}

/**
 * Section-box axes as presented to the user (IFC world coordinates), mapped to
 * the scene-space clip keys. Scene z points south, so IFC Y is its negation and
 * its lower bound is the scene's upper z plane.
 */
function sectionAxes(origin: Vec3, bounds: BimBounds) {
  return [
    {
      id: "X" as const,
      lowerKey: "minX" as const,
      upperKey: "x" as const,
      toWorld: (v: number) => v + origin[0],
      toScene: (w: number) => w - origin[0],
      range: [bounds.min[0] + origin[0], bounds.max[0] + origin[0]],
    },
    {
      id: "Y" as const,
      lowerKey: "z" as const,
      upperKey: "minZ" as const,
      toWorld: (v: number) => -(v + origin[2]),
      toScene: (w: number) => -w - origin[2],
      range: [-(bounds.max[2] + origin[2]), -(bounds.min[2] + origin[2])],
    },
    {
      id: "Z" as const,
      lowerKey: "minY" as const,
      upperKey: "y" as const,
      toWorld: (v: number) => v + origin[1],
      toScene: (w: number) => w - origin[1],
      range: [bounds.min[1] + origin[1], bounds.max[1] + origin[1]],
    },
  ];
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = `\uFEFF${rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BimControlsOverlay(p: Props) {
  const { t, locale } = useLanguage();
  const [viewName, setViewName] = React.useState("");
  const [issueTitle, setIssueTitle] = React.useState("");
  const [issueDescription, setIssueDescription] = React.useState("");
  const v = t.bimViewerPage;
  if (p.activeTool === "orbit" || p.activeTool === "models") return null;
  const fmt = (n: number) => formatLength(n, locale);
  const title =
    p.activeTool === "section"
      ? ui(locale).bimControlsOverlay.t3DSectionBox
      : p.activeTool === "views"
        ? "Saved viewpoints"
        : v.tools[p.activeTool];
  const button =
    "flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-xs hover:bg-white/10 disabled:opacity-40";
  const world = (pt: MeasurePoint) => sceneToWorld(pt, p.sceneOrigin);
  const snapLabel: Record<MeasurePoint["snap"], string> =
    ui(locale).formats.snap;

  const exportMeasurements = () => {
    const rows: (string | number)[][] = [
      [
        ui(locale).bimControlsOverlay.no,
        ui(locale).bimControlsOverlay.type,
        "L (m)",
        ui(locale).bimControlsOverlay.planM,
        "ΔX",
        "ΔY",
        "ΔZ",
        "X1",
        "Y1",
        "Z1",
        "X2",
        "Y2",
        "Z2",
        "X3", "Y3", "Z3", "Angle (deg)", "Area (m2)",
      ],
    ];
    p.measurements.forEach((m, i) => {
      const [a, b] = m.points.map(world);
      if (m.mode === "distance" && b) {
        const s = distanceSummary(m.points[0], m.points[1]);
        rows.push([
          i + 1,
          ui(locale).bimControlsOverlay.distance,
          s.distance.toFixed(4),
          s.horizontal.toFixed(4),
          s.dx.toFixed(4),
          s.dy.toFixed(4),
          s.dz.toFixed(4),
          ...a.map((n) => n.toFixed(4)),
          ...b.map((n) => n.toFixed(4)),
        ]);
      } else if (m.mode === "angle" || m.mode === "triangle") {
        const metrics = triangleMetrics(m.points);
        rows.push([i + 1, ui(locale).bimControlsOverlay[m.mode], "", "", "", "", "", ...m.points.flatMap((pt) => world(pt).map((n) => n.toFixed(4))), m.mode === "angle" && metrics ? metrics.angle.toFixed(4) : "", m.mode === "triangle" && metrics ? metrics.area.toFixed(4) : ""]);
      } else
        rows.push([
          i + 1,
          ui(locale).bimControlsOverlay.point,
          "",
          "",
          "",
          "",
          "",
          ...a.map((n) => n.toFixed(4)),
          "",
          "",
          "",
        ]);
    });
    for (const row of rows) while (row.length < rows[0].length) row.push("");
    downloadCsv(`BIM4C-measurements-${Date.now()}.csv`, rows);
  };

  return (
    <section
      aria-label={title}
      className="absolute left-2 top-2 z-30 max-h-[calc(100%-1rem)] w-[calc(100%-1rem)] overflow-y-auto rounded-xl border border-white/15 bg-slate-950/95 p-4 text-xs text-slate-200 shadow-xl sm:left-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-80"
      onKeyDown={(e) => {
        if (e.key === "Escape") p.onCloseTool();
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <h2 className="font-bold">{title}</h2>
        <button
          type="button"
          aria-label={ui(locale).bimControlsOverlay.closeTool}
          onClick={p.onCloseTool}
          className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>

      {p.activeTool === "section" && (
        <div className="space-y-3">
          <label className="flex min-h-10 items-center justify-between">
            {ui(locale).bimControlsOverlay.enableSectionBox}
            <input
              type="checkbox"
              checked={p.clipPlanes.enabled}
              onChange={(e) =>
                p.onChangeClipPlanes({
                  ...p.clipPlanes,
                  enabled: e.target.checked,
                })
              }
              className="size-4 accent-teal-400"
            />
          </label>
          <p className="leading-relaxed text-slate-400">
            {ui(locale).bimControlsOverlay.dragTheRoundHandlesOn}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={button}
              disabled={!p.hasSelection}
              onClick={() => p.onFitSection("selection")}
            >
              <Scan className="size-4" />
              {ui(locale).bimControlsOverlay.aroundSelection}
            </button>
            <button
              type="button"
              className={button}
              onClick={() => p.onFitSection("all")}
            >
              <RotateCcw className="size-4" />
              {ui(locale).bimControlsOverlay.wholeModel}
            </button>
          </div>
          {sectionAxes(p.sceneOrigin, p.bounds).map((axis) => {
            const [min, max] = axis.range;
            const step = Math.max(0.001, (max - min) / 400);
            const lower = axis.toWorld(p.clipPlanes[axis.lowerKey]);
            const upper = axis.toWorld(p.clipPlanes[axis.upperKey]);
            return (
              <fieldset
                key={axis.id}
                className="space-y-2 rounded-lg border border-white/10 p-2"
              >
                <legend className="px-1 font-bold">
                  {axis.id} · {ui(locale).formats.axisHint[axis.id]} (m)
                </legend>
                {(
                  [
                    ["lower", lower, ui(locale).bimControlsOverlay.minimum],
                    ["upper", upper, ui(locale).bimControlsOverlay.maximum],
                  ] as const
                ).map(([which, value, label]) => (
                  <label key={which} className="block">
                    <span className="flex justify-between">
                      <span>{label}</span>
                      <output className="font-mono">{fmt(value)}</output>
                    </span>
                    <input
                      aria-label={`${axis.id} ${label}`}
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      disabled={!p.clipPlanes.enabled || min === max}
                      value={Math.min(max, Math.max(min, value))}
                      onChange={(e) => {
                        const w = Number(e.target.value);
                        const next =
                          which === "lower"
                            ? Math.min(w, upper)
                            : Math.max(w, lower);
                        p.onChangeClipPlanes({
                          ...p.clipPlanes,
                          [which === "lower" ? axis.lowerKey : axis.upperKey]:
                            axis.toScene(next),
                        });
                      }}
                      className="min-h-8 w-full accent-teal-400"
                    />
                  </label>
                ))}
              </fieldset>
            );
          })}
          <button
            type="button"
            className={button}
            onClick={() =>
              p.onChangeClipPlanes({ ...defaultClip(p.bounds), enabled: true })
            }
          >
            <RotateCcw className="size-4" />
            {v.sections.resetClipping}
          </button>
        </div>
      )}

      {p.activeTool === "measure" && (
        <div className="space-y-3">
          <div
            className="grid grid-cols-2 gap-1"
            role="radiogroup"
            aria-label={ui(locale).bimControlsOverlay.measureType}
          >
            {(
              [
                ["distance", ui(locale).bimControlsOverlay.distance],
                ["point", ui(locale).bimControlsOverlay.pointCoordinates],
                ["angle", ui(locale).bimControlsOverlay.angle],
                ["triangle", ui(locale).bimControlsOverlay.triangle],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={p.measureMode === mode}
                onClick={() => p.onMeasureMode(mode)}
                className={`min-h-9 rounded-lg border px-2 ${p.measureMode === mode ? "border-teal-400 bg-teal-500/15 text-teal-200" : "border-white/10"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <fieldset className="rounded-lg border border-white/10 p-2">
            <legend className="px-1 font-bold">
              {ui(locale).bimControlsOverlay.snapping}
            </legend>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {(
                [
                  [
                    "vertex",
                    ui(locale).bimControlsOverlay.vertex,
                    "bg-amber-500",
                  ],
                  [
                    "midpoint",
                    ui(locale).bimControlsOverlay.midpoint,
                    "bg-purple-500",
                  ],
                  ["edge", ui(locale).bimControlsOverlay.edge, "bg-cyan-500"],
                ] as const
              ).map(([key, label, swatch]) => (
                <label key={key} className="flex min-h-8 items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={p.snapSettings[key]}
                    onChange={(e) =>
                      p.onSnapSettings({
                        ...p.snapSettings,
                        [key]: e.target.checked,
                      })
                    }
                    className="size-4 accent-teal-400"
                  />
                  <span
                    className={`size-2 rounded-full ${swatch}`}
                    aria-hidden="true"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="leading-relaxed text-slate-400">
            {p.measureMode === "angle" || p.measureMode === "triangle" ? ui(locale).bimControlsOverlay.threePointHelp : p.measureMode === "distance"
              ? ui(locale).bimControlsOverlay.hoverToPreviewTheSnapped
              : ui(locale).bimControlsOverlay.clickTheModelToRead}
          </p>
          {p.pendingPoint && (
            <p role="status" className="flex items-center gap-2 text-teal-200">
              <Crosshair className="size-4" />
              {p.measureMode === "angle" || p.measureMode === "triangle" ? ui(locale).bimControlsOverlay.threePointHelp : ui(locale).bimControlsOverlay.point1SetSelectPoint}
            </p>
          )}
          {p.measurements.length > 0 && (
            <ol className="space-y-2">
              {p.measurements.map((m, i) => {
                const metrics = triangleMetrics(m.points);
                const coords = m.points.map(world);
                const s =
                  m.mode === "distance" && m.points[1]
                    ? distanceSummary(m.points[0], m.points[1])
                    : null;
                return (
                  <li key={m.id} className="rounded-lg bg-teal-500/10 p-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-semibold">
                        #{i + 1} ·{" "}
                        {m.mode === "angle" || m.mode === "triangle" ? ui(locale).bimControlsOverlay[m.mode] : s
                          ? ui(locale).bimControlsOverlay.distance
                          : ui(locale).bimControlsOverlay.point}
                      </span>
                      <button
                        type="button"
                        aria-label={
                          ui(locale).bimControlsOverlay.deleteMeasurement
                        }
                        onClick={() => p.onRemoveMeasurement(m.id)}
                        className="grid size-7 place-items-center rounded hover:bg-white/10"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[11px]">
                      {m.mode === "angle" || m.mode === "triangle" ? <><dt>{ui(locale).bimControlsOverlay[m.mode]}</dt><dd className="text-right">{metrics ? `${fmt(m.mode === "angle" ? metrics.angle : metrics.area)} ${m.mode === "angle" ? "°" : "m²"}` : "—"}</dd></> : s ? (
                        <>
                          <dt className="text-slate-400">L</dt>
                          <dd className="text-right text-teal-200">
                            {fmt(s.distance)} m
                          </dd>
                          <dt className="text-slate-400">
                            {ui(locale).bimControlsOverlay.plan}
                          </dt>
                          <dd className="text-right">{fmt(s.horizontal)} m</dd>
                          <dt className="text-slate-400">ΔX · ΔY · ΔZ</dt>
                          <dd className="text-right">
                            {fmt(s.dx)} · {fmt(s.dy)} · {fmt(s.dz)}
                          </dd>
                        </>
                      ) : (
                        (["X", "Y", "Z"] as const).map((axis, k) => (
                          <React.Fragment key={axis}>
                            <dt className="text-slate-400">{axis}</dt>
                            <dd className="text-right">{fmt(coords[0][k])}</dd>
                          </React.Fragment>
                        ))
                      )}
                      {m.mode === "point" && p.mapConversion && (
                        <>
                          <dt className="text-slate-400">E · N · H</dt>
                          <dd className="text-right">
                            {worldToMap(coords[0], p.mapConversion)
                              .map(fmt)
                              .join(" · ")}
                          </dd>
                        </>
                      )}
                    </dl>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {ui(locale).bimControlsOverlay.snap}:{" "}
                      {m.points.map((pt) => snapLabel[pt.snap]).join(" → ")}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
          {p.measurements.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={button}
                onClick={exportMeasurements}
              >
                <Download className="size-4" />
                CSV
              </button>
              <button
                type="button"
                className={button}
                onClick={p.onClearMeasurements}
              >
                <Trash2 className="size-4" />
                {v.measure.clear}
              </button>
            </div>
          )}
        </div>
      )}

      {p.activeTool === "explode" && (
        <div className="space-y-3">
          <label className="block">
            <span className="flex justify-between">
              {v.explode.intensity}
              <output>{Math.round(p.explodeFactor * 100)}%</output>
            </span>
            <input
              aria-label={v.explode.intensity}
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={p.explodeFactor}
              onChange={(e) => p.onChangeExplodeFactor(Number(e.target.value))}
              className="min-h-10 w-full accent-teal-400"
            />
          </label>
          <button
            type="button"
            className={button}
            onClick={() => p.onChangeExplodeFactor(0)}
          >
            {ui(locale).bimControlsOverlay.collapseModel}
          </button>
        </div>
      )}

      {p.activeTool === "layers" && (
        <div className="space-y-2">
          {(["architecture", "structure", "mep", "clash"] as const).map(
            (id) => (
              <label
                key={id}
                className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-white/10 px-2"
              >
                {id === "clash" ? v.layers.clashMarkers : v.layers[id]}
                <input
                  type="checkbox"
                  checked={p.visibleLayers[id]}
                  onChange={() => p.onToggleLayer(id)}
                  className="size-4 accent-teal-400"
                />
              </label>
            ),
          )}
        </div>
      )}

      {p.activeTool === "clashes" && (
        <div className="space-y-3">
          <button type="button" className={button} onClick={p.onRunClashCheck}>
            {p.clashes.length
              ? "Re-run local clash check"
              : "Run local clash check"}
          </button>
          <p className="leading-relaxed text-amber-200">
            {p.clashes.length
              ? ui(locale).bimControlsOverlay.clashesLoaded(p.clashes.length)
              : ui(locale).bimControlsOverlay.noClashResultsAreAvailable}
          </p>
          <div className="space-y-2 rounded-lg border border-white/10 p-2">
            <p className="font-semibold text-teal-200">Local issue note</p>
            <input
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="Issue title"
              className="min-h-9 w-full rounded border border-white/15 bg-slate-900 px-2"
            />
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the coordination issue"
              rows={2}
              className="w-full rounded border border-white/15 bg-slate-900 px-2 py-1"
            />
            <button
              type="button"
              disabled={!issueTitle.trim() || !p.selectedElementId}
              className={button}
              onClick={() => {
                p.onAddIssue(issueTitle.trim(), issueDescription.trim());
                setIssueTitle("");
                setIssueDescription("");
              }}
            >
              Add local issue to selected element
            </button>
          </div>
          {p.issues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-lg border border-white/10 p-2"
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => p.onToggleIssue(issue.id)}
                >
                  <span className="block font-semibold">{issue.title}</span>
                  <span className="block text-[10px] text-slate-400">
                    {issue.status} · {issue.description || "No description"}
                  </span>
                </button>
                <button
                  type="button"
                  className="text-red-300"
                  onClick={() => p.onDeleteIssue(issue.id)}
                  aria-label={`Delete ${issue.title}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {p.clashes.map((clash) => (
            <button
              key={clash.id}
              type="button"
              aria-pressed={p.activeClashId === clash.id}
              onClick={() => p.onFocusClash(clash)}
              className={`block w-full space-y-2 rounded-lg border p-3 text-left ${p.activeClashId === clash.id ? "border-teal-400 bg-teal-500/15" : "border-white/15 hover:bg-white/5"}`}
            >
              <span className="block text-[10px] text-amber-200">
                {v.clashes.severity[clash.severity]} · {clash.id}
              </span>
              <span className="block font-semibold">{clash.title}</span>
              <span className="block text-slate-400">{clash.description}</span>
              <span className="block text-teal-300">
                {v.clashes.focusClash} →
              </span>
            </button>
          ))}
        </div>
      )}

      {p.activeTool === "views" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="View name"
              aria-label="View name"
              className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-slate-900 px-2"
            />
            <button
              type="button"
              className="min-h-10 rounded-lg border border-teal-500/40 px-3 text-teal-200"
              onClick={() => {
                const name =
                  viewName.trim() || `View ${p.savedViews.length + 1}`;
                p.onSaveView(name);
                setViewName("");
              }}
            >
              Save
            </button>
          </div>
          <p className="text-slate-400">
            Saves the current preset and selected elements locally in this
            browser.
          </p>
          {!p.savedViews.length && (
            <p className="text-slate-400">No saved viewpoints.</p>
          )}
          {p.savedViews.map((view) => (
            <div
              key={view.id}
              className="flex items-center gap-2 rounded-lg border border-white/10 p-2"
            >
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left text-teal-200"
                onClick={() => p.onApplyView(view)}
              >
                {view.name}
              </button>
              <button
                type="button"
                className="rounded px-2 text-red-300 hover:bg-white/10"
                onClick={() => p.onDeleteView(view.id)}
                aria-label={`Delete ${view.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
