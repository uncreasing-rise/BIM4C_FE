"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminContentApi } from "@/features/admin/api/client";
import type {
  AdminCategory,
  AdminContent,
  AdminContentStatus,
  AdminContentType,
} from "@/features/admin/types";
import { slugify } from "@/lib/utils/slug";
import { scrollToPageTop } from "@/lib/utils/scroll";
import { CategoryManager } from "./CategoryManager";
import { ContentBlockEditor } from "./ContentBlockEditor";
import { MediaPicker } from "./MediaPicker";
import { BilingualFormTabs } from "./BilingualFormTabs";
import { LivePreviewModal } from "./LivePreviewModal";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";
import {
  Eye,
  ArrowLeft,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Globe,
  Layers,
  GraduationCap,
  Image as ImageIcon,
  Search,
  FileText,
  MoveUp,
  MoveDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  contentBlocksSchema,
  type ContentBlock,
} from "@/features/shared/schemas/content-block.schema";

const statusLabels: Record<AdminContentStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
  PLANNED: "Đã lên kế hoạch",
  IN_PROGRESS: "Đang thi công",
  COMPLETED: "Đã hoàn thành",
};

const statusColors: Record<AdminContentStatus, string> = {
  DRAFT: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  PUBLISHED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  ARCHIVED: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  PLANNED: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  IN_PROGRESS: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

const empty = (type: AdminContentType): AdminContent => ({
  id: "",
  type,
  title: "",
  slug: "",
  image: "",
  status: "DRAFT",
  description: "",
  eyebrow: "",
  meta: "",
  highlights: [],
  sections: [],
  contentBlocks: [],
  publishedAt: null,
  updatedAt: new Date().toISOString(),
  sortOrder: 0,
  isFeatured: false,
  location: "",
  year: new Date().getFullYear(),
  categoryId: null,
  authorName: "",
  duration: "",
  level: "",
  price: "",
  instructor: "",
  learningOutcomes: [],
  title_vi: "",
  description_vi: "",
  eyebrow_vi: "",
  highlights_vi: [],
  seoTitle_vi: "",
  seoDescription_vi: "",
});

export function ContentManager({
  contentType,
}: {
  contentType: AdminContentType;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [adminLangTab, setAdminLangTab] = useState<"vi" | "en">("vi");
  const [items, setItems] = useState<AdminContent[]>([]);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [query, setQuery] = useState(params.get("search") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [page, setPage] = useState(Number(params.get("page") ?? 1));
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editor, setEditor] = useState<AdminContent | null>(() =>
    params.get("create") ? empty(contentType) : null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [dirty, setDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newCurriculum, setNewCurriculum] = useState({
    title: "",
    description: "",
  });

  const publicBase =
    contentType === "Dịch vụ"
      ? "/dich-vu"
      : contentType === "Dự án"
        ? "/du-an"
        : contentType === "Khóa học"
          ? "/khoa-hoc"
          : "/blog";

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setFeedback("");
      try {
        const [result, categoryResult] = await Promise.all([
          adminContentApi.list(
            contentType,
            {
              page,
              limit: 20,
              search: query,
              status,
              sortBy: "updatedAt",
              sortOrder: "desc",
            },
            signal,
          ),
          adminContentApi.categories(contentType, signal),
        ]);
        if (signal?.aborted) return;
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : Array.isArray((result as unknown as { items: AdminContent[] })?.items)
              ? (result as unknown as { items: AdminContent[] }).items
              : [];
        setItems(list.map((x) => ({ ...x, type: contentType })));
        const totalPages = Number(
          result?.meta?.totalPages ??
            Math.max(1, Math.ceil((result?.meta?.total ?? list.length) / 20)),
        );
        setTotalPages(totalPages || 1);
        const catList = Array.isArray(categoryResult?.data)
          ? categoryResult.data
          : Array.isArray(categoryResult)
            ? categoryResult
            : [];
        setCategories(catList);
      } catch (error) {
        if (signal?.aborted) return;
        setFeedback(
          error instanceof Error ? error.message : "Không thể tải dữ liệu",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [contentType, page, query, status],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const q = new URLSearchParams();
    if (page > 1) q.set("page", String(page));
    if (query) q.set("search", query);
    if (status) q.set("status", status);
    const text = q.toString();
    router.replace(text ? `?${text}` : window.location.pathname, {
      scroll: false,
    });
  }, [page, query, router, status]);

  function closeEditor() {
    if (dirty && !window.confirm("Có thay đổi chưa lưu. Bạn có muốn thoát khỏi trình soạn thảo?"))
      return;
    setEditor(null);
    setDirty(false);
  }

  function update(patch: Partial<AdminContent>) {
    setEditor((old) => (old ? { ...old, ...patch } : old));
    setDirty(true);
  }

  async function save() {
    if (!editor) return;
    const title = editor.title?.trim() || editor.title_vi?.trim();
    if (!title) {
      toast.error("Vui lòng nhập tiêu đề (Tiếng Việt hoặc Tiếng Anh).");
      return;
    }

    const description =
      editor.description?.trim() || editor.description_vi?.trim() || title;

    setSaving(true);
    const toastId = toast.loading("Đang lưu nội dung...");
    try {
      if (editor.contentBlocks) {
        contentBlocksSchema.parse(editor.contentBlocks);
      }
      const slug = editor.slug?.trim() || slugify(title);
      const payload: AdminContent = {
        ...editor,
        title: editor.title?.trim() || title,
        title_vi: editor.title_vi?.trim() || editor.title?.trim() || title,
        slug,
        description,
        description_vi: editor.description_vi?.trim() || description,
        image: editor.image || "/images/hero-1.webp",
        eyebrow: editor.eyebrow || editor.eyebrow_vi || "BIM4C Enterprise",
        highlights: Array.isArray(editor.highlights) ? editor.highlights : [],
        sections: Array.isArray(editor.sections) ? editor.sections : [],
        ...(contentType === "Dự án"
          ? {
              location: editor.location || "Đà Nẵng, Việt Nam",
              year: Number(editor.year) || new Date().getFullYear(),
              categoryId: editor.categoryId || (categories[0]?.id ?? undefined),
            }
          : {}),
      };

      if (editor.id) {
        await adminContentApi.update(contentType, editor.id, payload);
        toast.success("Cập nhật nội dung thành công!", { id: toastId });
      } else {
        await adminContentApi.create(contentType, payload);
        toast.success("Tạo mới nội dung thành công!", { id: toastId });
      }
      setDirty(false);
      setEditor(null);
      void revalidateCmsCache();
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu nội dung.",
        { id: toastId },
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Bạn có chắc muốn xóa nội dung này?")) return;
    setSaving(true);
    const toastId = toast.loading("Đang xóa...");
    try {
      await adminContentApi.remove(contentType, id);
      toast.success("Xóa nội dung thành công!", { id: toastId });
      void revalidateCmsCache();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa.", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  }

  async function bulk(action: "publish" | "archive" | "delete") {
    if (!selected.length) return;
    setSaving(true);
    const toastId = toast.loading("Đang thực hiện thao tác hàng loạt...");
    try {
      if (action === "delete") {
        if (!window.confirm(`Xóa ${selected.length} nội dung đã chọn?`)) return;
        await Promise.all(selected.map((id) => adminContentApi.remove(contentType, id)));
        toast.success(`Đã xóa ${selected.length} nội dung.`, { id: toastId });
      } else {
        const nextStatus: AdminContentStatus =
          action === "publish" ? "PUBLISHED" : "ARCHIVED";
        await Promise.all(
          selected.map((id) =>
            adminContentApi.update(contentType, id, { status: nextStatus }),
          ),
        );
        toast.success(
          `Đã ${action === "publish" ? "xuất bản" : "lưu trữ"} ${selected.length} nội dung.`,
          { id: toastId },
        );
      }
      setSelected([]);
      void revalidateCmsCache();
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Thao tác hàng loạt thất bại.",
        { id: toastId },
      );
    } finally {
      setSaving(false);
    }
  }

  async function addProjectImage(media: { url: string; alt: string }) {
    if (!editor) return;
    if (!editor.id) {
      update({
        images: [
          ...(editor.images ?? []),
          {
            id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url: media.url,
            alt: media.alt || "Hình ảnh dự án",
            caption: "",
            sortOrder: (editor.images?.length ?? 0) + 1,
          },
        ],
      });
      toast.success("Đã thêm hình ảnh vào dự án!");
      return;
    }
    try {
      const created = await adminContentApi.addProjectImage(editor.id, {
        url: media.url,
        alt: media.alt || "Hình ảnh dự án",
        sortOrder: (editor.images?.length ?? 0) + 1,
      });
      update({
        images: [
          ...(editor.images ?? []),
          {
            id: created.data.id,
            url: media.url,
            alt: media.alt || "Hình ảnh dự án",
            caption: "",
            sortOrder: (editor.images?.length ?? 0) + 1,
          },
        ],
      });
      toast.success("Đã thêm hình ảnh vào dự án!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể thêm ảnh");
    }
  }

  async function moveProjectImage(index: number, delta: number) {
    if (!editor?.images) return;
    const target = index + delta;
    if (target < 0 || target >= editor.images.length) return;
    const next = [...editor.images];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    update({ images: next });
    if (!editor.id) return;
    try {
      await Promise.all(
        next.filter((img) => !img.id.startsWith("temp-")).map((img, i) =>
          adminContentApi.updateProjectImage(editor.id, img.id, {
            sortOrder: i,
          }),
        ),
      );
    } catch {
      toast.error("Không thể lưu thứ tự ảnh");
    }
  }

  async function addCurriculum() {
    if (!editor || !newCurriculum.title.trim()) return;
    if (!editor.id) {
      update({
        curriculum: [
          ...(editor.curriculum ?? []),
          {
            id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: newCurriculum.title.trim(),
            description: newCurriculum.description.trim(),
            sortOrder: (editor.curriculum?.length ?? 0) + 1,
          },
        ],
      });
      setNewCurriculum({ title: "", description: "" });
      toast.success("Đã thêm phần học mới!");
      return;
    }
    try {
      const created = await adminContentApi.addCourseSection(editor.id, {
        title: newCurriculum.title.trim(),
        description: newCurriculum.description.trim(),
        sortOrder: (editor.curriculum?.length ?? 0) + 1,
      });
      update({
        curriculum: [
          ...(editor.curriculum ?? []),
          {
            id: created.data.id,
            title: newCurriculum.title.trim(),
            description: newCurriculum.description.trim(),
            sortOrder: (editor.curriculum?.length ?? 0) + 1,
          },
        ],
      });
      setNewCurriculum({ title: "", description: "" });
      toast.success("Đã thêm phần học mới!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể thêm phần học");
    }
  }

  async function saveCurriculumSection(
    id: string,
    patch: { title?: string; description?: string },
  ) {
    if (!editor?.id) return;
    try {
      await adminContentApi.updateCourseSection(editor.id, id, patch);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật phần học",
      );
    }
  }

  async function moveCurriculum(index: number, delta: number) {
    if (!editor?.curriculum) return;
    const target = index + delta;
    if (target < 0 || target >= editor.curriculum.length) return;
    const next = [...editor.curriculum];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    update({ curriculum: next });
    if (!editor.id) return;
    try {
      await Promise.all(
        next.map((sec, i) =>
          adminContentApi.updateCourseSection(editor.id, sec.id, {
            sortOrder: i,
          }),
        ),
      );
    } catch {
      toast.error("Không thể lưu thứ tự phần học");
    }
  }

  const allSelected = useMemo(
    () => items.length > 0 && selected.length === items.length,
    [items, selected],
  );

  // ==========================================
  // RENDER FULLSCREEN STUDIO EDITOR VIEW
  // ==========================================
  if (editor) {
    const isEdit = Boolean(editor.id);
    const previewUrl = editor.slug ? `${publicBase}/${editor.slug}` : "";
    const activeTitle = adminLangTab === "vi" ? (editor.title_vi || editor.title) : editor.title;
    const activeSeoTitle = adminLangTab === "vi" ? (editor.seoTitle_vi || editor.seoTitle || activeTitle) : (editor.seoTitle || activeTitle);
    const activeSeoDesc = adminLangTab === "vi" ? (editor.seoDescription_vi || editor.seoDescription || editor.description_vi || editor.description) : (editor.seoDescription || editor.description);

    return (
      <div className="fullscreen-crud-editor relative -mx-4 -my-6 sm:-mx-6 sm:-my-8 lg:-mx-8 lg:-my-8 min-h-[calc(100vh-70px)] bg-slate-50/50 dark:bg-background text-foreground flex flex-col">
        {/* Sticky Top Studio Action Bar */}
        <header className="sticky top-[70px] z-40 flex items-center justify-between border-b border-slate-200/80 dark:border-border bg-white dark:bg-card px-4 py-3 shadow-xs md:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeEditor}
              className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại danh sách {contentType}</span>
            </Button>
            <span className="text-border hidden sm:inline">|</span>
            <div className="flex items-center gap-2 truncate">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[editor.status]}`}>
                {statusLabels[editor.status]}
              </span>
              <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {editor.title || (isEdit ? "Chỉnh sửa nội dung" : `Tạo ${contentType} mới`)}
              </span>
              {dirty && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Chưa lưu
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {previewUrl && (
              <Link
                href={previewUrl}
                target="_blank"
                className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="size-3.5 text-primary" />
                <span>Xem trang live</span>
              </Link>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Eye className="size-3.5 text-teal-500" />
              <span className="hidden md:inline">Live Preview</span>
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 px-4"
            >
              <Save className="size-3.5 text-slate-950" />
              <span>{saving ? "Đang lưu…" : isEdit ? "Cập nhật" : "Xuất bản"}</span>
            </Button>
          </div>
        </header>

        {/* Studio Workspace Canvas: 12-Column Grid */}
        <div className="flex-1 px-4 py-6 md:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* MAIN COLUMN: 8 Columns (Left) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Language Switcher Card */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Ngôn ngữ chỉnh sửa</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Hệ thống lưu trữ độc lập bản tiếng Anh và tiếng Việt
                  </span>
                </div>
                <BilingualFormTabs
                  activeTab={adminLangTab}
                  onTabChange={setAdminLangTab}
                  hasViTranslation={Boolean(
                    editor.title_vi || editor.description_vi,
                  )}
                  hasEnTranslation={Boolean(
                    editor.title || editor.description,
                  )}
                />

              </div>

              {/* Core Content Details Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <FileText className="size-4 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    {adminLangTab === "en" ? "Thông tin chính (English)" : "Bản dịch Tiếng Việt"}
                  </h3>
                </div>

                {adminLangTab === "en" ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <span>Tiêu đề chính (English - Bắt buộc)</span>
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        autoFocus
                        placeholder="Ví dụ: Advanced BIM Coordination & Management"
                        value={editor.title}
                        onChange={(e) =>
                          update({
                            title: e.target.value,
                            slug: editor.id ? editor.slug : slugify(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-bold text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <span>Đường dẫn (Slug URL)</span>
                        <span className="text-destructive">*</span>
                      </label>
                      <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2 text-sm">
                        <span className="text-xs text-muted-foreground select-none font-mono">
                          {publicBase}/
                        </span>
                        <input
                          value={editor.slug}
                          onChange={(e) => update({ slug: slugify(e.target.value) })}
                          className="flex-1 bg-transparent px-1 font-mono text-sm text-foreground outline-none"
                          placeholder="my-post-slug"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <span>Mô tả tóm tắt (English - Bắt buộc)</span>
                        <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Short summary in English..."
                        value={editor.description}
                        onChange={(e) => update({ description: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nhãn phân loại (Eyebrow Tag)
                        </label>
                        <input
                          placeholder="e.g. BIM CONSULTING"
                          value={editor.eyebrow}
                          onChange={(e) => update({ eyebrow: e.target.value })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Thông tin phụ (Meta / Date)
                        </label>
                        <input
                          placeholder="e.g. 15.09.2026"
                          value={editor.meta ?? ""}
                          onChange={(e) => update({ meta: e.target.value })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Tiêu đề Tiếng Việt
                        </label>
                        {editor.title_vi && (
                          <button
                            type="button"
                            onClick={() => {
                              update({ slug: slugify(editor.title_vi!) });
                              toast.success("Đã tạo đường dẫn (Slug) từ tiêu đề tiếng Việt!");
                            }}
                            className="text-primary text-[11px] font-bold hover:underline"
                          >
                            Tạo Slug từ tiêu đề
                          </button>
                        )}
                      </div>
                      <input
                        autoFocus
                        placeholder="Ví dụ: Tư vấn Điều phối & Quản lý BIM Chuyên sâu"
                        value={editor.title_vi ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          update({
                            title_vi: val,
                            ...(!editor.id && !editor.slug ? { slug: slugify(val) } : {}),
                          });
                        }}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-bold text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <span>Đường dẫn (Slug URL)</span>
                      </label>
                      <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2 text-sm">
                        <span className="text-xs text-muted-foreground select-none font-mono">
                          {publicBase}/
                        </span>
                        <input
                          value={editor.slug}
                          onChange={(e) => update({ slug: slugify(e.target.value) })}
                          className="flex-1 bg-transparent px-1 font-mono text-sm text-foreground outline-none"
                          placeholder="duong-dan-bai-viet"
                        />
                      </div>
                    </div>


                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Mô tả tóm tắt Tiếng Việt
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tóm tắt nội dung bằng Tiếng Việt..."
                        value={editor.description_vi ?? ""}
                        onChange={(e) => update({ description_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nhãn phân loại (Eyebrow Tiếng Việt)
                        </label>
                        <input
                          placeholder="Ví dụ: TƯ VẤN BIM"
                          value={editor.eyebrow_vi ?? ""}
                          onChange={(e) => update({ eyebrow_vi: e.target.value })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Thông tin phụ (Meta)
                        </label>
                        <input
                          value={editor.meta ?? ""}
                          onChange={(e) => update({ meta: e.target.value })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Highlights / Bullet points */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {adminLangTab === "en" ? "Điểm nổi bật (English - mỗi dòng một mục)" : "Điểm nổi bật (Tiếng Việt - mỗi dòng một mục)"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={adminLangTab === "en" ? "BIM Execution Planning\nOpenBIM IFC Standards\nClash Detection Workflow" : "Kế hoạch thực thi BIM\nChuẩn OpenBIM IFC\nQuy trình kiểm tra xung đột"}
                    value={adminLangTab === "en" ? editor.highlights.join("\n") : (editor.highlights_vi ?? []).join("\n")}
                    onChange={(e) =>
                      update(
                        adminLangTab === "en"
                          ? { highlights: e.target.value.split("\n").filter(Boolean) }
                          : { highlights_vi: e.target.value.split("\n").filter(Boolean) },
                      )
                    }
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono text-xs"
                  />
                </div>
              </div>

              {/* SPECIFIC ATTRIBUTES CARD: DỰ ÁN */}
              {contentType === "Dự án" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Layers className="size-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground">Thông tin dự án</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Địa điểm</label>
                      <input
                        placeholder="Hà Nội, Việt Nam"
                        value={adminLangTab === "en" ? editor.location ?? "" : editor.location_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { location: e.target.value } : { location_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Năm thực hiện</label>
                      <input
                        type="number"
                        value={editor.year ?? ""}
                        onChange={(e) => update({ year: Number(e.target.value) })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chủ đầu tư</label>
                    <input
                      placeholder="Tên chủ đầu tư / Tập đoàn"
                      value={adminLangTab === "en" ? editor.investor ?? "" : editor.investor_vi ?? ""}
                      onChange={(e) => update(adminLangTab === "en" ? { investor: e.target.value } : { investor_vi: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dự kiến hoàn thành</label>
                      <input
                        placeholder="Quý 4 / 2026"
                        value={adminLangTab === "en" ? editor.expectedCompletion ?? "" : editor.expectedCompletion_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { expectedCompletion: e.target.value } : { expectedCompletion_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gói thầu</label>
                      <input
                        placeholder="Tư vấn BIM & Quản lý CDE"
                        value={adminLangTab === "en" ? editor.contractPackage ?? "" : editor.contractPackage_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { contractPackage: e.target.value } : { contractPackage_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quy mô công trình</label>
                    <textarea
                      rows={2}
                      placeholder="Diện tích sàn, số tầng, tổng vốn đầu tư..."
                      value={adminLangTab === "en" ? editor.scale ?? "" : editor.scale_vi ?? ""}
                      onChange={(e) => update(adminLangTab === "en" ? { scale: e.target.value } : { scale_vi: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition focus:border-primary"
                    />
                  </div>

                  {/* Project Gallery Sub-editor */}
                  <div className="border-t border-border pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Bộ sưu tập hình ảnh ({editor.images?.length ?? 0})</h4>
                        <p className="text-xs text-muted-foreground">Hình ảnh phối cảnh và tiến độ thực tế dự án</p>
                      </div>
                      <MediaPicker
                        label="Thêm ảnh từ Media"
                        onSelect={(media) => void addProjectImage(media)}
                      />
                    </div>

                    <div className="grid gap-3">
                      {editor.images?.map((image, index) => (
                        <div key={image.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-2xs">
                          <Image src={image.url} alt={image.alt} width={80} height={56} className="size-14 rounded-lg object-cover border border-border" />
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <input
                              placeholder="Mô tả alt ảnh..."
                              value={image.alt}
                              onChange={(e) =>
                                update({
                                  images: editor.images?.map((item) =>
                                    item.id === image.id ? { ...item, alt: e.target.value } : item,
                                  ),
                                })
                              }
                              onBlur={() => void adminContentApi.updateProjectImage(editor.id, image.id, { alt: image.alt })}
                              className="w-full rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground outline-none"
                            />
                            <input
                              placeholder="Chú thích ảnh (caption)..."
                              value={image.caption ?? ""}
                              onChange={(e) =>
                                update({
                                  images: editor.images?.map((item) =>
                                    item.id === image.id ? { ...item, caption: e.target.value } : item,
                                  ),
                                })
                              }
                              onBlur={() => void adminContentApi.updateProjectImage(editor.id, image.id, { caption: image.caption ?? null })}
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
                              disabled={index === (editor.images?.length ?? 0) - 1}
                              onClick={() => void moveProjectImage(index, 1)}
                              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                              title="Di chuyển xuống"
                            >
                              <MoveDown className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (editor.id && !image.id.startsWith("temp-")) {
                                  await adminContentApi.deleteProjectImage(editor.id, image.id).catch(() => {});
                                }
                                update({ images: editor.images?.filter((x) => x.id !== image.id) });
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
              )}

              {/* SPECIFIC ATTRIBUTES CARD: KHÓA HỌC */}
              {contentType === "Khóa học" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <GraduationCap className="size-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground">Thông số khóa học & Giáo trình</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thời lượng</label>
                      <input
                        placeholder="12 buổi (36 giờ)"
                        value={adminLangTab === "en" ? editor.duration ?? "" : editor.duration_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { duration: e.target.value } : { duration_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cấp độ</label>
                      <input
                        placeholder="Cơ bản / Nâng cao"
                        value={adminLangTab === "en" ? editor.level ?? "" : editor.level_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { level: e.target.value } : { level_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Học phí</label>
                      <input
                        placeholder="Liên hệ / 4.500.000 đ"
                        value={adminLangTab === "en" ? editor.price ?? "" : editor.price_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { price: e.target.value } : { price_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giảng viên</label>
                      <input
                        placeholder="Chuyên gia BIM Quốc tế"
                        value={adminLangTab === "en" ? editor.instructor ?? "" : editor.instructor_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { instructor: e.target.value } : { instructor_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Mục tiêu & Kết quả học tập (Mỗi dòng một mục)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Làm chủ mô hình Revit & IFC&#10;Quy trình quản lý dữ liệu CDE&#10;Tự động hóa với Dynamo"
                      value={((adminLangTab === "en" ? editor.learningOutcomes : editor.learningOutcomes_vi) ?? []).join("\n")}
                      onChange={(e) =>
                        update(
                          adminLangTab === "en"
                            ? { learningOutcomes: e.target.value.split("\n").filter(Boolean) }
                            : { learningOutcomes_vi: e.target.value.split("\n").filter(Boolean) },
                        )
                      }
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition focus:border-primary font-mono text-xs"
                    />
                  </div>

                  {/* Course Curriculum Modules */}
                  <div className="border-t border-border pt-5 space-y-4">
                    <h4 className="text-sm font-bold text-foreground">Chương trình đào tạo chi tiết ({editor.curriculum?.length ?? 0} phần)</h4>
                    
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
                      {editor.curriculum?.map((section, index) => (
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
                                disabled={index === (editor.curriculum?.length ?? 0) - 1}
                                onClick={() => void moveCurriculum(index, 1)}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                              >
                                <MoveDown className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (editor.id && !section.id.startsWith("temp-")) {
                                    await adminContentApi.deleteCourseSection(editor.id, section.id).catch(() => {});
                                  }
                                  update({ curriculum: editor.curriculum?.filter((x) => x.id !== section.id) });
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
                              update({
                                curriculum: editor.curriculum?.map((item) =>
                                  item.id === section.id ? { ...item, title: e.target.value } : item,
                                ),
                              })
                            }
                            onBlur={() => void saveCurriculumSection(section.id, { title: section.title })}
                            className="w-full rounded border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground outline-none"
                          />
                          <textarea
                            rows={2}
                            value={section.description}
                            onChange={(e) =>
                              update({
                                curriculum: editor.curriculum?.map((item) =>
                                  item.id === section.id ? { ...item, description: e.target.value } : item,
                                ),
                              })
                            }
                            onBlur={() => void saveCurriculumSection(section.id, { description: section.description })}
                            className="w-full rounded border border-border bg-background p-2 text-xs text-muted-foreground outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC ATTRIBUTES CARD: TIN TỨC */}
              {contentType === "Tin tức" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Tác giả bài viết</h3>
                  <input
                    placeholder="Tác giả (Ví dụ: BIM4C Editorial Board)"
                    value={editor.authorName ?? ""}
                    onChange={(e) => update({ authorName: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                  />
                </div>
              )}

              {/* STRUCTURED CONTENT BLOCKS EDITOR CARD */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Khối nội dung chi tiết (Content Blocks)</h3>
                    <p className="text-xs text-muted-foreground">Soạn thảo văn bản đa dạng, hình ảnh, trích dẫn, danh sách tính năng</p>
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {adminLangTab === "en" ? "🇬🇧 Bản English" : "🇻🇳 Bản Tiếng Việt"}
                  </span>
                </div>

                <ContentBlockEditor
                  value={
                    adminLangTab === "en"
                      ? editor.contentBlocks ?? []
                      : editor.contentBlocks_vi ?? []
                  }
                  onChange={(contentBlocks) =>
                    update(
                      adminLangTab === "en"
                        ? { contentBlocks }
                        : { contentBlocks_vi: contentBlocks },
                    )
                  }
                />
              </div>

              {/* RELATED ITEMS CARD */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-foreground">Liên kết nội dung liên quan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {items.filter((item) => item.id !== editor.id).map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-border p-3 text-xs text-foreground cursor-pointer hover:bg-muted/40 transition select-none"
                    >
                      <input
                        type="checkbox"
                        checked={(editor.relatedIds ?? []).includes(item.id)}
                        onChange={(e) =>
                          update({
                            relatedIds: e.target.checked
                              ? [...(editor.relatedIds ?? []), item.id]
                              : (editor.relatedIds ?? []).filter((id) => id !== item.id),
                          })
                        }
                        className="size-4 rounded accent-primary cursor-pointer"
                      />
                      <span className="truncate flex-1">{item.title}</span>
                    </label>
                  ))}
                  {items.filter((item) => item.id !== editor.id).length === 0 && (
                    <p className="text-xs text-muted-foreground col-span-2">Chưa có bài viết hoặc nội dung khác để liên kết.</p>
                  )}
                </div>
              </div>

            </div>

            {/* SIDEBAR COLUMN: 4 Columns (Right) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Publishing Control Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Save className="size-4 text-primary" />
                  <span>Trạng thái & Phân loại</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái xuất bản</label>
                  <select
                    value={editor.status}
                    onChange={(e) => update({ status: e.target.value as AdminContentStatus })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                  >
                    <option value="DRAFT">Bản nháp (Draft)</option>
                    <option value={contentType === "Dự án" ? "PLANNED" : "PUBLISHED"}>
                      {contentType === "Dự án" ? "Lên kế hoạch (Planned)" : "Đã xuất bản (Published)"}
                    </option>
                    {contentType === "Dự án" && <option value="IN_PROGRESS">Đang thi công (In Progress)</option>}
                    {contentType === "Dự án" && <option value="COMPLETED">Đã hoàn thành (Completed)</option>}
                    <option value="ARCHIVED">Đã lưu trữ (Archived)</option>
                  </select>
                </div>

                {(contentType === "Dự án" || contentType === "Tin tức") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danh mục</label>
                    <select
                      value={editor.categoryId ?? ""}
                      onChange={(e) => update({ categoryId: e.target.value || null })}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min="0"
                    value={editor.sortOrder}
                    onChange={(e) => update({ sortOrder: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                  />
                </div>

                <label className="flex items-center gap-2.5 pt-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editor.isFeatured ?? false}
                    onChange={(e) => update({ isFeatured: e.target.checked })}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                  <span>Đánh dấu nổi bật (Featured item)</span>
                </label>
              </div>

              {/* Featured Image Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <span>Ảnh đại diện (Thumbnail)</span>
                </h3>

                {editor.image ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted group">
                    <Image
                      src={editor.image}
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <MediaPicker
                        label="Thay đổi ảnh"
                        onSelect={(media) => update({ image: media.url })}
                      />
                      <button
                        type="button"
                        onClick={() => update({ image: "" })}
                        className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90 transition"
                      >
                        Gỡ ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-3 bg-muted/20">
                    <ImageIcon className="size-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">Chưa có ảnh đại diện cho nội dung này</p>
                    <MediaPicker
                      label="Chọn ảnh từ Thư viện"
                      onSelect={(media) => update({ image: media.url })}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground">URL Ảnh trực tiếp</label>
                  <input
                    placeholder="/images/example.webp hoặc https://..."
                    value={editor.image}
                    onChange={(e) => update({ image: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground outline-none"
                  />
                </div>
              </div>

              {/* SEO & Social Metadata Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    <span>Tối ưu SEO & Metadata</span>
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {adminLangTab === "en" ? "🇬🇧 English Meta" : "🇻🇳 Tiếng Việt Meta"}
                  </span>
                </div>

                {/* Google SERP Snippet Preview */}
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1 font-sans text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Google Search Preview
                  </span>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono truncate">
                    https://bim4c.com{publicBase}/{editor.slug || "slug-url"}
                  </div>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 line-clamp-1 hover:underline cursor-pointer">
                    {activeSeoTitle || "Tiêu đề SEO của bạn"}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {activeSeoDesc || "Mô tả SEO xuất hiện trên trang tìm kiếm Google và các mạng xã hội khi chia sẻ liên kết."}
                  </div>
                </div>

                {adminLangTab === "en" ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>SEO Title (English)</span>
                        <span className="font-mono text-[10px]">{(editor.seoTitle ?? "").length}/60</span>
                      </div>
                      <input
                        placeholder="Meta title in English..."
                        value={editor.seoTitle ?? ""}
                        onChange={(e) => update({ seoTitle: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none transition focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>SEO Description (English)</span>
                        <span className="font-mono text-[10px]">{(editor.seoDescription ?? "").length}/160</span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Meta description in English..."
                        value={editor.seoDescription ?? ""}
                        onChange={(e) => update({ seoDescription: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>SEO Title (Tiếng Việt)</span>
                        <span className="font-mono text-[10px]">{(editor.seoTitle_vi ?? "").length}/60</span>
                      </div>
                      <input
                        placeholder="Tiêu đề SEO Tiếng Việt..."
                        value={editor.seoTitle_vi ?? ""}
                        onChange={(e) => update({ seoTitle_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none transition focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>SEO Description (Tiếng Việt)</span>
                        <span className="font-mono text-[10px]">{(editor.seoDescription_vi ?? "").length}/160</span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Mô tả SEO Tiếng Việt..."
                        value={editor.seoDescription_vi ?? ""}
                        onChange={(e) => update({ seoDescription_vi: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none transition focus:border-primary"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Canonical URL</label>
                  <input
                    placeholder="https://bim4c.com/..."
                    value={editor.canonicalUrl ?? ""}
                    onChange={(e) => update({ canonicalUrl: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-mono text-foreground outline-none transition focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ảnh chia sẻ SEO (Social Card)</label>
                    <MediaPicker
                      label="Chọn ảnh SEO"
                      onSelect={(media) => update({ seoImage: media.url })}
                    />
                  </div>
                  <input
                    placeholder="/images/seo-share.webp"
                    value={editor.seoImage ?? ""}
                    onChange={(e) => update({ seoImage: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-mono text-foreground outline-none transition focus:border-primary"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Live Preview Modal */}
        <LivePreviewModal
          content={editor}
          lang={adminLangTab}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      </div>
    );
  }

  // ==========================================
  // RENDER DATA TABLE LIST VIEW
  // ==========================================
  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-xs">
        {/* Search & Filter Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-border p-4 bg-slate-50/60 dark:bg-muted/20">
          <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={`Tìm kiếm ${contentType.toLowerCase()}...`}
                className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background pl-9 pr-4 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background px-3.5 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="published">Đã xuất bản</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>

          <Button
            onClick={() => setEditor(empty(contentType))}
            className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 px-4"
          >
            <Plus className="size-4" />
            <span>Tạo {contentType.toLowerCase()} mới</span>
          </Button>
        </div>

        {feedback && (
          <div className="m-4 flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-xs text-primary">
            <span>{feedback}</span>
            <button onClick={() => setFeedback("")} aria-label="Đóng thông báo">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Bulk Action Bar */}
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-slate-900 text-white px-5 py-3 text-xs border-b border-slate-800">
            <span className="font-semibold">
              Đã chọn <b>{selected.length}</b> mục
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" variant="secondary" disabled={saving} onClick={() => void bulk("publish")} className="text-xs h-8">
                Xuất bản
              </Button>
              <Button size="sm" variant="secondary" disabled={saving} onClick={() => void bulk("archive")} className="text-xs h-8">
                Lưu trữ
              </Button>
              <Button size="sm" variant="destructive" disabled={saving} onClick={() => void bulk("delete")} className="text-xs h-8">
                Xóa
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])} className="text-xs h-8 text-slate-300">
                Bỏ chọn
              </Button>
            </div>
          </div>
        )}

        {/* Content Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-border bg-slate-50/80 dark:bg-muted/40 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="w-12 px-4 py-3.5">
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả"
                    checked={allSelected}
                    onChange={(e) =>
                      setSelected(e.target.checked ? items.map((x) => x.id) : [])
                    }
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">Nội dung</th>
                <th className="px-4 py-3.5">Loại</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Cập nhật</th>
                <th className="w-24 px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      aria-label={`Chọn ${item.title}`}
                      checked={selected.includes(item.id)}
                      onChange={() =>
                        setSelected((old) =>
                          old.includes(item.id)
                            ? old.filter((x) => x !== item.id)
                            : [...old, item.id],
                        )
                      }
                      className="size-4 rounded accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3.5">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          width={64}
                          height={46}
                          className="size-11 rounded-lg object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="size-11 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                          <ImageIcon className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            const value = structuredClone(item);
                            const blocks: ContentBlock[] = value.contentBlocks?.length
                              ? value.contentBlocks
                              : value.sections.flatMap((section, index) => [
                                  {
                                    id: `legacy-${index}`,
                                    type: "rich-text" as const,
                                    heading: section.title,
                                    content: section.body,
                                  },
                                ]);
                            setEditor({ ...value, contentBlocks: blocks });
                          }}
                          className="font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-1 block"
                        >
                          {item.title}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono text-[11px] truncate max-w-xs">{item.slug}</span>
                          {item.title_vi && (
                            <span className="rounded bg-teal-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                              VI
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted px-2.5 py-1 font-medium">{item.type}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const value = structuredClone(item);
                          const blocks: ContentBlock[] = value.contentBlocks?.length
                            ? value.contentBlocks
                            : value.sections.flatMap((section, index) => [
                                {
                                  id: `legacy-${index}`,
                                  type: "rich-text" as const,
                                  heading: section.title,
                                  content: section.body,
                                },
                              ]);
                          setEditor({ ...value, contentBlocks: blocks });
                        }}
                        className="h-8 px-2.5 text-xs font-semibold gap-1"
                      >
                        <span>Sửa</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={saving}
                        onClick={() => void remove(item.id)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        title="Xóa"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="size-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">Chưa có {contentType.toLowerCase()} nào phù hợp.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditor(empty(contentType))}
                        className="mt-2 text-xs"
                      >
                        ＋ Tạo mới ngay
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 dark:border-border p-4 text-xs text-muted-foreground bg-slate-50/60 dark:bg-muted/20">
          <span>
            Trang <b>{page}</b> / <b>{totalPages}</b>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setPage((x) => Math.max(1, x - 1));
                scrollToPageTop();
              }}
              className="h-8 text-xs font-semibold"
            >
              ← Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                setPage((x) => x + 1);
                scrollToPageTop();
              }}
              className="h-8 text-xs font-semibold"
            >
              Trang sau →
            </Button>
          </div>
          <span>Tổng cộng {items.length} mục</span>
        </footer>
      </section>

      {(contentType === "Dự án" || contentType === "Tin tức") && (
        <div className="mt-8">
          <CategoryManager type={contentType} onChange={() => void load()} />
        </div>
      )}
    </>
  );
}
