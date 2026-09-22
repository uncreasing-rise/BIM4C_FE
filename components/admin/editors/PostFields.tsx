"use client";

import type { AdminPostContent } from "@/features/admin/types";
import { User } from "lucide-react";

interface PostFieldsProps {
  content: Partial<AdminPostContent>;
  onChange: (patch: Partial<AdminPostContent>) => void;
}

export function PostFields({ content, onChange }: PostFieldsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <User className="size-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">Thông tin tác giả & Nguồn bài viết</h3>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tác giả / Ban biên tập
        </label>
        <input
          placeholder="Ví dụ: Ban biên tập BIM4C / ThS. KTS Minh Hoàng"
          value={content.authorName ?? ""}
          onChange={(e) => onChange({ authorName: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
