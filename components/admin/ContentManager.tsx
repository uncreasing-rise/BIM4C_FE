"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminContentApi } from "@/features/admin/api/client";
import { createEmptyContent } from "@/features/admin/serializers";
import type {
  AdminCategory,
  AdminContent,
  AdminContentStatus,
  AdminContentType,
  AdminCourseContent,
  AdminPostContent,
  AdminProjectContent,
  AdminServiceContent,
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
  PostFields,
  ProjectFields,
  CourseFields,
  ServiceFields,
} from "./editors";
import {
  Eye,
  ArrowLeft,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Globe,
  Image as ImageIcon,
  Search,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { toast } from "sonner";
import {
  parseContentBlocks,
  type ContentBlock,
} from "@/features/shared/schemas/content-block.schema";
import { StatusBadge, Tag, formatDateTime, missingLanguages, statusLabel } from "./admin-ui";
import { useConfirm } from "./ConfirmDialog";

function prepareEditorContent(value: AdminContent, contentType: AdminContentType): AdminContent {
  const sections = Array.isArray(value.sections) ? value.sections : [];
  const sectionsVi = Array.isArray(value.sections_vi) ? value.sections_vi : [];
  const parsedContentBlocks = parseContentBlocks(value.contentBlocks);
  const parsedContentBlocksVi = parseContentBlocks(value.contentBlocks_vi);
  const contentBlocks = parsedContentBlocks.length > 0
    ? parsedContentBlocks
    : sections.map((section, index) => ({
        id: `legacy-${index}`,
        type: "rich-text" as const,
        heading: section.title,
        content: section.body,
      }));
  const contentBlocksVi = parsedContentBlocksVi.length > 0
    ? parsedContentBlocksVi
    : sectionsVi.map((section, index) => ({
        id: `legacy-vi-${index}`,
        type: "rich-text" as const,
        heading: section.title,
        content: section.body,
      }));

  return {
    ...value,
    type: contentType,
    sections,
    sections_vi: sectionsVi,
    contentBlocks,
    contentBlocks_vi: contentBlocksVi.length > 0 ? contentBlocksVi : contentBlocks,
  } as AdminContent;
}

export function ContentManager({
  contentType,
}: {
  contentType: AdminContentType;
}) {
  const { confirm, dialog } = useConfirm();
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
    params.get("create") ? createEmptyContent(contentType) : null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [dirty, setDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

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
        const result = await adminContentApi.list(
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
        );
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
        // Categories are auxiliary data. A category permission/schema problem
        // must not prevent the content list and editor from opening.
        try {
          const categoryResult = await adminContentApi.categories(contentType, signal);
          const catList = Array.isArray(categoryResult?.data)
            ? categoryResult.data
            : Array.isArray(categoryResult)
              ? categoryResult
              : [];
          setCategories(catList);
        } catch (categoryError) {
          if (signal?.aborted) return;
          console.warn("Could not load content categories", categoryError);
          setCategories([]);
        }
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
    if (params.toString() === text) return;
    router.replace(text ? `?${text}` : window.location.pathname, {
      scroll: false,
    });
  }, [page, query, params, router, status]);

  async function closeEditor() {
    if (
      dirty &&
      !(await confirm({
        title: "Bỏ các thay đổi chưa lưu?",
        description: "Những chỉnh sửa từ lần lưu gần nhất sẽ bị mất.",
        confirmLabel: "Bỏ thay đổi",
        cancelLabel: "Tiếp tục chỉnh sửa",
      }))
    )
      return;
    setEditor(null);
    setDirty(false);
  }

  function update(patch: Partial<AdminContent>) {
    setEditor((old) => (old ? { ...old, ...patch } : old));
    setDirty(true);
  }

  async function openEditor(item: AdminContent) {
    setOpeningId(item.id);
    try {
      const response = await adminContentApi.getById(contentType, item.id);
      setEditor(prepareEditorContent(response?.data ?? item, contentType));
    } catch (error) {
      // Keep the editor usable even if the detail endpoint is temporarily unavailable.
      setEditor(prepareEditorContent(item, contentType));
      toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết nội dung.");
    } finally {
      setOpeningId(null);
    }
  }

  function validateContentBlocks(
    blocks: ContentBlock[] | undefined,
    lang: "vi" | "en",
  ): { isValid: boolean; message?: string } {
    if (!blocks || blocks.length === 0) return { isValid: true };
    const langLabel = lang === "vi" ? "Bản Tiếng Việt" : "Bản English";

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const indexStr = `Khối #${i + 1} (${langLabel})`;

      if (block.type === "rich-text") {
        if (!block.content || !block.content.trim()) {
          return {
            isValid: false,
            message: `${indexStr} kiểu "Văn bản" đang để trống nội dung. Vui lòng nhập nội dung hoặc xóa khối trước khi lưu.`,
          };
        }
      } else if (block.type === "image") {
        if (!block.image?.url || !block.image.url.trim()) {
          return {
            isValid: false,
            message: `${indexStr} kiểu "Hình ảnh" chưa được chọn ảnh. Vui lòng chọn ảnh hoặc xóa khối.`,
          };
        }
      } else if (block.type === "gallery") {
        if (!block.images || block.images.length === 0) {
          return {
            isValid: false,
            message: `${indexStr} kiểu "Thư viện ảnh" chưa có hình ảnh nào.`,
          };
        }
        const missingIdx = block.images.findIndex((img) => !img.url || !img.url.trim());
        if (missingIdx !== -1) {
          return {
            isValid: false,
            message: `${indexStr} kiểu "Thư viện ảnh" có ảnh thứ ${missingIdx + 1} chưa có ảnh hợp lệ.`,
          };
        }
      } else if (block.type === "quote") {
        if (!block.quote || !block.quote.trim()) {
          return {
            isValid: false,
            message: `${indexStr} kiểu "Trích dẫn" đang để trống câu trích dẫn. Vui lòng nhập nội dung hoặc xóa khối.`,
          };
        }
      } else if (block.type === "feature-list") {
        if (!block.items || block.items.length === 0) {
          return {
            isValid: false,
            message: `${indexStr} kiểu "Danh sách" chưa có mục nào.`,
          };
        }
        const emptyItemIdx = block.items.findIndex((item) => !item || !item.trim());
        if (emptyItemIdx !== -1) {
          return {
            isValid: false,
            message: `${indexStr} kiểu "Danh sách" có dòng thứ ${emptyItemIdx + 1} bị bỏ trống. Vui lòng nhập hoặc xóa dòng đó.`,
          };
        }
      } else if (block.type === "video") {
        if (!block.url || !block.url.trim()) {
          return {
            isValid: false,
            message: `${indexStr} kiểu "Video" đang để trống đường dẫn URL.`,
          };
        }
      }
    }

    return { isValid: true };
  }

  async function save() {
    if (!editor) return;
    const title = editor.title?.trim() || editor.title_vi?.trim();
    if (!title) {
      toast.error("Vui lòng nhập tiêu đề (Tiếng Việt hoặc Tiếng Anh).");
      return;
    }

    // Kiểm tra tính hợp lệ của Khối nội dung Tiếng Việt
    const viValidation = validateContentBlocks(editor.contentBlocks_vi, "vi");
    if (!viValidation.isValid) {
      toast.error(viValidation.message, { duration: 5000 });
      setAdminLangTab("vi");
      return;
    }

    // Kiểm tra tính hợp lệ của Khối nội dung English
    const enValidation = validateContentBlocks(editor.contentBlocks, "en");
    if (!enValidation.isValid) {
      toast.error(enValidation.message, { duration: 5000 });
      setAdminLangTab("en");
      return;
    }

    const description =
      editor.description?.trim() || editor.description_vi?.trim() || title;

    setSaving(true);
    const toastId = toast.loading("Đang lưu nội dung...");
    try {
      const rawBlocks = editor.contentBlocks ? parseContentBlocks(editor.contentBlocks) : [];
      const rawBlocksVi = editor.contentBlocks_vi ? parseContentBlocks(editor.contentBlocks_vi) : [];
      const cleanBlocks = rawBlocks.length > 0 ? rawBlocks : rawBlocksVi;
      const cleanBlocksVi = rawBlocksVi.length > 0 ? rawBlocksVi : rawBlocks;

      const slug = editor.slug?.trim() || slugify(title);
      const payload: AdminContent = {
        ...editor,
        title: editor.title?.trim() || title,
        title_vi: editor.title_vi?.trim() || editor.title?.trim() || title,
        slug,
        description,
        description_vi: editor.description_vi?.trim() || description,
        image: editor.image || "/images/hero-skyline-bim.jpg",
        eyebrow: editor.eyebrow || editor.eyebrow_vi || "BIM4C Enterprise",
        highlights: Array.isArray(editor.highlights) ? editor.highlights : [],
        sections: Array.isArray(editor.sections) ? editor.sections : [],
        contentBlocks: cleanBlocks,
        contentBlocks_vi: cleanBlocksVi,
      };

      if (editor.id) {
        setItems((prev) =>
          prev.map((x) =>
            x.id === editor.id
              ? { ...x, ...payload, updatedAt: new Date().toISOString() }
              : x,
          ),
        );
        await adminContentApi.update(contentType, editor.id, payload);
        toast.success("Cập nhật nội dung thành công!", { id: toastId });
      } else {
        const res = await adminContentApi.create(contentType, payload);
        const newItem = (res?.data || payload) as AdminContent;
        setItems((prev) => [{ ...newItem, type: contentType }, ...prev]);
        toast.success("Tạo mới nội dung thành công!", { id: toastId });
      }
      setDirty(false);
      setEditor(null);
      await revalidateCmsCache();
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
    if (
      !(await confirm({
        title: `Xóa ${contentType.toLowerCase()} này?`,
        description: "Nội dung bị gỡ khỏi website và danh sách quản trị, không thể khôi phục từ giao diện quản trị.",
      }))
    )
      return;
    const prevItems = [...items];
    setItems((prev) => prev.filter((x) => x.id !== id));
    setSaving(true);
    const toastId = toast.loading("Đang xóa...");
    try {
      await adminContentApi.remove(contentType, id);
      toast.success("Xóa nội dung thành công!", { id: toastId });
      await revalidateCmsCache();
      await load();
    } catch (error) {
      setItems(prevItems);
      toast.error(error instanceof Error ? error.message : "Không thể xóa.", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  }

  async function bulk(action: "publish" | "archive" | "delete") {
    if (!selected.length) return;
    const prevItems = [...items];
    setSaving(true);
    const toastId = toast.loading("Đang thực hiện thao tác hàng loạt...");
    try {
      if (action === "delete") {
        if (
          !(await confirm({
            title: `Xóa ${selected.length} mục đã chọn?`,
            description: "Các nội dung này bị gỡ khỏi website và danh sách quản trị, không thể khôi phục từ giao diện quản trị.",
          }))
        ) {
          toast.dismiss(toastId);
          return;
        }
        setItems((prev) => prev.filter((x) => !selected.includes(x.id)));
        await Promise.all(selected.map((id) => adminContentApi.remove(contentType, id)));
        toast.success(`Đã xóa ${selected.length} nội dung.`, { id: toastId });
      } else {
        const nextStatus: AdminContentStatus =
          action === "publish" ? "PUBLISHED" : "ARCHIVED";
        setItems((prev) =>
          prev.map((x) =>
            selected.includes(x.id) ? { ...x, status: nextStatus } : x,
          ),
        );
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
      await revalidateCmsCache();
      await load();
    } catch (error) {
      setItems(prevItems);
      toast.error(
        error instanceof Error ? error.message : "Thao tác hàng loạt thất bại.",
        { id: toastId },
      );
    } finally {
      setSaving(false);
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

    return (
      <div className="fullscreen-crud-editor relative -mx-4 -mb-6 sm:-mx-6 sm:-mb-8 lg:-mx-8 lg:-mb-8 min-h-[calc(100vh-56px)] bg-slate-50/50 dark:bg-background text-foreground flex flex-col">
        {dialog}
        {/* Sticky Top Studio Action Bar */}
        <header className="sticky top-14 z-20 flex items-center justify-between border-b border-slate-200 dark:border-border bg-white dark:bg-card px-4 py-3 shadow-xs md:px-8">
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
              <StatusBadge domain={contentType === "Dự án" ? "project" : "content"} value={editor.status} />
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
                className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-muted hover:text-foreground"
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
              <span className="hidden md:inline">Xem trước</span>
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="gap-1.5"
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
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
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
                  hasViTranslation={!missingLanguages(editor).includes("VI")}
                  hasEnTranslation={!missingLanguages(editor).includes("EN")}
                />

              </div>

              {/* Core Content Details Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <FileText className="size-4 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    {adminLangTab === "en" ? "Thông tin chính (English)" : "Bản dịch Tiếng Việt"}
                  </h3>
                </div>

                {adminLangTab === "en" ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-slate-700 dark:text-foreground flex items-center gap-1">
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
                      <label className="text-[13px] font-medium text-slate-700 dark:text-foreground flex items-center gap-1">
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
                      <label className="text-[13px] font-medium text-slate-700 dark:text-foreground flex items-center gap-1">
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
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">
                            Nhãn nổi bật đầu thẻ (Eyebrow Tag)
                          </label>
                          <span className="text-[11px] text-muted-foreground/80">Tag hiển thị trên tiêu đề</span>
                        </div>
                        <input
                          placeholder="e.g. PRACTICAL BIM TRAINING"
                          value={editor.eyebrow}
                          onChange={(e) => update({ eyebrow: e.target.value })}
                          className="w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">
                            Thông tin phụ (Meta / Date)
                          </label>
                          <span className="text-[11px] text-muted-foreground/80">Thời lượng / Ngày / Quy mô</span>
                        </div>
                        <input
                          placeholder="e.g. 8 weeks · Online hoặc 15.09.2026"
                          value={editor.meta ?? ""}
                          onChange={(e) => update({ meta: e.target.value })}
                          className="w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">
                        Tiêu đề Tiếng Việt
                      </label>
                      <input
                        autoFocus
                        placeholder="Ví dụ: Tư vấn Điều phối & Quản lý BIM Chuyên sâu"
                        value={editor.title_vi ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          update({
                            title_vi: val,
                            slug: editor.id ? (editor.slug || slugify(val)) : slugify(val),
                          });
                        }}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-bold text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-slate-700 dark:text-foreground flex items-center gap-1">
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
                      <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">
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
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">
                            Nhãn nổi bật đầu thẻ (Eyebrow Tiếng Việt)
                          </label>
                          <span className="text-[11px] text-muted-foreground/80">Tag hiển thị trên tiêu đề</span>
                        </div>
                        <input
                          placeholder="Ví dụ: ĐÀO TẠO THỰC CHIẾN"
                          value={editor.eyebrow_vi ?? ""}
                          onChange={(e) => update({ eyebrow_vi: e.target.value })}
                          className="w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">
                            Thông tin phụ (Meta Tiếng Việt)
                          </label>
                          <span className="text-[11px] text-muted-foreground/80">Thời lượng / Ngày / Quy mô</span>
                        </div>
                        <input
                          placeholder="Ví dụ: 8 tuần · Khai giảng 15/10"
                          value={editor.meta ?? ""}
                          onChange={(e) => update({ meta: e.target.value })}
                          className="w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* DOMAIN-SPECIFIC FIELDS */}
              {contentType === "Dự án" && (
                <ProjectFields
                  content={editor as unknown as Partial<AdminProjectContent>}
                  adminLangTab={adminLangTab}
                  onChange={update}
                />
              )}

              {contentType === "Khóa học" && (
                <CourseFields
                  content={editor as unknown as Partial<AdminCourseContent>}
                  adminLangTab={adminLangTab}
                  onChange={update}
                />
              )}

              {(contentType === "Tin tức" || contentType === "Chuyên môn") && (
                <PostFields
                  content={editor as unknown as Partial<AdminPostContent>}
                  onChange={update}
                />
              )}

              {contentType === "Dịch vụ" && (
                <ServiceFields
                  content={editor as unknown as Partial<AdminServiceContent>}
                  adminLangTab={adminLangTab}
                  onChange={update}
                />
              )}

              {/* STRUCTURED CONTENT BLOCKS EDITOR CARD */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
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
                  valueVi={editor.contentBlocks_vi ?? []}
                  valueEn={editor.contentBlocks ?? []}
                  activeLang={adminLangTab}
                  onChangeBilingual={({ contentBlocks_vi, contentBlocks }) =>
                    update({
                      contentBlocks_vi,
                      contentBlocks,
                    })
                  }
                />
              </div>

            </div>

            {/* SIDEBAR COLUMN: 4 Columns (Right) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Publishing Control Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Save className="size-4 text-primary" />
                  <span>Trạng thái & Phân loại</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">Trạng thái xuất bản</label>
                  <select
                    value={editor.status}
                    onChange={(e) => update({ status: e.target.value as AdminContentStatus })}
                    className="w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
                  >
                    {(contentType === "Dự án"
                      ? (["DRAFT", "PROFILED", "PLANNED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] as const)
                      : (["DRAFT", "PUBLISHED", "ARCHIVED"] as const)
                    ).map((value) => (
                      <option key={value} value={value}>
                        {statusLabel(contentType === "Dự án" ? "project" : "content", value)}
                      </option>
                    ))}
                  </select>
                </div>

                {(contentType === "Dự án" || contentType === "Tin tức" || contentType === "Chuyên môn") && (
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-700 dark:text-foreground">Danh mục</label>
                    <select
                      value={"categoryId" in editor ? (editor.categoryId ?? "") : ""}
                      onChange={(e) => update({ categoryId: e.target.value || null })}
                      className="w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
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

                {contentType === "Dự án" && (
                  <label className="flex items-center gap-2.5 pt-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean("isFeatured" in editor && editor.isFeatured)}
                      onChange={(e) => update({ isFeatured: e.target.checked })}
                      className="size-4 rounded accent-primary cursor-pointer"
                    />
                    <span>Đánh dấu dự án nổi bật (Featured)</span>
                  </label>
                )}
              </div>

              {/* Featured Image Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ImageIcon className="size-4 text-primary" />
                    <span>Ảnh đại diện (Thumbnail)</span>
                  </h3>
                  {editor.image && (
                    <MediaPicker
                      label="Đổi ảnh"
                      onSelect={(media) => update({ image: media.url })}
                    />
                  )}
                </div>

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
                      label="Tải ảnh lên / Chọn từ Thư viện"
                      onSelect={(media) => update({ image: media.url })}
                    />
                  </div>
                )}
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
      {dialog}
      <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs">
        {/* Search & Filter Header Bar */}
        <div className="flex flex-col gap-2 border-b border-slate-200 p-3 dark:border-border sm:flex-row sm:items-center sm:p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={`Tìm kiếm ${contentType.toLowerCase()}...`}
                aria-label={`Tìm kiếm ${contentType.toLowerCase()}`}
                className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Lọc theo trạng thái"
              className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">{statusLabel("content", "DRAFT")}</option>
              <option value="published">{statusLabel("content", "PUBLISHED")}</option>
              <option value="archived">{statusLabel("content", "ARCHIVED")}</option>
            </select>
          </div>

          <Button
            onClick={() => setEditor(createEmptyContent(contentType))}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span>Tạo {contentType.toLowerCase()} mới</span>
          </Button>
        </div>

        {feedback && (
          <div className="m-4">
            <ErrorState message={feedback} onRetry={() => void load()} />
            <span className="sr-only">{feedback}</span>
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
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500 dark:border-border dark:bg-muted/40 dark:text-muted-foreground">
                <th className="w-12 px-4 py-2.5">
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
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">Nội dung</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">Loại</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">Trạng thái</th>
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">Cập nhật</th>
                <th className="w-24 whitespace-nowrap px-4 py-2.5 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12">
                    <LoadingState label="Đang tải nội dung…" />
                  </td>
                </tr>
              )}
              {!loading && items.map((item) => (
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
                          onClick={() => void openEditor(item)}
                          className="font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-1 block"
                        >
                          {item.title}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono text-[11px] truncate max-w-xs">{item.slug}</span>
                          {missingLanguages(item).map((lang) => (
                            <Tag key={lang} tone="warning" className="h-5 px-1.5 text-[11px]">
                              Thiếu {lang}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted px-2.5 py-1 font-medium">{item.type}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    <StatusBadge domain={contentType === "Dự án" ? "project" : "content"} value={item.status} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {formatDateTime(item.updatedAt, false)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void openEditor(item)}
                        disabled={openingId === item.id}
                        aria-label={`Sửa ${item.title}`}
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
                        aria-label={`Xóa ${item.title}`}
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
                        onClick={() => setEditor(createEmptyContent(contentType))}
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
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-border p-4 text-xs text-muted-foreground bg-slate-50/60 dark:bg-muted/20">
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
