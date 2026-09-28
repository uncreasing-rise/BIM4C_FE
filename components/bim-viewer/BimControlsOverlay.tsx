"use client";
import {
  accumulateSegments,
  arcThrough,
  formatMeasure,
  isOpenEnded,
  LOCK_SYMBOLS,
  MEASURE_POINTS,
  multipointDistances,
  polygonMetrics,
  polylineLength,
  triangleMetrics,
  UNIT_METRES,
} from "./measurement-math";
import React from "react";
import { ArrowLeftRight, Crosshair, Download, MessageSquarePlus, MousePointerClick, PenLine, Redo2, RotateCcw, Scan, Trash2, Undo2, Upload, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { defaultClip } from "./viewer-geometry";
import {
  clipAngles,
  clipRotation,
  flipClip,
  HANDLE_KEYS,
  localBounds,
  planeClip,
  rotateClip,
  rotationFromAngles,
  type Axis,
} from "./section-box";
import {
  distanceSummary,
  formatLength,
  sceneToWorld,
  worldToMap,
  type Vec3,
} from "./federation";
import type {
  BimBounds,
  BimClipPlanes,
  BimDiscipline,
  BimMapConversion,
  BimTool,
  MeasureLock,
  MeasureMode,
  MeasurePoint,
  MeasureUnits,
  Measurement,
  SnapSettings,
  BimSavedView,
  BimLocalIssue,
  BimSelectionSet,
  BimViewPreset,
} from "./types";

/** Measure tools in the order of the Navisworks Measure menu, then the extras. */
const MEASURE_MODES: MeasureMode[] = ["distance", "multipoint", "polyline", "accumulate", "angle", "polygon", "point", "shortest", "arc", "triangle"];
const measurementsFilename = () => `BIM4C-measurements-${Date.now()}.csv`;
const MEASURE_LOCKS: NonNullable<MeasureLock>[] = ["x", "y", "z", "perpendicular", "parallel"];

import { ui } from "@/lib/i18n/ui";
interface Props {
  activeTool: BimTool;
  onCloseTool: () => void;
  clipPlanes: BimClipPlanes;
  onChangeClipPlanes: (planes: BimClipPlanes) => void;
  onFitSection: (target: "selection" | "all") => void;
  /** Waiting for a click on the model to place a plane on that surface. */
  sectionFacePick: boolean;
  onToggleSectionFacePick: () => void;
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
  /** Points placed so far in the measurement being drawn. */
  pendingCount: number;
  /** Completes an open-ended polyline/polygon (same as Enter). */
  onFinishMeasurement: () => boolean;
  onRemoveMeasurement: (id: string) => void;
  onClearMeasurements: () => void;
  /** Draws the measurements as markup on the current view (Navisworks' convert to redline). */
  onRedlineMeasurements: () => void;
  /** Raises an issue (exportable as BCF) with the measurements and a snapshot. */
  onMeasurementIssue: () => void;
  measureLock: MeasureLock;
  onMeasureLock: (lock: MeasureLock) => void;
  measureUnits: MeasureUnits;
  onMeasureUnits: (units: MeasureUnits) => void;
  canUndoMeasurement: boolean;
  canRedoMeasurement: boolean;
  onUndoMeasurement: () => void;
  onRedoMeasurement: () => void;
  explodeFactor: number;
  onChangeExplodeFactor: (value: number) => void;
  visibleLayers: Record<BimDiscipline, boolean>;
  onToggleLayer: (layer: BimDiscipline) => void;
  /** The clash detective (BimClashPanel), rendered in this panel's frame. */
  clashPanel: React.ReactNode;
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
  /** Select the issue's elements and restore the view it was raised in. */
  onGoToIssue: (issue: BimLocalIssue) => void;
  onExportIssuesBcf: () => void;
  onImportBcf: (file: File) => void;
  /** Issue id -> snapshot data URL (current visit only). */
  issueSnapshots: Record<string, string>;
  selectionSets: BimSelectionSet[];
  onSaveSelectionSet: (name: string) => void;
  onApplySelectionSet: (set: BimSelectionSet) => void;
  onDeleteSelectionSet: (id: string) => void;
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
  const [setName, setSetName] = React.useState("");
  const [issueTitle, setIssueTitle] = React.useState("");
  const [issueDescription, setIssueDescription] = React.useState("");
  const v = t.bimViewerPage;
  if (p.activeTool === "orbit" || p.activeTool === "models" || p.activeTool === "display" || p.activeTool === "compare" || p.activeTool === "walk" || p.activeTool === "markup" || p.activeTool === "quantities" || p.activeTool === "levels" || p.activeTool === "appearance") return null;
  const fmt = (n: number) => formatLength(n, locale);
  const o = ui(locale).bimControlsOverlay;
  const len = (metres: number) => formatMeasure(metres, 1, p.measureUnits, locale);
  const area = (metres: number) => formatMeasure(metres, 2, p.measureUnits, locale);
  // Accumulate finishes on whole segments: an unpaired last point does not count.
  const finishable =
    isOpenEnded(p.measureMode) &&
    (p.measureMode === "accumulate" ? p.pendingCount - (p.pendingCount % 2) : p.pendingCount) >= MEASURE_POINTS[p.measureMode];
  const title =
    p.activeTool === "section"
      ? ui(locale).bimControlsOverlay.t3DSectionBox
      : p.activeTool === "views"
        ? ui(locale).bimToolbar.savedViews
        : v.tools[p.activeTool];
  const button =
    "flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-xs hover:bg-white/10 disabled:opacity-40";
  const world = (pt: MeasurePoint) => sceneToWorld(pt, p.sceneOrigin);
  const snapLabel: Record<MeasurePoint["snap"], string> =
    ui(locale).formats.snap;

  // CSV values stay in metres whatever the display unit, so sheets add up.
  const exportMeasurements = () => {
    const rows: (string | number)[][] = [
      [
        o.no,
        o.type,
        "L (m)",
        o.planM,
        "ΔX",
        "ΔY",
        "ΔZ",
        "X1",
        "Y1",
        "Z1",
        "X2",
        "Y2",
        "Z2",
        "X3", "Y3", "Z3", "Angle (deg)", "Area (m2)", "Perimeter (m)", "Plan area (m2)", "Points (X Y Z; …)", "Radius (m)", "Arc length (m)",
      ],
    ];
    const pointList = (points: MeasurePoint[]) =>
      points.map((pt) => world(pt).map((n) => n.toFixed(4)).join(" ")).join("; ");
    const segmentRow = (no: string | number, type: string, a: MeasurePoint, b: MeasurePoint) => {
      const s = distanceSummary(a, b);
      return [
        no,
        type,
        s.distance.toFixed(4),
        s.horizontal.toFixed(4),
        s.dx.toFixed(4),
        s.dy.toFixed(4),
        s.dz.toFixed(4),
        ...world(a).map((n) => n.toFixed(4)),
        ...world(b).map((n) => n.toFixed(4)),
      ];
    };
    p.measurements.forEach((m, i) => {
      const type = o.modes[m.mode];
      if (m.mode === "polyline" || m.mode === "polygon" || m.mode === "accumulate") {
        // Outlines of any length: totals in the usual columns, vertices in the last.
        const polygon = m.mode === "polygon" ? polygonMetrics(m.points) : null;
        const row: (string | number)[] = [i + 1, type];
        row[2] =
          m.mode === "polyline" ? polylineLength(m.points).toFixed(4)
          : m.mode === "accumulate" ? accumulateSegments(m.points).total.toFixed(4)
          : "";
        row[17] = polygon ? polygon.area.toFixed(4) : "";
        row[18] = polygon ? polygon.perimeter.toFixed(4) : "";
        row[19] = polygon ? polygon.planArea.toFixed(4) : "";
        row[20] = pointList(m.points);
        rows.push(Array.from(row, (c) => c ?? ""));
      } else if (m.mode === "multipoint") {
        // One row per target, numbered 3.1, 3.2, …
        m.points.slice(1).forEach((target, k) => rows.push(segmentRow(`${i + 1}.${k + 1}`, type, m.points[0], target)));
      } else if ((m.mode === "distance" || m.mode === "shortest") && m.points[1]) {
        rows.push(segmentRow(i + 1, type, m.points[0], m.points[1]));
      } else if (m.mode === "arc") {
        const arc = arcThrough(m.points);
        const row: (string | number)[] = [i + 1, type, "", "", "", "", "", ...m.points.flatMap((pt) => world(pt).map((n) => n.toFixed(4)))];
        row[16] = arc ? arc.angle.toFixed(4) : "";
        row[21] = arc ? arc.radius.toFixed(4) : "";
        row[22] = arc ? arc.length.toFixed(4) : "";
        rows.push(Array.from(row, (c) => c ?? ""));
      } else if (m.mode === "angle" || m.mode === "triangle") {
        const metrics = triangleMetrics(m.points);
        rows.push([i + 1, type, "", "", "", "", "", ...m.points.flatMap((pt) => world(pt).map((n) => n.toFixed(4))), m.mode === "angle" && metrics ? metrics.angle.toFixed(4) : "", m.mode === "triangle" && metrics ? metrics.area.toFixed(4) : ""]);
      } else
        rows.push([i + 1, type, "", "", "", "", "", ...world(m.points[0]).map((n) => n.toFixed(4))]);
    });
    for (const row of rows) while (row.length < rows[0].length) row.push("");
    downloadCsv(measurementsFilename(), rows);
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

      {p.activeTool === "section" && (() => {
        const s = ui(locale).bimSection;
        const clip = p.clipPlanes;
        const mode = !clip.enabled ? "off" : clip.planeAxis === undefined ? "box" : clip.planeAxis;
        // Scene axis → the IFC-named slider axis (scene y is elevation Z, scene z is -Y).
        const axisOf = (a: Axis) => sectionAxes(p.sceneOrigin, p.bounds)[a === 0 ? 0 : a === 1 ? 2 : 1];
        const modes: { id: "off" | "box" | Axis; label: string }[] = [
          { id: "off", label: s.off },
          { id: "box", label: s.box },
          { id: 1, label: s.planeZ },
          { id: 0, label: s.planeX },
          { id: 2, label: s.planeY },
        ];
        const single = typeof mode === "number" ? mode : null;
        const turned = Boolean(clip.rotation);
        const angles = clipAngles(clip);
        return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1" role="radiogroup" aria-label={s.mode}>
            {modes.map((m) => (
              <button
                key={String(m.id)}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                onClick={() =>
                  p.onChangeClipPlanes(
                    m.id === "off"
                      ? { ...clip, enabled: false }
                      : m.id === "box"
                        ? { ...defaultClip(p.bounds), enabled: true }
                        : planeClip(p.bounds, m.id),
                  )
                }
                className={`min-h-9 rounded-lg border px-2 text-left ${m.id === "off" ? "col-span-2" : ""} ${mode === m.id ? "border-teal-400 bg-teal-500/15 text-teal-200" : "border-white/10 hover:bg-white/5"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="leading-relaxed text-slate-400">
            {single === null ? s.boxHelp : s.planeHelp}
          </p>
          <button
            type="button"
            aria-pressed={p.sectionFacePick}
            className={`${button} ${p.sectionFacePick ? "border-teal-400 bg-teal-500/15 text-teal-200" : ""}`}
            onClick={p.onToggleSectionFacePick}
          >
            <MousePointerClick className="size-4" />
            {s.faceMode}
          </button>
          {p.sectionFacePick && <p className="leading-relaxed text-teal-200">{s.faceHint}</p>}
          {clip.enabled && (
            <fieldset className="space-y-2 rounded-lg border border-white/10 p-2">
              <legend className="px-1 font-bold">{s.rotation} (°)</legend>
              <p className="leading-relaxed text-slate-400">{s.rotateHint}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(["z", "x", "y"] as const).map((k) => (
                  <label key={k} className="block">
                    <span className="mb-0.5 block text-slate-400">{s.about[k]}</span>
                    <input
                      type="number"
                      step={5}
                      value={angles[k]}
                      aria-label={`${s.rotation} ${s.about[k]}`}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!Number.isFinite(value)) return;
                        p.onChangeClipPlanes(rotateClip(clip, rotationFromAngles({ ...angles, [k]: value }), p.bounds));
                      }}
                      className="h-8 w-full rounded-md border border-white/15 bg-slate-900 px-1.5 font-mono outline-none focus:border-teal-400"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                className={button}
                disabled={!turned}
                onClick={() => p.onChangeClipPlanes(rotateClip(clip, rotationFromAngles({ x: 0, y: 0, z: 0 }), p.bounds))}
              >
                <RotateCcw className="size-4" />
                {s.resetRotation}
              </button>
            </fieldset>
          )}
          {single !== null && (() => {
            const key = HANDLE_KEYS[single][clip.flip ? "min" : "max"];
            // A turned plane has no world axis: measure from the model's edge along its normal.
            const span = localBounds(p.bounds, clipRotation(clip));
            const axis = turned
              ? {
                  id: "n",
                  range: [0, span.max[single] - span.min[single]],
                  toWorld: (v: number) => v - span.min[single],
                  toScene: (w: number) => w + span.min[single],
                }
              : axisOf(single);
            const [min, max] = axis.range;
            const value = axis.toWorld(Number(clip[key]));
            return (
              <div className="space-y-2 rounded-lg border border-white/10 p-2">
                <label className="block">
                  <span className="flex justify-between">
                    <span>{s.position} ({axis.id}, m)</span>
                    <output className="font-mono">{fmt(value)}</output>
                  </span>
                  <input
                    type="range"
                    aria-label={`${s.position} ${axis.id}`}
                    min={min}
                    max={max}
                    step={Math.max(0.001, (max - min) / 400)}
                    value={Math.min(max, Math.max(min, value))}
                    onChange={(e) =>
                      p.onChangeClipPlanes({ ...clip, [key]: axis.toScene(Number(e.target.value)) })
                    }
                    className="min-h-8 w-full accent-teal-400"
                  />
                </label>
                <button
                  type="button"
                  className={button}
                  // Keep the cut where it is and show the other side.
                  onClick={() => p.onChangeClipPlanes(flipClip(clip, p.bounds))}
                >
                  <ArrowLeftRight className="size-4" />
                  {s.flip}
                </button>
              </div>
            );
          })()}
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
          {single === null && !turned && sectionAxes(p.sceneOrigin, p.bounds).map((axis) => {
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
        );
      })()}

      {p.activeTool === "measure" && (
        <div className="space-y-3">
          <div
            className="grid grid-cols-2 gap-1"
            role="radiogroup"
            aria-label={o.measureType}
          >
            {MEASURE_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={p.measureMode === mode}
                onClick={() => p.onMeasureMode(mode)}
                className={`min-h-9 rounded-lg border px-2 text-left leading-tight ${p.measureMode === mode ? "border-teal-400 bg-teal-500/15 text-teal-200" : "border-white/10"}`}
              >
                {o.modes[mode]}
              </button>
            ))}
          </div>
          <p className="leading-relaxed text-slate-400">{o.modeHelp[p.measureMode]}</p>
          {p.pendingCount > 0 && (
            <div role="status" className="space-y-2 rounded-lg border border-teal-400/30 bg-teal-500/10 p-2 text-teal-100">
              <p className="flex items-center gap-2">
                <Crosshair className="size-4" />
                {o.pointsPlaced(p.pendingCount)}
              </p>
              {isOpenEnded(p.measureMode) && (
                <button
                  type="button"
                  disabled={!finishable}
                  onClick={() => p.onFinishMeasurement()}
                  className="flex min-h-9 w-full items-center justify-center rounded-lg bg-teal-400 px-3 font-semibold text-slate-950 disabled:opacity-40"
                >
                  {o.finishMeasurement}
                </button>
              )}
            </div>
          )}
          <fieldset className="rounded-lg border border-white/10 p-2">
            <legend className="px-1 font-bold">{o.snapping}</legend>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {(
                [
                  ["vertex", o.vertex, "bg-amber-500"],
                  ["midpoint", o.midpoint, "bg-purple-500"],
                  ["edge", o.edge, "bg-cyan-500"],
                  ["center", o.centre, "bg-pink-500"],
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
          <fieldset className="rounded-lg border border-white/10 p-2">
            <legend className="px-1 font-bold">{o.lock}</legend>
            <div className="flex flex-wrap gap-1">
              {MEASURE_LOCKS.map((lock) => (
                <button
                  key={lock}
                  type="button"
                  aria-pressed={p.measureLock === lock}
                  title={o.lockNames[lock]}
                  aria-label={o.lockNames[lock]}
                  onClick={() => p.onMeasureLock(p.measureLock === lock ? null : lock)}
                  className={`min-h-8 min-w-9 rounded-lg border px-2 font-mono ${p.measureLock === lock ? "border-amber-400 bg-amber-500/15 text-amber-200" : "border-white/10"}`}
                >
                  {LOCK_SYMBOLS[lock]}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{o.lockHelp}</p>
          </fieldset>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-slate-400">{o.units}</span>
              <select
                value={p.measureUnits.unit}
                onChange={(e) => p.onMeasureUnits({ ...p.measureUnits, unit: e.target.value as MeasureUnits["unit"] })}
                className="mt-1 min-h-9 w-full rounded-lg border border-white/15 bg-slate-900 px-2"
              >
                {(Object.keys(UNIT_METRES) as MeasureUnits["unit"][]).map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-slate-400">{o.precision}</span>
              <select
                value={p.measureUnits.precision}
                onChange={(e) => p.onMeasureUnits({ ...p.measureUnits, precision: Number(e.target.value) })}
                className="mt-1 min-h-9 w-full rounded-lg border border-white/15 bg-slate-900 px-2"
              >
                {[0, 1, 2, 3, 4].map((digits) => (
                  <option key={digits} value={digits}>{(0).toFixed(digits)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={button} disabled={!p.canUndoMeasurement} onClick={p.onUndoMeasurement}>
              <Undo2 className="size-4" />
              {o.undo}
            </button>
            <button type="button" className={button} disabled={!p.canRedoMeasurement} onClick={p.onRedoMeasurement}>
              <Redo2 className="size-4" />
              {o.redo}
            </button>
          </div>
          {p.measurements.length > 0 && (
            <ol className="space-y-2">
              {p.measurements.map((m, i) => {
                const metrics = triangleMetrics(m.points);
                const coords = m.points.map(world);
                const s =
                  (m.mode === "distance" || m.mode === "shortest") && m.points[1]
                    ? distanceSummary(m.points[0], m.points[1])
                    : null;
                const row = (term: React.ReactNode, value: React.ReactNode, key?: React.Key, strong = false) => (
                  <React.Fragment key={key}>
                    <dt className="text-slate-400">{term}</dt>
                    <dd className={`text-right ${strong ? "text-teal-200" : ""}`}>{value}</dd>
                  </React.Fragment>
                );
                let details: React.ReactNode;
                if (s) {
                  details = (
                    <>
                      {row(m.mode === "shortest" ? "min" : "L", len(s.distance), undefined, true)}
                      {row(o.plan, len(s.horizontal))}
                      {row("ΔX · ΔY · ΔZ", `${len(s.dx)} · ${len(s.dy)} · ${len(s.dz)}`)}
                    </>
                  );
                } else if (m.mode === "multipoint") {
                  details = multipointDistances(m.points).map((d, k) => row(`→ ${k + 1}`, len(d), k, true));
                } else if (m.mode === "accumulate") {
                  const { segments, total } = accumulateSegments(m.points);
                  details = (
                    <>
                      {row("Σ L", len(total), undefined, true)}
                      {row(o.segments, segments.length)}
                    </>
                  );
                } else if (m.mode === "polyline") {
                  details = (
                    <>
                      {row("Σ L", len(polylineLength(m.points)), undefined, true)}
                      {row(o.vertices, m.points.length)}
                    </>
                  );
                } else if (m.mode === "polygon") {
                  const polygon = polygonMetrics(m.points);
                  details = polygon && (
                    <>
                      {row("A", area(polygon.area), undefined, true)}
                      {row(o.plan, area(polygon.planArea))}
                      {row(o.perimeter, len(polygon.perimeter))}
                    </>
                  );
                } else if (m.mode === "arc") {
                  const arc = arcThrough(m.points);
                  details = arc ? (
                    <>
                      {row("R", len(arc.radius), undefined, true)}
                      {row("Ø", len(arc.radius * 2))}
                      {row(o.arcLength, len(arc.length))}
                      {row(o.modes.angle, `${fmt(arc.angle)}°`)}
                    </>
                  ) : (
                    row("R", "—")
                  );
                } else if (m.mode === "angle" || m.mode === "triangle") {
                  details = row(
                    o.modes[m.mode],
                    metrics ? (m.mode === "angle" ? `${fmt(metrics.angle)}°` : area(metrics.area)) : "—",
                    undefined,
                    true,
                  );
                } else {
                  details = (
                    <>
                      {(["X", "Y", "Z"] as const).map((axis, k) => row(`${axis} (m)`, fmt(coords[0][k]), axis))}
                      {p.mapConversion &&
                        row("E · N · H", worldToMap(coords[0], p.mapConversion).map(fmt).join(" · "))}
                    </>
                  );
                }
                return (
                  <li key={m.id} className={`rounded-lg p-2 ${m.mode === "shortest" ? "bg-amber-500/10" : "bg-teal-500/10"}`}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-semibold">
                        #{i + 1} · {o.modes[m.mode]}
                      </span>
                      <button
                        type="button"
                        aria-label={o.deleteMeasurement}
                        onClick={() => p.onRemoveMeasurement(m.id)}
                        className="grid size-7 place-items-center rounded hover:bg-white/10"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[11px]">
                      {details}
                    </dl>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {o.snap}:{" "}
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
              <button type="button" className={button} onClick={p.onRedlineMeasurements}>
                <PenLine className="size-4" />
                {o.toMarkup}
              </button>
              <button type="button" className={button} onClick={p.onMeasurementIssue}>
                <MessageSquarePlus className="size-4" />
                {o.toIssue}
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
          {p.explodeFactor > 0 && p.measurements.length > 0 && (
            <p role="status" className="leading-relaxed text-amber-200">
              {o.measurementsHiddenWhileExploded(p.measurements.length)}
            </p>
          )}
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
          {p.clashPanel}
          <div className="space-y-2 rounded-lg border border-white/10 p-2">
            <p className="font-semibold text-teal-200">{ui(locale).bimClash.issues.title}</p>
            <input
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder={ui(locale).bimClash.issues.titlePlaceholder}
              className="min-h-9 w-full rounded border border-white/15 bg-slate-900 px-2"
            />
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder={ui(locale).bimClash.issues.descriptionPlaceholder}
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
              {ui(locale).bimClash.issues.add}
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" className={button} disabled={!p.issues.length} onClick={p.onExportIssuesBcf}>
              <Download className="size-3.5" />
              {ui(locale).bimClash.issues.exportBcf}
            </button>
            <label className={`${button} cursor-pointer`}>
              <Upload className="size-3.5" />
              {ui(locale).bimClash.issues.importBcf}
              <input
                type="file"
                accept=".bcfzip,.bcf,application/zip"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) p.onImportBcf(file);
                }}
              />
            </label>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-500">{ui(locale).bimClash.issues.bcfHint}</p>
          {p.issues.map((issue) => {
            const s = ui(locale).bimClash.issues;
            const snapshot = p.issueSnapshots[issue.id];
            return (
              <div key={issue.id} className="rounded-lg border border-white/10 p-2">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => p.onGoToIssue(issue)}
                    title={s.goTo}
                  >
                    {snapshot && (
                      // eslint-disable-next-line @next/next/no-img-element -- in-memory data URL
                      <img src={snapshot} alt="" className="mb-1.5 aspect-video w-full rounded object-cover" />
                    )}
                    <span className="block font-semibold">{issue.title}</span>
                    <span className="block text-[10px] text-slate-400">
                      <span className={issue.status === "resolved" ? "text-emerald-300" : "text-amber-300"}>
                        {s.status[issue.status]}
                      </span>
                      {issue.type ? ` · ${issue.type}` : ""} · {issue.description || s.noDescription}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="grid size-7 shrink-0 place-items-center rounded text-red-300 hover:bg-white/10"
                    onClick={() => p.onDeleteIssue(issue.id)}
                    aria-label={`${s.remove}: ${issue.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" className={`${button} min-h-8`} onClick={() => p.onGoToIssue(issue)}>
                    <Crosshair className="size-3.5" />
                    {s.goTo}
                  </button>
                  <button type="button" className={`${button} min-h-8`} onClick={() => p.onToggleIssue(issue.id)}>
                    {issue.status === "resolved" ? s.reopen : s.markResolved}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {p.activeTool === "views" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder={ui(locale).bimControlsOverlay.viewName}
              aria-label={ui(locale).bimControlsOverlay.viewName}
              className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-slate-900 px-2"
            />
            <button
              type="button"
              className="min-h-10 rounded-lg border border-teal-500/40 px-3 text-teal-200"
              onClick={() => {
                const name =
                  viewName.trim() || ui(locale).bimControlsOverlay.defaultViewName(p.savedViews.length + 1);
                p.onSaveView(name);
                setViewName("");
              }}
            >
              {ui(locale).bimControlsOverlay.saveView}
            </button>
          </div>
          <p className="text-slate-400">
            {ui(locale).bimControlsOverlay.savedViewHelp}
          </p>
          {!p.savedViews.length && (
            <p className="text-slate-400">{ui(locale).bimControlsOverlay.noSavedViews}</p>
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
                aria-label={ui(locale).bimControlsOverlay.deleteView(view.name)}
              >
                ×
              </button>
            </div>
          ))}

          <div className="space-y-2 border-t border-white/10 pt-3">
            <p className="font-semibold text-teal-200">{ui(locale).bimControlsOverlay.selectionSets}</p>
            <div className="flex gap-2">
              <input
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder={ui(locale).bimControlsOverlay.selectionSetName}
                aria-label={ui(locale).bimControlsOverlay.selectionSetName}
                className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-slate-900 px-2"
              />
              <button
                type="button"
                disabled={!p.selectedElementIds.size}
                className="min-h-10 rounded-lg border border-teal-500/40 px-3 text-teal-200 disabled:opacity-40"
                onClick={() => {
                  p.onSaveSelectionSet(
                    setName.trim() || ui(locale).bimControlsOverlay.defaultSelectionSetName(p.selectionSets.length + 1),
                  );
                  setSetName("");
                }}
              >
                {ui(locale).bimControlsOverlay.saveSelection(p.selectedElementIds.size)}
              </button>
            </div>
            <p className="text-slate-400">{ui(locale).bimControlsOverlay.selectionSetHelp}</p>
            {p.selectionSets.map((set) => (
              <div key={set.id} className="flex items-center gap-2 rounded-lg border border-white/10 p-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-teal-200"
                  onClick={() => p.onApplySelectionSet(set)}
                >
                  {set.name}
                  <span className="ml-2 text-[10px] text-slate-400">{ui(locale).bimControlsOverlay.elementCount(set.guids.length)}</span>
                </button>
                <button
                  type="button"
                  className="rounded px-2 text-red-300 hover:bg-white/10"
                  onClick={() => p.onDeleteSelectionSet(set.id)}
                  aria-label={ui(locale).bimControlsOverlay.deleteView(set.name)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
