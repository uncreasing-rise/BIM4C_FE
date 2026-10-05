"use client";

import type { AdminServiceContent } from "@/features/admin/types";
import { BilingualListField } from "../bilingual";
import { Sparkles } from "lucide-react";

interface ServiceFieldsProps {
  content: Partial<AdminServiceContent>;
  onChange: (patch: Partial<AdminServiceContent>) => void;
}

export function ServiceFields({ content, onChange }: ServiceFieldsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">Hạng mục bàn giao & Điểm nổi bật dịch vụ</h3>
      </div>

      <BilingualListField
        id="highlights"
        label="Hạng mục & cam kết bàn giao"
        hint="Dòng N tiếng Việt tương ứng dòng N tiếng Anh"
        vi={content.highlights_vi}
        en={content.highlights}
        onChange={({ vi, en }) => onChange({ highlights_vi: vi, highlights: en })}
        placeholderVi="Mô hình BIM LOD 400 kèm ma trận kiểm soát xung đột"
        placeholderEn="LOD 400 BIM model with full clash detection matrix"
        addLabel="Thêm hạng mục"
      />
    </div>
  );
}
