"use client";

import React from "react";
import {
  Scissors,
  Ruler,
  Sparkles,
  Layers,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  Crosshair,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type {
  BimTool,
  BimDiscipline,
  ActiveMeasurement,
  BimClashItem,
} from "./types";

interface BimControlsOverlayProps {
  activeTool: BimTool;
  onCloseTool: () => void;
  // Section Slicing
  clipPlanes: { x: number; y: number; z: number; enabled: boolean };
  onChangeClipPlanes: (planes: { x: number; y: number; z: number; enabled: boolean }) => void;
  // Measurement
  measurement: ActiveMeasurement | null;
  onClearMeasurement: () => void;
  // Exploded View
  explodeFactor: number;
  onChangeExplodeFactor: (factor: number) => void;
  // Layers
  visibleLayers: Record<BimDiscipline, boolean>;
  onToggleLayer: (layer: BimDiscipline) => void;
  // Clashes
  clashes: BimClashItem[];
  onFocusClash: (clash: BimClashItem) => void;
  activeClashId: string | null;
}

export function BimControlsOverlay({
  activeTool,
  onCloseTool,
  clipPlanes,
  onChangeClipPlanes,
  measurement,
  onClearMeasurement,
  explodeFactor,
  onChangeExplodeFactor,
  visibleLayers,
  onToggleLayer,
  clashes,
  onFocusClash,
  activeClashId,
}: BimControlsOverlayProps) {
  const { t, locale } = useLanguage();
  const v = t.bimViewerPage;

  if (activeTool === "orbit") return null;

  return (
    <div
      className="pointer-events-auto absolute left-4 top-20 z-30 w-72 sm:w-80 rounded-2xl border border-white/15 bg-slate-950/90 p-4 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300"
      data-motion="tile"
    >
      {/* 1. Section Slicing Tool */}
      {activeTool === "section" && (
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Scissors className="size-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {v.sections.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={onCloseTool}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">
                {locale === "vi" ? "Kích hoạt mặt cắt" : "Enable Cross-Section"}
              </span>
              <input
                type="checkbox"
                checked={clipPlanes.enabled}
                onChange={(e) =>
                  onChangeClipPlanes({ ...clipPlanes, enabled: e.target.checked })
                }
                className="size-4 accent-teal-400"
              />
            </div>

            {/* Plane X */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>{v.sections.axisX}</span>
                <span className="font-mono font-bold text-teal-300">
                  {clipPlanes.x.toFixed(1)} m
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="0.5"
                disabled={!clipPlanes.enabled}
                value={clipPlanes.x}
                onChange={(e) =>
                  onChangeClipPlanes({ ...clipPlanes, x: parseFloat(e.target.value) })
                }
                className="w-full accent-teal-400"
              />
            </div>

            {/* Plane Y (Height) */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>{v.sections.axisY}</span>
                <span className="font-mono font-bold text-teal-300">
                  {clipPlanes.y.toFixed(1)} m
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="25"
                step="0.5"
                disabled={!clipPlanes.enabled}
                value={clipPlanes.y}
                onChange={(e) =>
                  onChangeClipPlanes({ ...clipPlanes, y: parseFloat(e.target.value) })
                }
                className="w-full accent-teal-400"
              />
            </div>

            {/* Plane Z */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>{v.sections.axisZ}</span>
                <span className="font-mono font-bold text-teal-300">
                  {clipPlanes.z.toFixed(1)} m
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="0.5"
                disabled={!clipPlanes.enabled}
                value={clipPlanes.z}
                onChange={(e) =>
                  onChangeClipPlanes({ ...clipPlanes, z: parseFloat(e.target.value) })
                }
                className="w-full accent-teal-400"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                onChangeClipPlanes({ x: 20, y: 25, z: 20, enabled: true })
              }
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              <RotateCcw className="size-3.5" /> {v.sections.resetClipping}
            </button>
          </div>
        </div>
      )}

      {/* 2. 3D Measurement Tool */}
      {activeTool === "measure" && (
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Ruler className="size-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {v.measure.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={onCloseTool}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-300 space-y-3">
            <p className="leading-relaxed text-slate-400">
              {v.measure.instruction}
            </p>

            {measurement && measurement.distance !== undefined ? (
              <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{v.measure.distance}:</span>
                  <span className="font-mono text-base font-bold text-teal-300">
                    {measurement.distance} m
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 border-t border-white/10 pt-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">{v.measure.deltaX}</span>
                    <span className="font-mono font-semibold text-white">{measurement.deltaX} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{v.measure.deltaY}</span>
                    <span className="font-mono font-semibold text-white">{measurement.deltaY} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{v.measure.deltaZ}</span>
                    <span className="font-mono font-semibold text-white">{measurement.deltaZ} m</span>
                  </div>
                </div>
              </div>
            ) : measurement?.p1 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                <Crosshair className="size-5 text-teal-400 mx-auto mb-1 animate-pulse" />
                <span className="text-slate-300 font-semibold">
                  {locale === "vi" ? "Đã chọn điểm 1." : "Point 1 selected."}
                </span>
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  {locale === "vi" ? "Click chọn điểm thứ 2 để đo khoảng cách." : "Click 2nd point to measure distance."}
                </span>
              </div>
            ) : null}

            {measurement && (
              <button
                type="button"
                onClick={onClearMeasurement}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                {v.measure.clear}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Exploded View Tool */}
      {activeTool === "explode" && (
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {v.explode.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={onCloseTool}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>{v.explode.intensity}</span>
                <span className="font-mono font-bold text-teal-300">
                  {Math.round(explodeFactor * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={explodeFactor}
                onChange={(e) => onChangeExplodeFactor(parseFloat(e.target.value))}
                className="w-full accent-teal-400"
              />
            </div>
            <button
              type="button"
              onClick={() => onChangeExplodeFactor(0)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              <RotateCcw className="size-3.5" /> {locale === "vi" ? "Thu gọn mô hình" : "Collapse Model"}
            </button>
          </div>
        </div>
      )}

      {/* 4. Layer Visibility Tool */}
      {activeTool === "layers" && (
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {v.tools.layers}
              </h4>
            </div>
            <button
              type="button"
              onClick={onCloseTool}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {[
              { id: "architecture" as BimDiscipline, label: v.layers.architecture, color: "#38bdf8" },
              { id: "structure" as BimDiscipline, label: v.layers.structure, color: "#94a3b8" },
              { id: "mep" as BimDiscipline, label: v.layers.mep, color: "#06b6d4" },
              { id: "clash" as BimDiscipline, label: v.layers.clashMarkers, color: "#ef4444" },
            ].map((layer) => (
              <label
                key={layer.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="font-medium text-slate-200">{layer.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={visibleLayers[layer.id]}
                  onChange={() => onToggleLayer(layer.id)}
                  className="size-4 accent-teal-400"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 5. Clash Matrix Tool */}
      {activeTool === "clashes" && (
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {v.clashes.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={onCloseTool}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 space-y-3 max-h-80 overflow-y-auto pr-1">
            <p className="text-[11px] text-slate-400">
              {v.clashes.count(clashes.length)}
            </p>

            {clashes.map((clash) => {
              const isSelected = clash.id === activeClashId;
              return (
                <div
                  key={clash.id}
                  onClick={() => onFocusClash(clash)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3 transition-all text-xs",
                    isSelected
                      ? "border-teal-400 bg-teal-500/15 shadow-lg shadow-teal-500/20"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                        clash.severity === "high"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                      )}
                    >
                      {clash.severity === "high"
                        ? v.clashes.severity.high
                        : v.clashes.severity.medium}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      BCF #{clash.id}
                    </span>
                  </div>
                  <h5 className="mt-2 font-bold text-white leading-snug">
                    {clash.title}
                  </h5>
                  <p className="mt-1 text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    {clash.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-teal-300 font-semibold">
                    <span>{v.clashes.focusClash}</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
