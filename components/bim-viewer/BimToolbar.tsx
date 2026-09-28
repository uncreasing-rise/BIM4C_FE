"use client";
import { useLanguage } from "@/lib/i18n/context";
import {
  AlertTriangle,
  Bookmark,
  Boxes,
  Camera,
  Keyboard,
  GitCompareArrows,
  Footprints,
  PenLine,
  Calculator,
  Building2,
  Layers,
  Maximize2,
  Minimize2,
  MousePointer,
  RotateCcw,
  Ruler,
  Scissors,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { BimTool, BimViewPreset } from "./types";
import { ui } from "@/lib/i18n/ui";
interface Props {
  activeTool: BimTool;
  onSelectTool: (tool: BimTool) => void;
  onSelectViewPreset: (view: BimViewPreset) => void;
  modelCount: number;
  onResetView: () => void;
  onTakeSnapshot: () => void;
  onShowShortcuts: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  clashesCount: number;
}
export function BimToolbar(p: Props) {
  const { t, locale } = useLanguage();
  const v = t.bimViewerPage;
  const tools = [
    { id: "orbit", icon: MousePointer },
    { id: "models", icon: Boxes },
    { id: "walk", icon: Footprints },
    { id: "levels", icon: Building2 },
    { id: "measure", icon: Ruler },
    { id: "section", icon: Scissors },
    { id: "explode", icon: Sparkles },
    { id: "layers", icon: Layers },
    { id: "compare", icon: GitCompareArrows },
    { id: "clashes", icon: AlertTriangle },
    { id: "quantities", icon: Calculator },
    { id: "markup", icon: PenLine },
    { id: "views", icon: Bookmark },
    { id: "display", icon: SlidersHorizontal },
  ] as const;
  const views = ["perspective", "top", "front", "right", "isometric"] as const;
  return (
    <div
      className="z-20 flex shrink-0 flex-col gap-2 border-b border-white/10 bg-slate-950/95 p-2 lg:flex-row lg:items-center lg:justify-between"
      aria-label={ui(locale).bimToolbar.modelControls}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2 lg:flex-1 lg:flex-nowrap">
        <span className="min-h-10 min-w-0 flex-1 content-center truncate rounded-lg border border-white/15 bg-slate-900 px-2 text-xs lg:max-w-64">
          {p.modelCount
            ? ui(locale).formats.modelsInScene(p.modelCount)
            : ui(locale).bimToolbar.noIFCLoaded}
        </span>
        <select
          aria-label={ui(locale).bimToolbar.viewPreset}
          value=""
          onChange={(e) => {
            if (e.target.value)
              p.onSelectViewPreset(e.target.value as BimViewPreset);
          }}
          className="min-h-10 min-w-0 max-w-[45%] rounded-lg border border-white/15 bg-slate-900 px-2 text-xs"
        >
          <option value="" disabled>
            {ui(locale).bimToolbar.viewPreset}
          </option>
          {views.map((view) => (
            <option key={view} value={view}>
              {v.views[view]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 sm:justify-start lg:shrink-0 lg:flex-nowrap">
        <div className="flex flex-wrap items-center gap-1 lg:flex-nowrap">
          {tools.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              data-tool={id}
              onClick={() => p.onSelectTool(id)}
              title={id === "views" ? ui(locale).bimToolbar.savedViews : v.tools[id]}
              aria-label={id === "views" ? ui(locale).bimToolbar.savedViews : v.tools[id]}
              aria-pressed={p.activeTool === id}
              className={`relative flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-lg px-2 text-xs ${p.activeTool === id ? "bg-teal-400 text-slate-950" : "text-slate-300 hover:bg-white/10"}`}
            >
              <Icon className="size-4" />
              {/* All fourteen labels need ~1800px; below that only the active one shows. */}
              <span
                className={`hidden whitespace-nowrap min-[1800px]:inline ${p.activeTool === id ? "xl:inline" : ""}`}
              >
                {id === "views" ? ui(locale).bimToolbar.views : v.tools[id]}
              </span>
              {id === "models" && p.modelCount > 0 && (
                <span className="absolute right-0 top-0 rounded bg-teal-600 px-1 text-[9px] text-white">
                  {p.modelCount}
                </span>
              )}
              {id === "clashes" && p.clashesCount > 0 && (
                <span className="absolute right-0 top-0 rounded bg-red-600 px-1 text-[9px] text-white">
                  {p.clashesCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 border-l border-white/15 pl-1">
          <button
            type="button"
            data-action="fit"
            onClick={p.onResetView}
            aria-label={v.tools.reset}
            title={v.tools.reset}
            className="grid min-h-10 min-w-10 place-items-center rounded-lg hover:bg-white/10"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            onClick={p.onShowShortcuts}
            aria-label={ui(locale).bimShortcuts.open}
            title={`${ui(locale).bimShortcuts.open} (?)`}
            className="grid min-h-10 min-w-10 place-items-center rounded-lg hover:bg-white/10"
          >
            <Keyboard className="size-4" />
          </button>
          <button
            type="button"
            data-action="snapshot"
            onClick={p.onTakeSnapshot}
            aria-label={v.tools.snapshot}
            title={v.tools.snapshot}
            className="grid min-h-10 min-w-10 place-items-center rounded-lg hover:bg-white/10"
          >
            <Camera className="size-4" />
          </button>
          <button
            type="button"
            onClick={p.onToggleFullscreen}
            aria-label={v.tools.fullscreen}
            title={v.tools.fullscreen}
            className="grid min-h-10 min-w-10 place-items-center rounded-lg hover:bg-white/10"
          >
            {p.isFullscreen ? (
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
