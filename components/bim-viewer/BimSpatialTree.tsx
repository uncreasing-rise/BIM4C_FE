"use client";

import { useState } from "react";
import type { SpatialNode } from "./spatial-tree";
import type { BimElementData } from "./types";

interface Props {
  node: SpatialNode;
  selectedId: string | null;
  onSelect: (element: BimElementData) => void;
}

export function BimSpatialTree({ node, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(100);
  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="cursor-pointer rounded px-2 py-1.5 text-slate-300">
        {node.name} ({node.count})
      </summary>
      {open && <div className="space-y-1 border-l border-white/10 pl-2">
        {node.children.map((child) => <BimSpatialTree key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} />)}
        {node.elements.slice(0, limit).map((element) => (
          <button type="button" key={element.id} onClick={() => onSelect(element)}
            className={`block w-full rounded-md px-2 py-1.5 text-left hover:bg-white/10 ${selectedId === element.id ? "bg-teal-500/15 text-teal-200" : ""}`}>
            <span className="block truncate">{element.name || element.ifcType}</span>
            <span className="block truncate text-[10px] text-slate-500">{element.ifcType} · {element.guid}</span>
          </button>
        ))}
        {limit < node.elements.length && <button type="button" onClick={() => setLimit((value) => value + 100)} className="min-h-9 w-full rounded border border-white/15 text-teal-200">+ {Math.min(100, node.elements.length - limit)} ({limit}/{node.elements.length})</button>}
      </div>}
    </details>
  );
}
