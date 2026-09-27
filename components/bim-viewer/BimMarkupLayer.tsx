"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Circle,
  Download,
  Pencil,
  Redo2,
  Save,
  Square,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import {
  MARKUP_COLORS,
  MARKUP_WIDTHS,
  shapeSvg,
  simplify,
  type MarkupKind,
  type MarkupShape,
} from "./markup";

const TOOLS: { kind: MarkupKind; icon: typeof Pencil }[] = [
  { kind: "pen", icon: Pencil },
  { kind: "arrow", icon: ArrowUpRight },
  { kind: "rect", icon: Square },
  { kind: "ellipse", icon: Circle },
  { kind: "text", icon: Type },
];

let counter = 0;
const newId = () => `mk-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/**
 * Drawing layer over the frozen 3D view. The camera does not move while it is
 * open; shapes are stored normalised to the layer size.
 */
export function BimMarkupLayer({
  initialShapes,
  onSave,
  onExport,
  onClose,
}: {
  initialShapes: MarkupShape[];
  onSave: (shapes: MarkupShape[], name: string) => void;
  onExport: (shapes: MarkupShape[], width: number, height: number) => void;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const s = ui(locale).bimMarkup;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const [shapes, setShapes] = useState<MarkupShape[]>(initialShapes);
  const [undone, setUndone] = useState<MarkupShape[]>([]);
  const [tool, setTool] = useState<MarkupKind>("pen");
  const [color, setColor] = useState<string>(MARKUP_COLORS[0]);
  const [width, setWidth] = useState<number>(MARKUP_WIDTHS[1]);
  const [draft, setDraft] = useState<MarkupShape | null>(null);
  const [textAt, setTextAt] = useState<[number, number] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize({ w: el.clientWidth || 1, h: el.clientHeight || 1 }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const commit = (shape: MarkupShape) => {
    setShapes((list) => [...list, shape]);
    setUndone([]);
  };
  const undo = () =>
    setShapes((list) => {
      if (!list.length) return list;
      setUndone((u) => [...u, list.at(-1)!]);
      return list.slice(0, -1);
    });
  const redo = () =>
    setUndone((u) => {
      if (!u.length) return u;
      setShapes((list) => [...list, u.at(-1)!]);
      return u.slice(0, -1);
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("input")) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) undo();
      else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) redo();
      else if (e.key === "Escape" && !textAt && !saving) onClose();
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  const at = (e: React.PointerEvent): [number, number] => {
    const r = ref.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  const down = (e: React.PointerEvent) => {
    if (e.button !== 0 || textAt || saving !== null) return;
    const p = at(e);
    if (tool === "text") {
      setTextAt(p);
      return;
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraft({ id: newId(), kind: tool, color, width, points: tool === "pen" ? [p] : [p, p] });
  };
  const move = (e: React.PointerEvent) => {
    if (!draft) return;
    const p = at(e);
    setDraft({ ...draft, points: draft.kind === "pen" ? [...draft.points, p] : [draft.points[0], p] });
  };
  const up = () => {
    if (!draft) return;
    const [a, b] = [draft.points[0], draft.points.at(-1)!];
    const big = Math.hypot((b[0] - a[0]) * size.w, (b[1] - a[1]) * size.h) > 4;
    if (draft.kind === "pen" ? draft.points.length > 1 : big)
      commit(draft.kind === "pen" ? { ...draft, points: simplify(draft.points, size.w, size.h) } : draft);
    setDraft(null);
  };

  const button = (active = false) =>
    `grid size-8 place-items-center rounded-md transition ${active ? "bg-teal-400 text-slate-950" : "text-slate-200 hover:bg-white/10"} disabled:opacity-35`;

  return (
    <div className="absolute inset-0 z-30" role="region" aria-label={s.title}>
      <div
        ref={ref}
        className="absolute inset-0 cursor-crosshair touch-none ring-2 ring-inset ring-teal-400/60"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setDraft(null)}
      >
        <svg className="absolute inset-0 size-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
          {[...shapes, ...(draft ? [draft] : [])].map((shape) => (
            <g key={shape.id} dangerouslySetInnerHTML={{ __html: shapeSvg(shape, size.w, size.h) }} />
          ))}
        </svg>
        {textAt && (
          <input
            autoFocus
            aria-label={s.textPlaceholder}
            placeholder={s.textPlaceholder}
            className="absolute rounded border border-teal-400 bg-white/95 px-1 py-0.5 text-sm font-bold text-slate-900 shadow outline-none"
            style={{ left: textAt[0] * size.w, top: textAt[1] * size.h, color }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = e.currentTarget.value.trim();
                if (value) commit({ id: newId(), kind: "text", color, width, points: [textAt], text: value });
                setTextAt(null);
              } else if (e.key === "Escape") setTextAt(null);
              e.stopPropagation();
            }}
            onBlur={(e) => {
              const value = e.currentTarget.value.trim();
              if (value) commit({ id: newId(), kind: "text", color, width, points: [textAt], text: value });
              setTextAt(null);
            }}
          />
        )}
      </div>

      {/* Floating markup toolbar */}
      <div
        className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-wrap items-center gap-1 rounded-xl border border-white/15 bg-slate-950/95 p-1.5 text-xs text-slate-100 shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="px-2 font-semibold text-teal-300">{s.title}</span>
        <span className="mx-0.5 h-6 w-px bg-white/15" />
        {TOOLS.map(({ kind, icon: Icon }) => (
          <button key={kind} type="button" className={button(tool === kind)} onClick={() => setTool(kind)} aria-label={s.tools[kind]} aria-pressed={tool === kind} title={s.tools[kind]}>
            <Icon className="size-4" />
          </button>
        ))}
        <span className="mx-0.5 h-6 w-px bg-white/15" />
        {MARKUP_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`${s.color} ${c}`}
            aria-pressed={color === c}
            className={`size-6 rounded-full ring-offset-2 ring-offset-slate-950 ${color === c ? "ring-2 ring-teal-300" : "ring-1 ring-white/30"}`}
            style={{ background: c }}
          />
        ))}
        <span className="mx-0.5 h-6 w-px bg-white/15" />
        {MARKUP_WIDTHS.map((w) => (
          <button key={w} type="button" className={button(width === w)} onClick={() => setWidth(w)} aria-label={`${s.width} ${w}`} aria-pressed={width === w}>
            <span className="block rounded-full bg-current" style={{ width: 14, height: w }} />
          </button>
        ))}
        <span className="mx-0.5 h-6 w-px bg-white/15" />
        <button type="button" className={button()} onClick={undo} disabled={!shapes.length} aria-label={s.undo} title={`${s.undo} (Ctrl+Z)`}>
          <Undo2 className="size-4" />
        </button>
        <button type="button" className={button()} onClick={redo} disabled={!undone.length} aria-label={s.redo} title={`${s.redo} (Ctrl+Y)`}>
          <Redo2 className="size-4" />
        </button>
        <button type="button" className={button()} onClick={() => { setShapes([]); setUndone([]); }} disabled={!shapes.length} aria-label={s.clear} title={s.clear}>
          <Trash2 className="size-4" />
        </button>
        <span className="mx-0.5 h-6 w-px bg-white/15" />
        {saving === null ? (
          <button type="button" className="flex h-8 items-center gap-1.5 rounded-md bg-teal-400 px-2.5 font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-40" onClick={() => setSaving(`${s.defaultName} ${new Date().toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })}`)} disabled={!shapes.length}>
            <Save className="size-4" /> {s.save}
          </button>
        ) : (
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              onSave(shapes, saving.trim() || s.defaultName);
              setSaving(null);
            }}
          >
            <input autoFocus value={saving} onChange={(e) => setSaving(e.target.value)} aria-label={s.name} className="h-8 w-40 rounded-md border border-white/20 bg-slate-900 px-2 outline-none focus:border-teal-400" onKeyDown={(e) => e.key === "Escape" && setSaving(null)} />
            <button type="submit" className="h-8 rounded-md bg-teal-400 px-2.5 font-semibold text-slate-950">{s.save}</button>
          </form>
        )}
        <button type="button" className={button()} onClick={() => onExport(shapes, size.w, size.h)} aria-label={s.export} title={s.export}>
          <Download className="size-4" />
        </button>
        <button type="button" className={button()} onClick={onClose} aria-label={s.close} title={`${s.close} (Esc)`}>
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
