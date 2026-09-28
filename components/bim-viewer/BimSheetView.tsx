"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, Maximize2, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import { segmentsPath, sheetSvg, type PlanDrawing } from "./plan-drawing";

type ViewBox = { x: number; y: number; w: number; h: number };

/**
 * The 2D sheet beside the 3D view (split screen): a floor plan cut from the
 * model. Clicking a line selects its element in 3D; selected elements are
 * highlighted; the 3D camera is shown as a wedge.
 */
export function BimSheetView({
  drawing,
  levels,
  levelId,
  onLevel,
  selectedIds,
  onSelect,
  camera,
  project,
  busy,
  onClose,
}: {
  drawing: PlanDrawing | null;
  levels: { id: string; name: string }[];
  levelId: string | null;
  onLevel: (id: string) => void;
  selectedIds: ReadonlySet<string>;
  onSelect: (id: string | null, append: boolean) => void;
  /** Where the 3D camera stands and looks (read every frame). */
  camera: () => { position: [number, number, number]; target: [number, number, number] } | null;
  project: string;
  /** The plan is being cut. */
  busy: boolean;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimSheets;
  const fit = useMemo<ViewBox | null>(() => {
    if (!drawing) return null;
    const b = drawing.bounds;
    return { x: b.minX, y: b.minY, w: b.maxX - b.minX, h: b.maxY - b.minY };
  }, [drawing]);
  const [view, setView] = useState<ViewBox | null>(null);
  const shown = view ?? fit;
  const svgRef = useRef<SVGSVGElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const drag = useRef<{ x: number; y: number; view: ViewBox; moved: boolean } | null>(null);

  // A new drawing is shown whole.
  useEffect(() => {
    const timer = window.setTimeout(() => setView(null), 0);
    return () => window.clearTimeout(timer);
  }, [drawing]);

  // The camera marker follows the 3D view without re-rendering the sheet.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const pose = camera();
      const marker = markerRef.current;
      if (!pose || !marker || !shown) return;
      const [x, , z] = pose.position;
      const angle = (Math.atan2(pose.target[2] - z, pose.target[0] - x) * 180) / Math.PI;
      const size = shown.w / 40;
      marker.setAttribute("transform", `translate(${x} ${z}) rotate(${angle}) scale(${size})`);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [camera, shown]);

  const toSheet = (clientX: number, clientY: number, box: ViewBox) => {
    const rect = svgRef.current!.getBoundingClientRect();
    // preserveAspectRatio="xMidYMid meet": one scale, centred.
    const k = Math.min(rect.width / box.w, rect.height / box.h);
    return {
      x: box.x + (clientX - rect.left - (rect.width - box.w * k) / 2) / k,
      y: box.y + (clientY - rect.top - (rect.height - box.h * k) / 2) / k,
      k,
    };
  };

  const exportSvg = () => {
    if (!drawing) return;
    const svg = sheetSvg(drawing, {
      project,
      sheet: drawing.name,
      date: new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US"),
      scaleLabel: s.scale,
      north: s.north,
    });
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project}-${drawing.name}.svg`.replace(/[\\/:*?"<>|]+/g, "_");
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section aria-label={s.title} className="flex h-full min-h-0 flex-col border-l border-white/15 bg-white text-slate-900">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-950 px-2 py-1.5 text-xs text-slate-200">
        <FileText className="size-4 shrink-0 text-teal-300" />
        <select
          aria-label={s.level}
          value={levelId ?? ""}
          onChange={(e) => onLevel(e.target.value)}
          className="min-h-8 min-w-0 flex-1 rounded-lg border border-white/15 bg-slate-900 px-2"
        >
          <option value="" disabled>
            {s.pickLevel}
          </option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
        <button type="button" title={s.fit} aria-label={s.fit} onClick={() => setView(null)} className="grid size-8 place-items-center rounded-lg hover:bg-white/10">
          <Maximize2 className="size-4" />
        </button>
        <button type="button" title={s.exportSvg} aria-label={s.exportSvg} disabled={!drawing} onClick={exportSvg} className="grid size-8 place-items-center rounded-lg hover:bg-white/10 disabled:opacity-40">
          <Download className="size-4" />
        </button>
        <button type="button" title={s.close} aria-label={s.close} onClick={onClose} className="grid size-8 place-items-center rounded-lg hover:bg-white/10">
          <X className="size-4" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        {!drawing || !shown ? (
          <p className="grid h-full place-items-center p-6 text-center text-sm text-slate-500">{busy ? s.cutting : s.empty}</p>
        ) : (
          <svg
            ref={svgRef}
            role="img"
            aria-label={drawing.name}
            viewBox={`${shown.x} ${shown.y} ${shown.w} ${shown.h}`}
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
            onWheel={(e) => {
              const box = shown;
              const at = toSheet(e.clientX, e.clientY, box);
              const f = e.deltaY > 0 ? 1.2 : 1 / 1.2;
              setView({ x: at.x - (at.x - box.x) * f, y: at.y - (at.y - box.y) * f, w: box.w * f, h: box.h * f });
            }}
            onPointerDown={(e) => {
              drag.current = { x: e.clientX, y: e.clientY, view: shown, moved: false };
              (e.target as Element).setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) d.moved = true;
              if (!d.moved) return;
              const { k } = toSheet(e.clientX, e.clientY, d.view);
              setView({ ...d.view, x: d.view.x - (e.clientX - d.x) / k, y: d.view.y - (e.clientY - d.y) / k });
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              drag.current = null;
              if (!d || d.moved) return;
              const id = (e.target as Element).closest?.("[data-id]")?.getAttribute("data-id") ?? null;
              onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
            }}
          >
            <g fill="none" strokeLinecap="round">
              {drawing.grids.map((g, i) => (
                <line key={i} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke="#94a3b8" strokeWidth={0.8} strokeDasharray="10 3 2 3" vectorEffect="non-scaling-stroke" />
              ))}
              {drawing.elements.map((e) => {
                const selected = selectedIds.has(e.id);
                return (
                  <g key={e.id} data-id={e.id} className="cursor-pointer [&:hover>path]:stroke-teal-600">
                    {/* A wide invisible stroke makes thin lines easy to click. */}
                    <path d={segmentsPath([...e.cut, ...e.below])} stroke="transparent" strokeWidth={10} vectorEffect="non-scaling-stroke" />
                    {e.below.length > 0 && (
                      <path d={segmentsPath(e.below)} stroke={selected ? "#0d9488" : "#64748b"} strokeWidth={selected ? 1.6 : 0.6} vectorEffect="non-scaling-stroke" />
                    )}
                    {e.cut.length > 0 && (
                      <path d={segmentsPath(e.cut)} stroke={selected ? "#0d9488" : "#0f172a"} strokeWidth={selected ? 2.6 : 1.6} vectorEffect="non-scaling-stroke" />
                    )}
                  </g>
                );
              })}
            </g>
            {drawing.grids.flatMap((g, i) =>
              [
                [g.x1, g.y1],
                [g.x2, g.y2],
              ].map(([x, y], j) => (
                <g key={`${i}-${j}`} transform={`translate(${x} ${y}) scale(${shown.w / 60})`} pointerEvents="none">
                  <circle r={1} fill="#fff" stroke="#1e293b" strokeWidth={0.08} />
                  <text y={0.38} fontSize={1} textAnchor="middle" fontWeight={700} fill="#0f172a">
                    {g.tag}
                  </text>
                </g>
              )),
            )}
            {drawing.kind !== "section" && (
              <g ref={markerRef} pointerEvents="none">
                <path d="M0 0 L1.6 -0.7 L1.6 0.7 Z" fill="#14b8a6" fillOpacity={0.35} />
                <circle r={0.35} fill="#0d9488" stroke="#fff" strokeWidth={0.1} />
              </g>
            )}
          </svg>
        )}
        {drawing && (
          <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[11px] text-slate-600 shadow">
            {drawing.kind === "section" ? drawing.name : `${drawing.name} · ${s.cutAt(drawing.height)}`}
          </p>
        )}
      </div>
    </section>
  );
}
