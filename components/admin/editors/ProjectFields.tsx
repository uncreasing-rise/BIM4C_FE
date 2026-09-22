"use client";

import Image from "next/image";
import type { AdminProjectContent, ProjectGalleryImage } from "@/features/admin/types";
import { adminContentApi } from "@/features/admin/api/client";
import { MediaPicker } from "../MediaPicker";
import { Layers, MoveUp, MoveDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProjectFieldsProps {
  content: Partial<AdminProjectContent>;
  adminLangTab: "en" | "vi";
  onChange: (patch: Partial<AdminProjectContent>) => void;
}

export function ProjectFields({ content, adminLangTab, onChange }: ProjectFieldsProps) {
  const images = content.images ?? [];

  async function addProjectImage(media: { url: string; alt?: string; caption?: string }) {
    const newImage: ProjectGalleryImage = {
      id: `temp-${Date.now()}`,
      url: media.url,
      alt: media.alt || content.title || "Hình ảnh dự án",
      caption: media.caption || null,
      sortOrder: images.length,
    };

    const updated = [...images, newImage];
    onChange({ images: updated });

    if (content.id) {
      try {
        const res = await adminContentApi.addProjectImage(content.id, {
          url: newImage.url,
          alt: newImage.alt,
          caption: newImage.caption ?? undefined,
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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Layers className="size-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">Thông số kỹ thuật công trình (Project Details)</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Địa điểm</label>
          <input
            placeholder="TP. Hồ Chí Minh / Hà Nội"
            value={adminLangTab === "en" ? content.location ?? "" : content.location_vi ?? ""}
            onChange={(e) => onChange(adminLangTab === "en" ? { location: e.target.value } : { location_vi: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Năm thực hiện</label>
          <input
            type="number"
            placeholder="2026"
            value={content.year ?? ""}
            onChange={(e) => onChange({ year: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chủ đầu tư</label>
          <input
            placeholder="Tên tập đoàn / Chủ đầu tư"
            value={adminLangTab === "en" ? content.investor ?? "" : content.investor_vi ?? ""}
            onChange={(e) => onChange(adminLangTab === "en" ? { investor: e.target.value } : { investor_vi: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gói thầu / Dịch vụ</label>
          <input
            placeholder="Mô hình BIM LOD 400"
            value={adminLangTab === "en" ? content.contractPackage ?? "" : content.contractPackage_vi ?? ""}
            onChange={(e) => onChange(adminLangTab === "en" ? { contractPackage: e.target.value } : { contractPackage_vi: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quy mô công trình</label>
        <textarea
          rows={2}
          placeholder="Diện tích sàn, số tầng, tổng vốn đầu tư..."
          value={adminLangTab === "en" ? content.scale ?? "" : content.scale_vi ?? ""}
          onChange={(e) => onChange(adminLangTab === "en" ? { scale: e.target.value } : { scale_vi: e.target.value })}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition focus:border-primary"
        />
      </div>

      {/* Project Gallery Sub-editor */}
      <div className="border-t border-border pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-foreground">Bộ sưu tập hình ảnh ({images.length})</h4>
            <p className="text-xs text-muted-foreground">Hình ảnh phối cảnh và tiến độ thực tế dự án</p>
          </div>
          <MediaPicker
            label="Thêm ảnh từ Media"
            onSelect={(media) => void addProjectImage(media)}
          />
        </div>

        <div className="grid gap-3">
          {images.map((image, index) => (
            <div key={image.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-2xs">
              <Image src={image.url} alt={image.alt} width={80} height={56} className="size-14 rounded-lg object-cover border border-border" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <input
                  placeholder="Mô tả alt ảnh..."
                  value={image.alt}
                  onChange={(e) =>
                    onChange({
                      images: images.map((item) =>
                        item.id === image.id ? { ...item, alt: e.target.value } : item,
                      ),
                    })
                  }
                  onBlur={() => {
                    if (content.id && !image.id.startsWith("temp-")) {
                      void adminContentApi.updateProjectImage(content.id, image.id, { alt: image.alt });
                    }
                  }}
                  className="w-full rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground outline-none"
                />
                <input
                  placeholder="Chú thích ảnh (caption)..."
                  value={image.caption ?? ""}
                  onChange={(e) =>
                    onChange({
                      images: images.map((item) =>
                        item.id === image.id ? { ...item, caption: e.target.value } : item,
                      ),
                    })
                  }
                  onBlur={() => {
                    if (content.id && !image.id.startsWith("temp-")) {
                      void adminContentApi.updateProjectImage(content.id, image.id, { caption: image.caption ?? null });
                    }
                  }}
                  className="w-full rounded border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground outline-none"
                />
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
