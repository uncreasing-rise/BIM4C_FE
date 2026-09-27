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
  TEXT_FONT,
  textAt,
  textSize,
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
  const [past, setPast] = useState<MarkupShape[][]>([]);
  const [future, setFuture] = useState<MarkupShape[][]>([]);
  const [tool, setTool] = useState<MarkupKind>("pen");
  const [color, setColor] = useState<string>(MARKUP_COLORS[0]);
  const [width, setWidth] = useState<number>(MARKUP_WIDTHS[1]);
  const [draft, setDraft] = useState<MarkupShape | null>(null);
  /** Text box open for a new or existing text markup. */
  const [editing, setEditing] = useState<{ id: string; at: [number, number]; value: string; color: string; width: number } | null>(null);
  /** Pointer down with the text tool: a click places/edits, a drag moves a text. */
  const [grab, setGrab] = useState<{
    p: [number, number];
    now?: [number, number];
    hit: MarkupShape | null;
    moved: boolean;
    origin: [number, number];
  } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize({ w: el.clientWidth || 1, h: el.clientHeight || 1 }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Undo/redo keep whole snapshots, so editing or moving a text undoes too.
  const change = (next: MarkupShape[]) => {
    setPast((p) => [...p, shapes]);
    setFuture([]);
    setShapes(next);
  };
  const commit = (shape: MarkupShape) => change([...shapes, shape]);
  const undo = () => {
    if (!past.length) return;
    setFuture((f) => [shapes, ...f]);
    setShapes(past.at(-1)!);
    setPast((p) => p.slice(0, -1));
  };
  const redo = () => {
    if (!future.length) return;
    setPast((p) => [...p, shapes]);
    setShapes(future[0]);
    setFuture((f) => f.slice(1));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea")) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) undo();
      else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) redo();
      else if (e.key === "Escape" && !editing && !saving) onClose();
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  // Focus the text box once it is on screen (autoFocus alone loses the
  // focus to the click that opened it).
  const textRef = useRef<HTMLTextAreaElement>(null);
  const editingKey = editing ? `${editing.id}` : "";
  useEffect(() => {
    if (!editingKey) return;
    const frame = requestAnimationFrame(() => {
      const box = textRef.current;
      if (!box) return;
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    });
    return () => cancelAnimationFrame(frame);
  }, [editingKey]);

  /** Ends text editing: saves non-empty text, removes a text emptied out. */
  // Enter closes the box and the browser may then also report a blur on
  // removal: finish each edit exactly once.
  const finishedRef = useRef<string | null>(null);
  const finishText = (keep: boolean) => {
    if (!editing || finishedRef.current === editing.id) return;
    finishedRef.current = editing.id;
    const value = editing.value.replace(/\s+$/, "");
    const existing = shapes.find((shape) => shape.id === editing.id);
    if (keep && value) {
      const shape: MarkupShape = { id: editing.id, kind: "text", color: editing.color, width: editing.width, points: [editing.at], text: value };
      if (!existing) commit(shape);
      else if (existing.text !== value || existing.color !== shape.color || existing.width !== shape.width)
        change(shapes.map((s) => (s.id === editing.id ? shape : s)));
    } else if (keep && existing) change(shapes.filter((s) => s.id !== editing.id));
    setEditing(null);
  };

  const openText = (next: NonNullable<typeof editing>) => {
    finishedRef.current = null;
    setEditing(next);
  };

  const at = (e: React.PointerEvent): [number, number] => {
    const r = ref.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  const down = (e: React.PointerEvent) => {
    if (e.button !== 0 || saving !== null) return;
    const p = at(e);
    if (tool === "text") {
      // Keep the browser from moving focus away from the text box.
      e.preventDefault();
      if (editing) return finishText(true);
      const hit = textAt(shapes, [p[0] * size.w, p[1] * size.h], size.w, size.h);
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setGrab({ p, hit, moved: false, origin: hit?.points[0] ?? p });
      return;
    }
    if (editing) finishText(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraft({ id: newId(), kind: tool, color, width, points: tool === "pen" ? [p] : [p, p] });
  };
  const move = (e: React.PointerEvent) => {
    if (grab) {
      const p = at(e);
      const moved = grab.moved || Math.hypot((p[0] - grab.p[0]) * size.w, (p[1] - grab.p[1]) * size.h) > 3;
      if (moved !== grab.moved || moved) setGrab({ ...grab, moved, now: p });
      return;
    }
    if (!draft) return;
    const p = at(e);
    setDraft({ ...draft, points: draft.kind === "pen" ? [...draft.points, p] : [draft.points[0], p] });
  };
  /** Where a dragged text currently is. */
  const dragged = (shape: MarkupShape): MarkupShape => {
    if (!grab?.hit || !grab.moved || !grab.now || grab.hit.id !== shape.id) return shape;
    const [ox, oy] = grab.origin;
    return { ...shape, points: [[ox + grab.now[0] - grab.p[0], oy + grab.now[1] - grab.p[1]]] };
  };
  const up = () => {
    if (grab) {
      const { hit, moved } = grab;
      if (hit && moved) change(shapes.map((s) => (s.id === hit.id ? dragged(s) : s)));
      else if (hit) openText({ id: hit.id, at: hit.points[0], value: hit.text ?? "", color: hit.color, width: hit.width });
      else openText({ id: newId(), at: grab.p, value: "", color, width });
      setGrab(null);
      return;
    }
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
        onPointerCancel={() => {
          setDraft(null);
          setGrab(null);
        }}
      >
        <svg className="absolute inset-0 size-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
          {[...shapes, ...(draft ? [draft] : [])]
            // The text being edited is shown by its text box instead.
            .filter((shape) => shape.id !== editing?.id)
            .map((shape) => (
              <g key={shape.id} dangerouslySetInnerHTML={{ __html: shapeSvg(dragged(shape), size.w, size.h) }} />
            ))}
        </svg>
        {editing && (
          <textarea
            ref={textRef}
            rows={1}
            value={editing.value}
            aria-label={s.textPlaceholder}
            placeholder={s.textPlaceholder}
            spellCheck={false}
            // Same font, size and line height as the drawn text, so it stays put when saved.
            className="absolute min-w-40 resize-none overflow-hidden rounded-sm bg-white/80 p-0 font-bold outline-dashed outline-2 outline-offset-4 outline-teal-500 [field-sizing:content]"
            style={{
              left: editing.at[0] * size.w,
              top: editing.at[1] * size.h,
              color: editing.color,
              fontFamily: TEXT_FONT,
              fontSize: textSize(editing.width),
              lineHeight: `${Math.round(textSize(editing.width) * 1.25)}px`,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                finishText(true);
              } else if (e.key === "Escape") {
                e.preventDefault();
                finishText(false);
              }
            }}
            onBlur={() => finishText(true)}
          />
        )}
      </div>

      {/* Floating markup toolbar */}
      <div
        className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-wrap items-center gap-1 rounded-xl border border-white/15 bg-slate-950/95 p-1.5 text-xs text-slate-100 shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
        // While a text is being typed, picking a colour or size restyles it
        // instead of closing the text box.
        onMouseDown={(e) => {
          if (editing && !(e.target as HTMLElement).closest("input")) e.preventDefault();
        }}
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
            onClick={() => {
              setColor(c);
              if (editing) setEditing({ ...editing, color: c });
            }}
            aria-label={`${s.color} ${c}`}
            aria-pressed={color === c}
            className={`size-6 rounded-full ring-offset-2 ring-offset-slate-950 ${color === c ? "ring-2 ring-teal-300" : "ring-1 ring-white/30"}`}
            style={{ background: c }}
          />
        ))}
        <span className="mx-0.5 h-6 w-px bg-white/15" />
        {MARKUP_WIDTHS.map((w) => (
          <button key={w} type="button" className={button(width === w)} onClick={() => {
            setWidth(w);
            if (editing) setEditing({ ...editing, width: w });
          }} aria-label={`${s.width} ${w}`} aria-pressed={width === w}>
            <span className="block rounded-full bg-current" style={{ width: 14, height: w }} />
          </button>
        ))}
        <span className="mx-0.5 h-6 w-px bg-white/15" />
        <button type="button" className={button()} onClick={undo} disabled={!past.length} aria-label={s.undo} title={`${s.undo} (Ctrl+Z)`}>
          <Undo2 className="size-4" />
        </button>
        <button type="button" className={button()} onClick={redo} disabled={!future.length} aria-label={s.redo} title={`${s.redo} (Ctrl+Y)`}>
          <Redo2 className="size-4" />
        </button>
        <button type="button" className={button()} onClick={() => change([])} disabled={!shapes.length} aria-label={s.clear} title={s.clear}>
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
