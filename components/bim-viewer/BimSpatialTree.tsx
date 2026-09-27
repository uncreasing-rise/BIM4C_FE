"use client";

import { useState } from "react";
import { ChevronRight, Eye, EyeOff, MousePointerClick, Scan } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ui } from "@/lib/i18n/ui";
import type { SpatialNode } from "./spatial-tree";
import type { BimElementData } from "./types";

interface Props {
  node: SpatialNode;
  depth: number;
  selectedId: string | null;
  onSelect: (element: BimElementData) => void;
  hidden: ReadonlySet<string>;
  onSelectMany: (ids: string[]) => void;
  onSetHidden: (ids: string[], hidden: boolean) => void;
  onIsolate: (ids: string[]) => void;
}

const PAGE = 100;
const iconButton =
  "grid size-6 shrink-0 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-teal-400";

/** Model browser row: stops the click from also toggling the <details>. */
function RowAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={iconButton}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export function BimSpatialTree(props: Props) {
  const { node, depth, selectedId, onSelect, hidden, onSelectMany, onSetHidden, onIsolate } = props;
  const { locale } = useLanguage();
  const s = ui(locale).bimTree;
  // Pure containers (file, project, site, building) start open, so the
  // storeys are listed straight away; storeys holding elements start closed.
  const [open, setOpen] = useState(depth === 0 || node.elements.length === 0);
  const [limit, setLimit] = useState(PAGE);
  const hiddenCount = node.ids.reduce((n, id) => n + (hidden.has(id) ? 1 : 0), 0);
  const allHidden = hiddenCount === node.ids.length && hiddenCount > 0;
  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary
        className={`group flex cursor-pointer list-none items-center gap-1 rounded px-1 py-1 hover:bg-white/5 [&::-webkit-details-marker]:hidden ${allHidden ? "opacity-50" : ""}`}
      >
        <ChevronRight className={`size-3.5 shrink-0 text-slate-500 transition-transform ${open ? "rotate-90" : ""}`} />
        <span className="min-w-0 flex-1 truncate text-slate-200" title={node.name}>
          {node.name}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-slate-500">{node.count}</span>
        <span className="flex shrink-0 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <RowAction label={`${s.selectBranch} ${node.name}`} onClick={() => onSelectMany(node.ids)}>
            <MousePointerClick className="size-3.5" />
          </RowAction>
          <RowAction label={`${s.isolateBranch} ${node.name}`} onClick={() => onIsolate(node.ids)}>
            <Scan className="size-3.5" />
          </RowAction>
          <RowAction
            label={`${allHidden ? s.showBranch : s.hideBranch} ${node.name}`}
            onClick={() => onSetHidden(node.ids, !allHidden)}
          >
            {allHidden ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className={`size-3.5 ${hiddenCount ? "text-amber-300" : ""}`} />
            )}
          </RowAction>
        </span>
      </summary>
      {open && (
        <div className="ml-2 space-y-0.5 border-l border-white/10 pl-1.5">
          {node.children.map((child) => (
            <BimSpatialTree key={child.id} {...props} node={child} depth={depth + 1} />
          ))}
          {node.elements.slice(0, limit).map((element) => {
            const isHidden = hidden.has(element.id);
            return (
              <div
                key={element.id}
                className={`group flex items-center gap-1 rounded pr-1 hover:bg-white/5 ${selectedId === element.id ? "bg-teal-500/15" : ""} ${isHidden ? "opacity-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(element)}
                  className="min-w-0 flex-1 px-2 py-1 text-left"
                >
                  <span className={`block truncate ${selectedId === element.id ? "text-teal-200" : ""}`}>
                    {element.name || element.ifcType}
                  </span>
                  <span className="block truncate text-[10px] text-slate-500">{element.ifcType}</span>
                </button>
                <span className={`transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${isHidden ? "" : "opacity-0"}`}>
                  <RowAction
                    label={`${isHidden ? s.showBranch : s.hideBranch} ${element.name || element.ifcType}`}
                    onClick={() => onSetHidden([element.id], !isHidden)}
                  >
                    {isHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </RowAction>
                </span>
              </div>
            );
          })}
          {limit < node.elements.length && (
            <button
              type="button"
              onClick={() => setLimit((value) => value + PAGE)}
              className="min-h-8 w-full rounded border border-white/15 text-teal-200 hover:bg-white/5"
            >
              {s.showMore} ({limit}/{node.elements.length})
            </button>
          )}
        </div>
      )}
    </details>
  );
}
