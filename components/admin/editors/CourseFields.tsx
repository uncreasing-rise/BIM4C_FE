"use client";

import { useState } from "react";
import type { AdminCourseContent, CourseCurriculumSection } from "@/features/admin/types";
import { adminContentApi } from "@/features/admin/api/client";
import { BulletListEditor } from "../BulletListEditor";
import { GraduationCap, MoveUp, MoveDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CourseFieldsProps {
  content: Partial<AdminCourseContent>;
  adminLangTab: "en" | "vi";
  onChange: (patch: Partial<AdminCourseContent>) => void;
}

export function CourseFields({ content, adminLangTab, onChange }: CourseFieldsProps) {
  const curriculum = content.curriculum ?? [];
  const [newCurriculum, setNewCurriculum] = useState({ title: "", description: "" });

  async function addCurriculum() {
    if (!newCurriculum.title.trim()) {
      toast.error("Vui lòng nhập tên phần học");
      return;
    }
    const newSection: CourseCurriculumSection = {
      id: `temp-${Date.now()}`,
      title: newCurriculum.title.trim(),
      description: newCurriculum.description.trim(),
      sortOrder: curriculum.length,
    };
    const updated = [...curriculum, newSection];
    onChange({ curriculum: updated });
    setNewCurriculum({ title: "", description: "" });

    if (content.id) {
      try {
        const res = await adminContentApi.addCourseSection(content.id, {
          title: newSection.title,
          description: newSection.description,
          sortOrder: newSection.sortOrder,
        });
        if (res?.data?.id) {
          onChange({
            curriculum: updated.map((sec) => (sec.id === newSection.id ? { ...sec, id: res.data.id } : sec)),
          });
        }
      } catch {
        toast.error("Lỗi khi thêm phần học");
      }
    }
  }

  async function moveCurriculum(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= curriculum.length) return;
    const reordered = [...curriculum];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    const updated = reordered.map((item, i) => ({ ...item, sortOrder: i }));
    onChange({ curriculum: updated });

    if (content.id) {
      try {
        await Promise.all(
          updated.map((item) =>
            item.id.startsWith("temp-")
              ? Promise.resolve()
              : adminContentApi.updateCourseSection(content.id!, item.id, { sortOrder: item.sortOrder }),
          ),
        );
      } catch {
        toast.error("Không thể lưu thứ tự phần học");
      }
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <GraduationCap className="size-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">Thông số khóa học & Giáo trình</h3>
      </div>

      {/* Course Level / Category Preset Selector */}
      <div className="space-y-2 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            {adminLangTab === "en" ? "Course Level / Category" : "Phân loại & Cấp độ khóa học"}
          </label>
          <span className="text-[11px] text-muted-foreground">
            {adminLangTab === "en" ? "Select preset or enter custom level below" : "Chọn nhóm phân loại có sẵn hoặc nhập tùy chỉnh"}
          </span>
        </div>
        
        {/* Preset Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["Nền tảng", "Chuyên sâu", "Quản lý", "Chuyên ngành", "Thực chiến", "Quản trị thông tin"].map((cat) => {
            const currentVal = adminLangTab === "en" ? content.level : content.level_vi;
            const isSelected = currentVal === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange(adminLangTab === "en" ? { level: cat } : { level_vi: cat })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-background border border-border text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {adminLangTab === "en" ? "Duration" : "Thời lượng khóa học"}
          </label>
          <input
            placeholder={adminLangTab === "en" ? "12 sessions (36 hours)" : "12 buổi (36 giờ)"}
            value={adminLangTab === "en" ? content.duration ?? "" : content.duration_vi ?? ""}
            onChange={(e) => onChange(adminLangTab === "en" ? { duration: e.target.value } : { duration_vi: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {adminLangTab === "en" ? "Level" : "Cấp độ / Phân loại"}
          </label>
          <input
            placeholder={adminLangTab === "en" ? "Beginner / Advanced" : "Cơ bản / Nâng cao / Chuyên sâu"}
            value={adminLangTab === "en" ? content.level ?? "" : content.level_vi ?? ""}
            onChange={(e) => onChange(adminLangTab === "en" ? { level: e.target.value } : { level_vi: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {adminLangTab === "en" ? "Tuition Fee" : "Học phí"}
          </label>
          <input
            placeholder={adminLangTab === "en" ? "Contact / 4,500,000 VND" : "Liên hệ / 4.500.000 đ"}
            value={adminLangTab === "en" ? content.price ?? "" : content.price_vi ?? ""}
            onChange={(e) => onChange(adminLangTab === "en" ? { price: e.target.value } : { price_vi: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {adminLangTab === "en" ? "Lead Instructor" : "Giảng viên phụ trách"}
          </label>
          <input
            placeholder={adminLangTab === "en" ? "Senior BIM Specialist" : "Chuyên gia BIM Quốc tế"}
            value={adminLangTab === "en" ? content.instructor ?? "" : content.instructor_vi ?? ""}
            onChange={(e) => onChange(adminLangTab === "en" ? { instructor: e.target.value } : { instructor_vi: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
      </div>

      <BulletListEditor
        label={adminLangTab === "en" ? "Mục tiêu & Chuẩn đầu ra khóa học (English)" : "Mục tiêu & Chuẩn đầu ra khóa học (Tiếng Việt)"}
        placeholder={adminLangTab === "en" ? "Ví dụ: Master Revit & IFC openBIM workflows..." : "Ví dụ: Làm chủ mô hình Revit & IFC..."}
        items={((adminLangTab === "en" ? content.learningOutcomes : content.learningOutcomes_vi) ?? [])}
        onChange={(items) =>
          onChange(
            adminLangTab === "en"
              ? { learningOutcomes: items }
              : { learningOutcomes_vi: items },
          )
        }
      />

      {/* Course Curriculum Modules */}
      <div className="border-t border-border pt-5 space-y-4">
        <h4 className="text-sm font-bold text-foreground">Chương trình đào tạo chi tiết ({curriculum.length} phần)</h4>
        
        <div className="rounded-xl border border-dashed border-border p-4 bg-muted/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Tên Module (Ví dụ: Module 1: Thiết lập môi trường CDE)"
              value={newCurriculum.title}
              onChange={(e) => setNewCurriculum((v) => ({ ...v, title: e.target.value }))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none"
            />
            <input
              placeholder="Mô tả nội dung bài học..."
              value={newCurriculum.description}
              onChange={(e) => setNewCurriculum((v) => ({ ...v, description: e.target.value }))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => void addCurriculum()}
            className="w-full gap-2 text-xs font-semibold bg-primary text-white"
          >
            <Plus className="size-3.5" />
            <span>Thêm phần học vào giáo trình</span>
          </Button>
        </div>

        <div className="grid gap-3">
          {curriculum.map((section, index) => (
            <div key={section.id} className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-primary font-mono">PHẦN {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => void moveCurriculum(index, -1)}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <MoveUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === curriculum.length - 1}
                    onClick={() => void moveCurriculum(index, 1)}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <MoveDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (content.id && !section.id.startsWith("temp-")) {
                        await adminContentApi.deleteCourseSection(content.id, section.id).catch(() => {});
                      }
                      onChange({ curriculum: curriculum.filter((x) => x.id !== section.id) });
                    }}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <input
                value={section.title}
                onChange={(e) =>
                  onChange({
                    curriculum: curriculum.map((item) =>
                      item.id === section.id ? { ...item, title: e.target.value } : item,
                    ),
                  })
                }
                onBlur={() => {
                  if (content.id && !section.id.startsWith("temp-")) {
                    void adminContentApi.updateCourseSection(content.id, section.id, { title: section.title });
                  }
                }}
                className="w-full rounded border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground outline-none"
              />
              <textarea
                rows={2}
                value={section.description}
                onChange={(e) =>
                  onChange({
                    curriculum: curriculum.map((item) =>
                      item.id === section.id ? { ...item, description: e.target.value } : item,
                    ),
                  })
                }
                onBlur={() => {
                  if (content.id && !section.id.startsWith("temp-")) {
                    void adminContentApi.updateCourseSection(content.id, section.id, { description: section.description });
                  }
                }}
                className="w-full rounded border border-border bg-background p-2 text-xs text-muted-foreground outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
