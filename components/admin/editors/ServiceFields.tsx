"use client";

import type { AdminServiceContent } from "@/features/admin/types";
import { BulletListEditor } from "../BulletListEditor";
import { Sparkles } from "lucide-react";

interface ServiceFieldsProps {
  content: Partial<AdminServiceContent>;
  adminLangTab: "en" | "vi";
  onChange: (patch: Partial<AdminServiceContent>) => void;
}

export function ServiceFields({ content, adminLangTab, onChange }: ServiceFieldsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">
          {adminLangTab === "en" ? "Service Deliverables & Key Highlights" : "Hạng mục bàn giao & Điểm nổi bật dịch vụ"}
        </h3>
      </div>

      <p className="text-xs text-muted-foreground">
        {adminLangTab === "en"
          ? "List the primary deliverables, value propositions, and core standards of this service package."
          : "Danh sách các sản phẩm bàn giao chính, cam kết tiêu chuẩn và giá trị cốt lõi của gói dịch vụ này."}
      </p>

      <BulletListEditor
        label={adminLangTab === "en" ? "Key Deliverables (English)" : "Hạng mục & Cam kết bàn giao (Tiếng Việt)"}
        placeholder={
          adminLangTab === "en"
            ? "e.g. BIM Model LOD 400 with full clash detection matrix..."
            : "Ví dụ: Mô hình BIM LOD 400 kèm ma trận kiểm soát xung đột chi tiết..."
        }
        items={(adminLangTab === "en" ? content.highlights : content.highlights_vi) ?? []}
        onChange={(items) =>
          onChange(
            adminLangTab === "en"
              ? { highlights: items }
              : { highlights_vi: items },
          )
        }
      />
    </div>
  );
}
