"use client";

import type { AdminPostContent } from "@/features/admin/types";
import { User } from "lucide-react";
import { BilingualField } from "../bilingual";

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

      <BilingualField
        id="authorName"
        label="Tác giả / Ban biên tập"
        hint="Để trống = hiển thị “Chuyên gia BIM4C”"
        maxLength={160}
        vi={content.authorName_vi}
        en={content.authorName}
        placeholderVi="Ban biên tập BIM4C / ThS. KTS Minh Hoàng"
        placeholderEn="BIM4C Editorial Team / Minh Hoang, MArch"
        onChange={(lang, value) => onChange(lang === "vi" ? { authorName_vi: value } : { authorName: value })}
      />
    </div>
  );
}
