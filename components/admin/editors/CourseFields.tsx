"use client";

import type { AdminCourseContent, CourseCurriculumSection } from "@/features/admin/types";
import { adminContentApi } from "@/features/admin/api/client";
import { cn } from "@/lib/utils";
import { BilingualColumnsHeader, BilingualField, BilingualListField, LANGS, LANG_META, filled, looksVietnamese } from "../bilingual";
import { COURSE_FIELDS } from "../content-check";
import { GraduationCap, MoveUp, MoveDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CourseFieldsProps {
  content: Partial<AdminCourseContent>;
  onChange: (patch: Partial<AdminCourseContent>) => void;
}

const LEVEL_PRESETS: [string, string][] = [
  ["Nền tảng", "Foundation"],
  ["Chuyên sâu", "Advanced"],
  ["Quản lý", "Management"],
  ["Chuyên ngành", "Specialised"],
  ["Thực chiến", "Hands-on"],
  ["Quản trị thông tin", "Information Management"],
];

const COURSE_HINTS: Record<string, [string, string]> = {
  duration: ["12 buổi (36 giờ)", "12 sessions (36 hours)"],
  level: ["Cơ bản / Nâng cao", "Beginner / Advanced"],
  price: ["Liên hệ / 4.500.000 đ", "Contact us / 4,500,000 VND"],
  instructor: ["Chuyên gia BIM quốc tế", "Senior BIM Specialist"],
};

export function CourseFields({ content, onChange }: CourseFieldsProps) {
  const row = content as Record<string, unknown>;
  const curriculum = content.curriculum ?? [];

  /** New modules stay local (temp id) and are created when the course is saved. */
  function addCurriculum() {
    const section: CourseCurriculumSection = {
      id: `temp-${Date.now()}`,
      title: "",
      title_vi: "",
      description: "",
      description_vi: "",
      sortOrder: curriculum.length,
    };
    onChange({ curriculum: [...curriculum, section] });
    window.setTimeout(() => document.getElementById(`curriculum-${section.id}-vi`)?.focus(), 50);
  }

  function setSection(id: string, patch: Partial<CourseCurriculumSection>) {
    onChange({ curriculum: curriculum.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  }

  /** Saves one edited text of an already-stored module; the API requires the English title/description, so they fall back to Vietnamese. */
  function persistSection(id: string, key: "title" | "title_vi" | "description" | "description_vi") {
    const section = curriculum.find((item) => item.id === id);
    if (!content.id || !section || section.id.startsWith("temp-")) return;
    const value = (section[key] ?? "").trim();
    let body: Record<string, string | null>;
    if (key === "title") body = { title: value || section.title_vi?.trim() || "" };
    else if (key === "description")
      body = { description: value || section.description_vi?.trim() || section.title || section.title_vi || "" };
    else body = { [key]: value || null };
    if (Object.values(body)[0] === "") return;
    adminContentApi.updateCourseSection(content.id, id, body).catch(() => toast.error("Không lưu được phần học"));
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
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <GraduationCap className="size-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">Thông số khóa học & Giáo trình</h3>
      </div>

      {/* Level presets fill both languages at once */}
      <div className="space-y-2 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            Chọn nhanh cấp độ
          </span>
          <span className="text-[11px] text-muted-foreground">Điền cùng lúc cả Tiếng Việt và English, sửa lại bên dưới nếu cần</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {LEVEL_PRESETS.map(([vi, en]) => {
            const isSelected = content.level_vi === vi && content.level === en;
            return (
              <button
                key={vi}
                type="button"
                onClick={() => onChange({ level_vi: vi, level: en })}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {vi} <span className="opacity-60">/ {en}</span>
              </button>
            );
          })}
        </div>
      </div>

      <BilingualColumnsHeader />
      {COURSE_FIELDS.map((spec) => (
        <BilingualField
          key={spec.id}
          id={spec.id}
          label={spec.label}
          maxLength={spec.max}
          placeholderVi={COURSE_HINTS[spec.id]?.[0]}
          placeholderEn={COURSE_HINTS[spec.id]?.[1]}
          vi={row[spec.vi] as string | null | undefined}
          en={row[spec.en] as string | null | undefined}
          onChange={(lang, value) => onChange({ [lang === "vi" ? spec.vi : spec.en]: value })}
        />
      ))}

      <BilingualListField
        id="learningOutcomes"
        label="Mục tiêu & chuẩn đầu ra khóa học"
        vi={content.learningOutcomes_vi}
        en={content.learningOutcomes}
        onChange={({ vi, en }) => onChange({ learningOutcomes_vi: vi, learningOutcomes: en })}
        placeholderVi="Làm chủ mô hình Revit & IFC"
        placeholderEn="Master Revit & IFC openBIM workflows"
        addLabel="Thêm mục tiêu"
      />

      <BilingualListField
        id="softwareStack"
        label="Phần mềm & công nghệ sử dụng"
        vi={content.softwareStack_vi}
        en={content.softwareStack}
        onChange={({ vi, en }) => onChange({ softwareStack_vi: vi, softwareStack: en })}
        placeholderVi="Autodesk Revit (Mô hình BIM)"
        placeholderEn="Autodesk Revit (BIM modelling)"
        addLabel="Thêm phần mềm"
      />

      {/* Course Curriculum Modules */}
      <div className="border-t border-border pt-5 space-y-4" id="bf-curriculum">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-foreground">Chương trình đào tạo chi tiết ({curriculum.length} phần)</h4>
            <p className="text-xs text-muted-foreground">
              Mỗi phần học nhập tên và nội dung cho cả 2 ngôn ngữ. Phần mới được lưu khi bấm Lưu khóa học.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addCurriculum} className="gap-1.5 text-xs">
            <Plus className="size-3.5" /> Thêm phần học
          </Button>
        </div>

        {curriculum.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Chưa có phần học nào. Trang khóa học sẽ ẩn mục giáo trình.
          </p>
        )}

        <div className="grid gap-3">
          {curriculum.map((section, index) => (
            <div key={section.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-primary font-mono">
                  PHẦN {index + 1}
                  {section.id.startsWith("temp-") && (
                    <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                      Chưa lưu
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => void moveCurriculum(index, -1)}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Di chuyển lên"
                  >
                    <MoveUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === curriculum.length - 1}
                    onClick={() => void moveCurriculum(index, 1)}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Di chuyển xuống"
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
                    title="Xóa phần học (cả 2 ngôn ngữ)"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {LANGS.map((lang) => {
                  const titleKey = lang === "vi" ? "title_vi" : "title";
                  const descKey = lang === "vi" ? "description_vi" : "description";
                  const otherTitle = lang === "vi" ? section.title : section.title_vi;
                  const otherDesc = lang === "vi" ? section.description : section.description_vi;
                  const title = section[titleKey] ?? "";
                  const desc = section[descKey] ?? "";
                  const warn = (value: string, other: string | null | undefined) =>
                    (!filled(value) && filled(other)) || (lang === "en" && looksVietnamese(value));
                  return (
                    <div key={lang} className="space-y-1.5" id={`curriculum-${index}-${lang}`}>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {LANG_META[lang].flag} {LANG_META[lang].name}
                      </span>
                      <input
                        id={`curriculum-${section.id}-${lang}`}
                        lang={lang}
                        value={title}
                        maxLength={240}
                        placeholder={lang === "vi" ? "Module 1: Thiết lập môi trường CDE" : "Module 1: Setting up the CDE"}
                        onChange={(e) => setSection(section.id, { [titleKey]: e.target.value })}
                        onBlur={() => persistSection(section.id, titleKey)}
                        className={cn(
                          "w-full rounded border bg-background px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-teal-600",
                          warn(title, otherTitle) ? "border-amber-400 bg-amber-50/40 dark:bg-amber-500/5" : "border-border",
                        )}
                      />
                      <textarea
                        rows={3}
                        lang={lang}
                        value={desc}
                        placeholder={lang === "vi" ? "Nội dung bài học..." : "What the module covers..."}
                        onChange={(e) => setSection(section.id, { [descKey]: e.target.value })}
                        onBlur={() => persistSection(section.id, descKey)}
                        className={cn(
                          "w-full rounded border bg-background p-2 text-xs text-muted-foreground outline-none focus:border-teal-600",
                          warn(desc, otherDesc) ? "border-amber-400 bg-amber-50/40 dark:bg-amber-500/5" : "border-border",
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
