"use client";

import type { AdminPostContent } from "@/features/admin/types";
import { User } from "lucide-react";

interface PostFieldsProps {
  content: Partial<AdminPostContent>;
  onChange: (patch: Partial<AdminPostContent>) => void;
}

export function PostFields({ content, onChange }: PostFieldsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <User className="size-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">Thông tin tác giả & Nguồn bài viết</h3>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">
          Tác giả / Ban biên tập
        </label>
        <input
          placeholder="Ví dụ: Ban biên tập BIM4C / ThS. KTS Minh Hoàng"
          value={content.authorName ?? ""}
          onChange={(e) => onChange({ authorName: e.target.value })}
          className="w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
        />
      </div>
    </div>
  );
}
