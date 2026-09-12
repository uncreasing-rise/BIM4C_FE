"use client";

import React from "react";
import {
  MousePointer,
  Ruler,
  Scissors,
  Layers,
  Sparkles,
  RotateCcw,
  Maximize2,
  Minimize2,
  Camera,
  FolderOpen,
  AlertTriangle,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { BimTool, BimViewPreset } from "./types";

interface BimToolbarProps {
  activeTool: BimTool;
  onSelectTool: (tool: BimTool) => void;
  activeViewPreset: BimViewPreset | null;
  onSelectViewPreset: (preset: BimViewPreset) => void;
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onResetView: () => void;
  onTakeSnapshot: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  clashesCount: number;
}

export function BimToolbar({
  activeTool,
  onSelectTool,
  activeViewPreset,
  onSelectViewPreset,
  selectedModelId,
  onSelectModel,
  onResetView,
  onTakeSnapshot,
  isFullscreen,
  onToggleFullscreen,
  clashesCount,
}: BimToolbarProps) {
  const { t } = useLanguage();
  const v = t.bimViewerPage;

  const tools: { id: BimTool; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "orbit", label: v.tools.orbit, icon: MousePointer },
    { id: "measure", label: v.tools.measure, icon: Ruler },
    { id: "section", label: v.tools.section, icon: Scissors },
    { id: "explode", label: v.tools.explode, icon: Sparkles },
    { id: "layers", label: v.tools.layers, icon: Layers },
    { id: "clashes", label: v.tools.clashes, icon: AlertTriangle },
  ];

  const viewPresets: { id: BimViewPreset; label: string }[] = [
    { id: "perspective", label: v.views.perspective },
    { id: "top", label: v.views.top },
    { id: "front", label: v.views.front },
    { id: "right", label: v.views.right },
    { id: "isometric", label: v.views.isometric },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex flex-col items-center gap-3 px-4 sm:px-6">
      {/* Top Main Toolbar */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-slate-950/80 px-3 py-2 text-white shadow-2xl backdrop-blur-xl">
        {/* Model Selector */}
        <div className="flex items-center gap-2 border-r border-white/10 pr-3">
          <FolderOpen className="size-4 text-teal-400" />
          <select
            value={selectedModelId}
            onChange={(e) => onSelectModel(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-900/90 px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
            aria-label={v.selectModel}
          >
            <option value="tower">{v.models.tower}</option>
            <option value="steel">{v.models.steel}</option>
            <option value="mep">{v.models.mep}</option>
          </select>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-1">
          {tools.map((item) => {
            const Icon = item.icon;
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTool(item.id)}
                title={item.label}
                aria-label={item.label}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden md:inline">{item.label}</span>
                {item.id === "clashes" && clashesCount > 0 && (
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                      isActive
                        ? "bg-slate-950 text-teal-300"
                        : "bg-red-500 text-white animate-pulse",
                    )}
                  >
                    {clashesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Presets & Utility Controls */}
        <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-0.5 rounded-xl">
            {viewPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectViewPreset(preset.id)}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                  activeViewPreset === preset.id
                    ? "bg-white/20 text-teal-300"
                    : "text-slate-400 hover:text-white",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onResetView}
            title={v.tools.reset}
            aria-label={v.tools.reset}
            className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="size-4" />
          </button>

          <button
            type="button"
            onClick={onTakeSnapshot}
            title={v.tools.snapshot}
            aria-label={v.tools.snapshot}
            className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Camera className="size-4" />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={v.tools.fullscreen}
            aria-label={v.tools.fullscreen}
            className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
