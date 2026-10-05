"use client";

import Image from "next/image";
import type { AdminProjectContent, ProjectGalleryImage } from "@/features/admin/types";
import { adminContentApi } from "@/features/admin/api/client";
import { MediaPicker } from "../MediaPicker";
import { Layers, MoveUp, MoveDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BilingualColumnsHeader, BilingualField, LANGS, LANG_META, SharedBadge, fieldDomId, filled } from "../bilingual";
import { PROJECT_FIELDS } from "../content-check";

interface ProjectFieldsProps {
  content: Partial<AdminProjectContent>;
  onChange: (patch: Partial<AdminProjectContent>) => void;
}

const PROJECT_HINTS: Record<string, { vi: string; en: string; hint?: string }> = {
  location: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City" },
  investor: { vi: "Tên tập đoàn / chủ đầu tư", en: "Investor / developer name" },
  contractPackage: { vi: "Mô hình BIM LOD 400", en: "BIM modelling LOD 400" },
  expectedCompletion: { vi: "Quý IV/2026", en: "Q4 2026", hint: "Hiển thị trên trang chi tiết dự án" },
  scale: { vi: "Diện tích sàn, số tầng, tổng vốn đầu tư...", en: "Floor area, storeys, total investment..." },
};

export function ProjectFields({ content, onChange }: ProjectFieldsProps) {
  const row = content as Record<string, unknown>;
  const images = content.images ?? [];

  async function addProjectImage(media: { url: string; alt?: string; caption?: string }) {
    const newImage: ProjectGalleryImage = {
      id: `temp-${Date.now()}`,
      url: media.url,
      alt: media.alt || content.title || content.title_vi || "Hình ảnh dự án",
      alt_vi: media.alt || content.title_vi || content.title || "Hình ảnh dự án",
      caption: media.caption || null,
      caption_vi: media.caption || null,
      sortOrder: images.length,
    };

    const updated = [...images, newImage];
    onChange({ images: updated });

    if (content.id) {
      try {
        const res = await adminContentApi.addProjectImage(content.id, {
          url: newImage.url,
          alt: newImage.alt,
          alt_vi: newImage.alt_vi,
          caption: newImage.caption ?? undefined,
          caption_vi: newImage.caption_vi,
          sortOrder: newImage.sortOrder,
        });
        if (res?.data?.id) {
          onChange({
            images: updated.map((img) => (img.id === newImage.id ? { ...img, id: res.data.id } : img)),
          });
        }
      } catch {
        toast.error("Lỗi khi lưu ảnh vào dự án");
      }
    }
  }

  function setImage(id: string, patch: Partial<ProjectGalleryImage>) {
    onChange({ images: images.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  }

  /** Saves one edited text of an already-stored image (new images are saved with the project). */
  function persistImage(id: string, key: "alt" | "alt_vi" | "caption" | "caption_vi") {
    const image = images.find((item) => item.id === id);
    if (!content.id || !image || image.id.startsWith("temp-")) return;
    const value = (image[key] ?? "").trim();
    // The English alt is required by the API; fall back to the Vietnamese one.
    const body = key === "alt" ? { alt: value || image.alt_vi?.trim() || "Hình ảnh dự án" } : { [key]: value || null };
    adminContentApi.updateProjectImage(content.id, id, body).catch(() => toast.error("Không lưu được mô tả ảnh"));
  }

  async function moveProjectImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    const updated = reordered.map((img, i) => ({ ...img, sortOrder: i }));
    onChange({ images: updated });

    if (content.id) {
      try {
        await Promise.all(
          updated.map((img) =>
            img.id.startsWith("temp-")
              ? Promise.resolve()
              : adminContentApi.updateProjectImage(content.id!, img.id, { sortOrder: img.sortOrder }),
          ),
        );
      } catch {
        toast.error("Không thể lưu thứ tự ảnh");
      }
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Layers className="size-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">Thông số kỹ thuật công trình (Project Details)</h3>
      </div>

      <BilingualColumnsHeader />
      {PROJECT_FIELDS.map((spec) => (
        <BilingualField
          key={spec.id}
          id={spec.id}
          label={spec.label}
          required={spec.required}
          maxLength={spec.max}
          multiline={spec.id === "scale"}
          rows={2}
          hint={PROJECT_HINTS[spec.id]?.hint}
          placeholderVi={PROJECT_HINTS[spec.id]?.vi}
          placeholderEn={PROJECT_HINTS[spec.id]?.en}
          vi={row[spec.vi] as string | null | undefined}
          en={row[spec.en] as string | null | undefined}
          onChange={(lang, value) => onChange({ [lang === "vi" ? spec.vi : spec.en]: value })}
        />
      ))}

      <div className="max-w-xs space-y-1.5">
        <label htmlFor="bf-year" className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 dark:text-foreground">
          Năm thực hiện <SharedBadge />
        </label>
        <input
          id="bf-year"
          type="number"
          min={1900}
          max={2200}
          placeholder="2026"
          value={content.year ?? ""}
          onChange={(e) => onChange({ year: e.target.value ? Number(e.target.value) : null })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground"
        />
        {content.year != null && (content.year < 1900 || content.year > 2200) && (
          <p className="text-[11px] font-medium text-red-600">Năm phải trong khoảng 1900–2200</p>
        )}
      </div>

      {/* Project Gallery Sub-editor */}
      <div className="border-t border-border pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-foreground">Bộ sưu tập hình ảnh ({images.length})</h4>
            <p className="text-xs text-muted-foreground">Ảnh dùng chung; mô tả và chú thích nhập riêng cho từng ngôn ngữ.</p>
          </div>
          <MediaPicker
            label="Thêm ảnh từ Media"
            onSelect={(media) => void addProjectImage(media)}
          />
        </div>

        <div className="grid gap-3">
          {images.map((image, index) => (
            <div key={image.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-3 shadow-2xs">
              <Image src={image.url} alt={image.alt} width={80} height={56} className="mt-5 size-14 rounded-lg object-cover border border-border" />
              <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2">
                {LANGS.map((lang) => {
                  const altKey = lang === "vi" ? "alt_vi" : "alt";
                  const captionKey = lang === "vi" ? "caption_vi" : "caption";
                  const other = lang === "vi" ? { alt: image.alt, caption: image.caption } : { alt: image.alt_vi, caption: image.caption_vi };
                  const field = (key: typeof altKey | typeof captionKey, value: string, otherValue: string | null | undefined, placeholder: string) => (
                    <input
                      id={index === 0 ? fieldDomId(`gallery-${key.replace("_vi", "")}`, lang) : undefined}
                      lang={lang}
                      placeholder={placeholder}
                      value={value}
                      onChange={(e) => setImage(image.id, { [key]: e.target.value })}
                      onBlur={() => persistImage(image.id, key)}
                      className={cn(
                        "w-full rounded border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-teal-600",
                        !filled(value) && filled(otherValue) ? "border-amber-400 bg-amber-50/40 dark:bg-amber-500/5" : "border-border",
                      )}
                    />
                  );
                  return (
                    <div key={lang} className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {LANG_META[lang].flag} {LANG_META[lang].name}
                      </span>
                      {field(altKey, (image[altKey] as string | null | undefined) ?? "", other.alt, lang === "vi" ? "Mô tả ảnh (alt)..." : "Image description (alt)...")}
                      {field(captionKey, (image[captionKey] as string | null | undefined) ?? "", other.caption, lang === "vi" ? "Chú thích hiển thị dưới ảnh..." : "Caption shown under the image...")}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => void moveProjectImage(index, -1)}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Di chuyển lên"
                >
                  <MoveUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => void moveProjectImage(index, 1)}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Di chuyển xuống"
                >
                  <MoveDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (content.id && !image.id.startsWith("temp-")) {
                      await adminContentApi.deleteProjectImage(content.id, image.id).catch(() => {});
                    }
                    onChange({ images: images.filter((x) => x.id !== image.id) });
                  }}
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                  title="Xóa ảnh"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
