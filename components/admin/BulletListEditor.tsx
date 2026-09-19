"use client";

import React, { useRef } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulletListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function BulletListEditor({
  label,
  items,
  onChange,
  placeholder = "Nhập nội dung điểm nổi bật...",
}: BulletListEditorProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleItemChange = (index: number, value: string) => {
    // If user pastes multi-line text into a single input, split it into multiple items
    if (value.includes("\n")) {
      const lines = value.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        const next = [...items];
        next.splice(index, 1, ...lines);
        onChange(next);
        return;
      }
    }

    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleAddItem = (afterIndex?: number) => {
    const next = [...items];
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : next.length;
    next.splice(insertAt, 0, "");
    onChange(next);

    // Focus newly created input
    setTimeout(() => {
      inputRefs.current[insertAt]?.focus();
    }, 50);
  };

  const handleRemoveItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);

    // Focus previous item
    setTimeout(() => {
      const prevIndex = Math.max(0, index - 1);
      inputRefs.current[prevIndex]?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem(index);
    } else if (e.key === "Backspace" && items[index] === "" && items.length > 1) {
      e.preventDefault();
      handleRemoveItem(index);
    }
  };

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-primary" />
          {label}
        </label>
        <span className="text-[11px] text-muted-foreground">
          {items.length} mục (Nhấn <kbd className="rounded border border-border bg-muted/40 px-1 font-mono text-[10px]">Enter</kbd> để thêm dòng mới)
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {idx + 1}
            </span>
            <input
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              value={item}
              placeholder={placeholder}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(idx)}
              className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Xóa mục này"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Chưa có điểm nổi bật nào. Bấm nút bên dưới để thêm.
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddItem()}
          className="w-full gap-1.5 rounded-xl border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors py-2"
        >
          <Plus className="size-3.5" />
          Thêm điểm nổi bật mới
        </Button>
      </div>
    </div>
  );
}
