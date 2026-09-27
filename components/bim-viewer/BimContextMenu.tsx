"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  Crosshair,
  Eye,
  EyeOff,
  Focus,
  Info,
  Layers,
  Maximize,
  Scan,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import type { BimElementData } from "./types";

export type ContextAction =
  | "isolate"
  | "hide"
  | "focus"
  | "selectSameType"
  | "selectSameStorey"
  | "showAll"
  | "fitAll"
  | "clearSelection"
  | "properties";

interface Props {
  x: number;
  y: number;
  element: BimElementData | null;
  selectionCount: number;
  canShowAll: boolean;
  onAction: (action: ContextAction) => void;
  onClose: () => void;
}

export function BimContextMenu({ x, y, element, selectionCount, canShowAll, onAction, onClose }: Props) {
  const { locale } = useLanguage();
  const s = ui(locale).bimContextMenu;
  const ref = useRef<HTMLDivElement>(null);

  const items: { action: ContextAction; label: string; icon: typeof Eye; key?: string; divider?: boolean }[] =
    selectionCount > 0
      ? [
          { action: "isolate", label: s.isolate, icon: Scan, key: "I" },
          { action: "hide", label: s.hide, icon: EyeOff, key: "H" },
          { action: "focus", label: s.focus, icon: Focus, key: "F" },
          ...(element
            ? [
                { action: "selectSameType" as const, label: s.selectSameType, icon: Layers, divider: true },
                ...(element.storey
                  ? [{ action: "selectSameStorey" as const, label: s.selectSameStorey, icon: Layers }]
                  : []),
              ]
            : []),
          { action: "properties", label: s.properties, icon: Info, divider: true },
          ...(canShowAll ? [{ action: "showAll" as const, label: s.showAll, icon: Eye, key: "U" }] : []),
          { action: "clearSelection", label: s.clearSelection, icon: X, key: "Esc" },
        ]
      : [
          ...(canShowAll ? [{ action: "showAll" as const, label: s.showAll, icon: Eye, key: "U" }] : []),
          { action: "fitAll", label: s.fitAll, icon: Maximize, key: "F" },
        ];

  // Keep the menu inside the viewport of the canvas.
  useLayoutEffect(() => {
    const menu = ref.current;
    const parent = menu?.offsetParent as HTMLElement | null;
    if (!menu || !parent) return;
    const left = Math.max(4, Math.min(x, parent.clientWidth - menu.offsetWidth - 4));
    const top = Math.max(4, Math.min(y, parent.clientHeight - menu.offsetHeight - 4));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
  }, [x, y]);

  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const close = () => onClose();
    window.addEventListener("pointerdown", outside, true);
    window.addEventListener("resize", close);
    window.addEventListener("wheel", close, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("wheel", close);
    };
  }, [onClose]);

  const focusItem = (pick: (index: number, count: number) => number) => {
    const buttons = [...(ref.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ?? [])];
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[pick(index, buttons.length)]?.focus();
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={s.label}
      className="absolute z-40 min-w-56 overflow-hidden rounded-lg border border-white/15 bg-slate-950/95 py-1 text-xs text-slate-100 shadow-2xl backdrop-blur"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") focusItem((i, n) => (i + 1) % n);
        else if (e.key === "ArrowUp") focusItem((i, n) => (i - 1 + n) % n);
        else if (e.key === "Home") focusItem(() => 0);
        else if (e.key === "End") focusItem((_, n) => n - 1);
        else if (e.key === "Escape" || e.key === "Tab") onClose();
        else return;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {element && (
        <div className="flex items-center gap-2 border-b border-white/10 px-3 pb-2 pt-1.5">
          <Crosshair className="size-3.5 shrink-0 text-teal-300" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{element.name}</p>
            <p className="truncate font-mono text-[10px] text-slate-400">
              {element.ifcType}
              {selectionCount > 1 ? ` · +${selectionCount - 1}` : ""}
            </p>
          </div>
        </div>
      )}
      {items.map(({ action, label, icon: Icon, key, divider }) => (
        <div key={action}>
          {divider && <div className="my-1 border-t border-white/10" role="separator" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onAction(action);
              onClose();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left outline-none hover:bg-teal-500/20 focus-visible:bg-teal-500/20"
          >
            <Icon className="size-3.5 shrink-0 text-slate-400" />
            <span className="flex-1">{label}</span>
            {key && <kbd className="rounded border border-white/15 px-1 font-mono text-[10px] text-slate-400">{key}</kbd>}
          </button>
        </div>
      ))}
    </div>
  );
}
