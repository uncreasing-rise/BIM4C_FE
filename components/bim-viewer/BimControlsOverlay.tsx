"use client";
import React from "react";
import { X, RotateCcw, Crosshair } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { defaultClip } from "./viewer-geometry";
import type {
  BimTool,
  BimDiscipline,
  ActiveMeasurement,
  BimClashItem,
  BimClipPlanes,
  BimBounds,
} from "./types";
interface Props {
  activeTool: BimTool;
  onCloseTool: () => void;
  clipPlanes: BimClipPlanes;
  onChangeClipPlanes: (planes: BimClipPlanes) => void;
  bounds: BimBounds;
  measurement: ActiveMeasurement | null;
  onClearMeasurement: () => void;
  explodeFactor: number;
  onChangeExplodeFactor: (value: number) => void;
  visibleLayers: Record<BimDiscipline, boolean>;
  onToggleLayer: (layer: BimDiscipline) => void;
  clashes: BimClashItem[];
  onFocusClash: (clash: BimClashItem) => void;
  activeClashId: string | null;
}
export function BimControlsOverlay(p: Props) {
  const { t, locale } = useLanguage();
  const vi = locale === "vi";
  const v = t.bimViewerPage;
  if (p.activeTool === "orbit") return null;
  const title =
    p.activeTool === "section"
      ? vi
        ? "Hộp cắt 6 mặt"
        : "Six-plane section box"
      : v.tools[p.activeTool];
  const button =
    "flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-xs hover:bg-white/10";
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
          aria-label={vi ? "Đóng công cụ" : "Close tool"}
          onClick={p.onCloseTool}
          className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
      {p.activeTool === "section" && (
        <div className="space-y-3">
          <label className="flex min-h-10 items-center justify-between">
            {vi ? "Kích hoạt hộp cắt" : "Enable section box"}
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
          {(["x", "y", "z"] as const).map((axis, index) => {
            const lower = ({ x: "minX", y: "minY", z: "minZ" } as const)[axis];
            const min = p.bounds.min[index],
              max = p.bounds.max[index];
            const step = Math.max(0.0001, (max - min) / 200);
            return (
              <fieldset
                key={axis}
                className="space-y-2 rounded-lg border border-white/10 p-2"
              >
                <legend className="px-1 font-bold">
                  {axis.toUpperCase()} (m)
                </legend>
                {([lower, axis] as const).map((key, i) => (
                  <label key={key} className="block">
                    <span className="flex justify-between">
                      <span>
                        {i === 0
                          ? vi
                            ? "Giới hạn dưới"
                            : "Lower bound"
                          : vi
                            ? "Giới hạn trên"
                            : "Upper bound"}
                      </span>
                      <output>{p.clipPlanes[key].toFixed(3)}</output>
                    </span>
                    <input
                      aria-label={`${axis.toUpperCase()} ${i === 0 ? (vi ? "dưới" : "lower") : vi ? "trên" : "upper"}`}
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      disabled={!p.clipPlanes.enabled || min === max}
                      value={p.clipPlanes[key]}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        p.onChangeClipPlanes({
                          ...p.clipPlanes,
                          [key]:
                            i === 0
                              ? Math.min(value, p.clipPlanes[axis])
                              : Math.max(value, p.clipPlanes[lower]),
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
          <p className="leading-relaxed text-slate-400">
            {vi
              ? "Chọn hai điểm trên bề mặt đang nhìn thấy. Phép đo theo vị trí hiển thị; khi phân rã, khoảng cách cũng thay đổi. Không có bắt điểm đỉnh tự động."
              : "Select two points on visible surfaces. Distances use displayed positions, including exploded offsets. Automatic vertex snapping is not enabled."}
          </p>
          {p.measurement?.distance !== undefined ? (
            <dl className="space-y-2 rounded-lg bg-teal-500/10 p-3">
              {[
                [v.measure.distance, p.measurement.distance],
                [v.measure.deltaX, p.measurement.deltaX],
                [v.measure.deltaY, p.measurement.deltaY],
                [v.measure.deltaZ, p.measurement.deltaZ],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between gap-2">
                  <dt>{label}</dt>
                  <dd className="font-mono text-teal-300">
                    {Number(value).toFixed(3)} m
                  </dd>
                </div>
              ))}
            </dl>
          ) : p.measurement?.p1 ? (
            <p role="status" className="flex items-center gap-2">
              <Crosshair className="size-4" />
              {vi
                ? "Đã chọn điểm 1. Chọn điểm 2."
                : "Point 1 selected. Select point 2."}
            </p>
          ) : null}
          {p.measurement && (
            <button
              type="button"
              className={button}
              onClick={p.onClearMeasurement}
            >
              {v.measure.clear}
            </button>
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
            {vi ? "Thu gọn mô hình" : "Collapse model"}
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
          <p className="leading-relaxed text-amber-200">
            {vi
              ? "Mô hình chưa có dữ liệu kiểm tra xung đột. Hãy tải IFC đã được kiểm tra để xem các issue."
              : "No clash results are available for this model. Load an IFC with coordination issues to review them."}
          </p>
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
    </section>
  );
}
