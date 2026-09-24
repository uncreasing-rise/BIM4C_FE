"use client";

import React, { useRef } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulletListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  description?: string;
  badge?: string;
  onExtract?: () => void;
  extractLabel?: string;
}

export function BulletListEditor({
  label,
  items,
  onChange,
  placeholder = "Nhập nội dung điểm nổi bật...",
  description,
  badge,
  onExtract,
  extractLabel = "Trích xuất từ Khối danh sách nội dung",
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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-[13px] font-medium text-slate-700 dark:text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-primary" />
            <span>{label}</span>
          </label>
          {badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onExtract && (
            <button
              type="button"
              onClick={onExtract}
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>⚡ {extractLabel}</span>
            </button>
          )}
          <span className="text-[11px] text-muted-foreground">
            {items.length} mục (Nhấn <kbd className="rounded border border-border bg-muted/40 px-1 font-mono text-[10px]">Enter</kbd> để thêm dòng mới)
          </span>
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      <div className="space-y-2">
        {(items.length > 0 ? items : [""]).map((item, idx) => (
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
              onChange={(e) => {
                if (items.length === 0) {
                  onChange([e.target.value]);
                } else {
                  handleItemChange(idx, e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (items.length === 0 && e.key === "Enter") {
                  e.preventDefault();
                  onChange([item, ""]);
                } else {
                  handleKeyDown(e, idx);
                }
              }}
              className="flex-1 rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
            />
            {items.length > 1 && (
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
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddItem()}
          className="w-full gap-1.5 rounded-xl border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors py-2"
        >
          <Plus className="size-3.5" />
          Thêm dòng điểm nổi bật
        </Button>
      </div>
    </div>
  );
}
