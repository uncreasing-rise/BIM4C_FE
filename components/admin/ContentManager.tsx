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
import { BilingualColumnsHeader, BilingualField, SharedBadge, TranslationChecklist, focusField, type Lang } from "./bilingual";
import { CORE_FIELDS, SEO_FIELDS, checkContent, fillBlockGaps, type TextSpec } from "./content-check";
import { cn } from "@/lib/utils";
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
import { parseContentBlocks } from "@/features/shared/schemas/content-block.schema";
import { StatusBadge, Tag, formatDateTime, missingLanguages, statusLabel } from "./admin-ui";
import { useConfirm } from "./ConfirmDialog";
import {
  FilterSelect,
  ListFooter,
  SearchBox,
  SortableTh,
  useDebouncedValue,
  useLoader,
  type SortState,
} from "./list-controls";

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
    // No fallback copy: the editor pairs blocks by position and flags the missing language.
    contentBlocks_vi: contentBlocksVi,
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
  const [items, setItems] = useState<AdminContent[]>([]);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [query, setQuery] = useState(params.get("search") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [sort, setSort] = useState<SortState>(() => ({
    by: params.get("sortBy") || "updatedAt",
    dir: params.get("sortOrder") === "asc" ? "asc" : "desc",
  }));
  const [pageSize, setPageSize] = useState(() => {
    const raw = Number(params.get("limit"));
    return [10, 20, 50, 100].includes(raw) ? raw : 20;
  });
  const [page, setPage] = useState(() => {
    const raw = Number(params.get("page"));
    return Number.isInteger(raw) && raw > 1 ? raw : 1;
  });
  const hasCategories =
    contentType === "Dự án" || contentType === "Tin tức" || contentType === "Chuyên môn";
  // "Tin tức" and "Chuyên môn" are two views of the same posts table.
  const group =
    contentType === "Tin tức" ? "news" : contentType === "Chuyên môn" ? "technical" : undefined;
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
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
  // New records keep the slug in sync with the title until the editor types one.
  const [slugTouched, setSlugTouched] = useState(false);
  const check = useMemo(() => (editor ? checkContent(editor, contentType) : null), [editor, contentType]);

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
            limit: pageSize,
            search: debouncedQuery,
            status,
            category: hasCategories ? category : undefined,
            group,
            sortBy: sort.by,
            sortOrder: sort.dir,
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
            Math.max(1, Math.ceil((result?.meta?.total ?? list.length) / pageSize)),
        );
        setTotalPages(totalPages || 1);
        setTotal(Number(result?.meta?.total ?? list.length));
        // After a delete or a narrower filter the current page can vanish.
        if (page > 1 && page > (totalPages || 1)) setPage(totalPages || 1);
      } catch (error) {
        if (signal?.aborted) return;
        setFeedback(
          error instanceof Error ? error.message : "Không thể tải dữ liệu",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [contentType, page, pageSize, debouncedQuery, status, category, group, hasCategories, sort],
  );

  // Categories are auxiliary data. A category permission/schema problem
  // must not prevent the content list and editor from opening.
  const loadCategories = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const categoryResult = await adminContentApi.categories(contentType, signal);
        if (signal?.aborted) return;
        setCategories(
          Array.isArray(categoryResult?.data)
            ? categoryResult.data
            : Array.isArray(categoryResult)
              ? categoryResult
              : [],
        );
      } catch (categoryError) {
        if (signal?.aborted) return;
        console.warn("Could not load content categories", categoryError);
        setCategories([]);
      }
    },
    [contentType],
  );

  useLoader(load);
  useLoader(loadCategories);

  // Any filter change starts again from page 1.
  const changeFilter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
    setSelected([]);
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const q = new URLSearchParams();
    if (page > 1) q.set("page", String(page));
    if (pageSize !== 20) q.set("limit", String(pageSize));
    if (debouncedQuery) q.set("search", debouncedQuery);
    if (status) q.set("status", status);
    if (category) q.set("category", category);
    if (sort.by !== "updatedAt" || sort.dir !== "desc") {
      q.set("sortBy", sort.by);
      q.set("sortOrder", sort.dir);
    }
    const text = q.toString();
    if (params.toString() === text) return;
    router.replace(text ? `?${text}` : window.location.pathname, {
      scroll: false,
    });
  }, [page, pageSize, debouncedQuery, params, router, status, category, sort]);

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

  function updateText(spec: TextSpec, lang: Lang, value: string) {
    const patch: Record<string, unknown> = { [lang === "vi" ? spec.vi : spec.en]: value };
    if (spec.id === "title" && editor && !editor.id && !slugTouched) {
      const en = lang === "en" ? value : editor.title ?? "";
      const vi = lang === "vi" ? value : editor.title_vi ?? "";
      patch.slug = slugify(en.trim() || vi.trim());
    }
    update(patch as Partial<AdminContent>);
  }

  async function openEditor(item: AdminContent) {
    setOpeningId(item.id);
    setSlugTouched(false);
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

  /**
   * Gallery images and curriculum modules added in the editor are only local
   * (temp ids) until the record exists; create them once it has been saved.
   */
  async function saveChildren(id: string) {
    if (!editor) return;
    const failed: string[] = [];
    if (contentType === "Dự án") {
      const images = (editor as AdminProjectContent).images ?? [];
      for (const [index, image] of images.entries()) {
        if (!image.id.startsWith("temp-")) continue;
        await adminContentApi
          .addProjectImage(id, {
            url: image.url,
            alt: image.alt?.trim() || image.alt_vi?.trim() || "Hình ảnh dự án",
            alt_vi: image.alt_vi?.trim() || null,
            caption: image.caption?.trim() || undefined,
            caption_vi: image.caption_vi?.trim() || null,
            sortOrder: index,
          })
          .catch(() => failed.push(`ảnh #${index + 1}`));
      }
    }
    if (contentType === "Khóa học") {
      const sections = (editor as AdminCourseContent).curriculum ?? [];
      for (const [index, section] of sections.entries()) {
        if (!section.id.startsWith("temp-")) continue;
        const title = section.title?.trim() || section.title_vi?.trim() || "";
        if (!title) continue;
        await adminContentApi
          .addCourseSection(id, {
            title,
            title_vi: section.title_vi?.trim() || null,
            description: section.description?.trim() || section.description_vi?.trim() || title,
            description_vi: section.description_vi?.trim() || null,
            sortOrder: index,
          })
          .catch(() => failed.push(`phần học #${index + 1}`));
      }
    }
    if (failed.length) toast.error(`Nội dung đã lưu nhưng chưa lưu được: ${failed.join(", ")}. Mở lại để thử.`);
  }

  async function save() {
    if (!editor || !check) return;

    if (check.errors.length > 0) {
      const first = check.errors[0];
      toast.error(`${first.label}: ${first.message}`, {
        description: check.errors.length > 1 ? `Còn ${check.errors.length - 1} lỗi khác trong bảng “Kiểm tra song ngữ”.` : undefined,
        duration: 6000,
      });
      focusField(first.target);
      return;
    }

    const warnings = check.issues.filter((issue) => issue.severity === "warning");
    const goingLive = !["DRAFT", "ARCHIVED"].includes(editor.status);
    if (warnings.length > 0 && goingLive) {
      const ok = await confirm({
        title: `Còn ${warnings.length} mục chưa đủ song ngữ`,
        description: (
          <span className="block space-y-2">
            <span className="block">
              Nội dung đang ở trạng thái hiển thị công khai. Những chỗ thiếu sẽ tạm lấy bản ngôn ngữ còn lại:
            </span>
            <span className="block max-h-48 overflow-y-auto rounded-md bg-muted/50 p-2 text-xs">
              {warnings.slice(0, 12).map((issue, index) => (
                <span key={index} className="block">
                  • {issue.lang ? `[${issue.lang.toUpperCase()}] ` : ""}
                  {issue.label}: {issue.message}
                </span>
              ))}
              {warnings.length > 12 && <span className="block">… và {warnings.length - 12} mục khác</span>}
            </span>
          </span>
        ),
        confirmLabel: "Vẫn lưu",
        cancelLabel: "Quay lại bổ sung",
        tone: "default",
      });
      if (!ok) {
        focusField(warnings[0].target);
        return;
      }
    }

    const title = editor.title?.trim() || editor.title_vi?.trim() || "";
    const description = editor.description?.trim() || editor.description_vi?.trim() || title;

    setSaving(true);
    const toastId = toast.loading("Đang lưu nội dung...");
    try {
      const blocks = fillBlockGaps(editor.contentBlocks_vi ?? [], editor.contentBlocks ?? []);
      const slug = editor.slug?.trim() || slugify(title);
      const payload: AdminContent = {
        ...editor,
        title,
        title_vi: editor.title_vi?.trim() || title,
        slug,
        description,
        description_vi: editor.description_vi?.trim() || description,
        image: editor.image || "/images/hero-skyline-bim.jpg",
        eyebrow: editor.eyebrow?.trim() || editor.eyebrow_vi?.trim() || "BIM4C Enterprise",
        highlights: Array.isArray(editor.highlights) ? editor.highlights : [],
        sections: Array.isArray(editor.sections) ? editor.sections : [],
        contentBlocks: blocks.en,
        contentBlocks_vi: blocks.vi,
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
        await saveChildren(editor.id);
        toast.success("Cập nhật nội dung thành công!", { id: toastId });
      } else {
        const res = await adminContentApi.create(contentType, payload);
        const newItem = (res?.data || payload) as AdminContent;
        setItems((prev) => [{ ...newItem, type: contentType }, ...prev]);
        if (newItem.id) await saveChildren(newItem.id);
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
        await adminContentApi.bulk(contentType, selected, "delete");
        toast.success(`Đã xóa ${selected.length} nội dung.`, { id: toastId });
      } else {
        const nextStatus: AdminContentStatus =
          action === "publish" ? (contentType === "Dự án" ? "PROFILED" : "PUBLISHED") : "ARCHIVED";
        setItems((prev) =>
          prev.map((x) =>
            selected.includes(x.id) ? { ...x, status: nextStatus } : x,
          ),
        );
        // Dedicated endpoint: a partial update through the editor serializer
        // would send empty title/slug/description and be rejected.
        await adminContentApi.bulk(contentType, selected, action);
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
  if (editor && check) {
    const isEdit = Boolean(editor.id);
    const previewUrl = editor.slug ? `${publicBase}/${editor.slug}` : "";
    const row = editor as unknown as Record<string, unknown>;
    const errorCount = check.errors.length;
    const warningCount = check.issues.length - errorCount;
    const textField = (spec: TextSpec, extra?: Partial<React.ComponentProps<typeof BilingualField>>) => (
      <BilingualField
        key={spec.id}
        id={spec.id}
        label={spec.label}
        required={spec.required}
        maxLength={spec.max}
        vi={row[spec.vi] as string | null | undefined}
        en={row[spec.en] as string | null | undefined}
        onChange={(lang, value) => updateText(spec, lang, value)}
        {...extra}
      />
    );

    return (
      <div className="fullscreen-crud-editor relative -mx-4 -mb-6 sm:-mx-6 sm:-mb-8 lg:-mx-8 lg:-mb-8 min-h-[calc(100vh-56px)] bg-slate-50/50 dark:bg-background text-foreground flex flex-col">
        {dialog}
        {/* Sticky Top Studio Action Bar */}
        <header className="sticky top-14 z-20 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card px-4 py-3 shadow-xs md:px-8">
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
                {editor.title_vi || editor.title || (isEdit ? "Chỉnh sửa nội dung" : `Tạo ${contentType} mới`)}
              </span>
              {dirty && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Chưa lưu
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => focusField("translation-checklist")}
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                errorCount
                  ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
                  : warningCount
                    ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
              )}
              title="Xem danh sách mục thiếu / sai"
            >
              {errorCount ? `${errorCount} lỗi` : warningCount ? `${warningCount} mục cần xem` : "Song ngữ đầy đủ"}
            </button>
            {previewUrl && isEdit && (
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

            <Button type="button" disabled={saving} onClick={() => void save()} className="gap-1.5">
              <Save className="size-3.5 text-slate-950" />
              <span>{saving ? "Đang lưu…" : isEdit ? "Cập nhật" : "Lưu"}</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 md:px-8 max-w-[1680px] mx-auto w-full">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] items-start">

            {/* MAIN COLUMN */}
            <div className="space-y-6 min-w-0">
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-slate-700 dark:text-foreground">
                <Globe className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="leading-relaxed">
                  Mỗi ô có 2 cột: <strong>🇻🇳 Tiếng Việt</strong> bên trái, <strong>🇬🇧 English</strong> bên phải. Ô viền vàng là
                  ô còn thiếu hoặc nghi chưa dịch; bấm <em>Chép từ VI/EN</em> để lấy bản kia làm nháp rồi dịch. Ảnh, đường dẫn
                  và các trường có nhãn <SharedBadge /> chỉ nhập một lần.
                </p>
              </div>

              {/* Core Content Details Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <FileText className="size-4 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Thông tin chính</h3>
                </div>
                <BilingualColumnsHeader />

                {textField(CORE_FIELDS[0], {
                  emphasis: true,
                  placeholderVi: "Ví dụ: Tư vấn Điều phối & Quản lý BIM",
                  placeholderEn: "e.g. BIM Coordination & Management Consulting",
                  hint: "Bắt buộc ít nhất 1 ngôn ngữ",
                })}

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="bf-slug" className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      Đường dẫn (slug URL) <SharedBadge />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSlugTouched(false);
                        update({ slug: slugify(editor.title?.trim() || editor.title_vi?.trim() || "") });
                      }}
                      className="text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
                    >
                      Tạo lại từ tiêu đề
                    </button>
                  </div>
                  <div className="flex items-center rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-background px-3 py-2 text-sm">
                    <span className="text-xs text-muted-foreground select-none font-mono">{publicBase}/</span>
                    <input
                      id="bf-slug"
                      value={editor.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        update({ slug: slugify(e.target.value) });
                      }}
                      className="flex-1 bg-transparent px-1 font-mono text-sm text-foreground outline-none"
                      placeholder="tu-dong-tao-tu-tieu-de"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {isEdit
                      ? "Đổi slug của bài đã đăng sẽ làm hỏng các liên kết cũ."
                      : "Tự tạo từ tiêu đề English (hoặc Tiếng Việt nếu chưa có) cho đến khi bạn sửa tay."}
                  </p>
                </div>

                {textField(CORE_FIELDS[1], {
                  multiline: true,
                  rows: 3,
                  placeholderVi: "Tóm tắt 1–2 câu, hiển thị trên thẻ danh sách...",
                  placeholderEn: "1–2 sentence summary shown on listing cards...",
                })}
                {textField(CORE_FIELDS[2], {
                  hint: "Dòng chữ nhỏ phía trên tiêu đề",
                  placeholderVi: "ĐÀO TẠO THỰC CHIẾN",
                  placeholderEn: "PRACTICAL BIM TRAINING",
                })}
                {textField(CORE_FIELDS[3], {
                  hint: "Thời lượng / ngày / quy mô",
                  placeholderVi: "8 tuần · Khai giảng 15/10",
                  placeholderEn: "8 weeks · Starts 15 Oct",
                })}
              </div>

              {/* DOMAIN-SPECIFIC FIELDS */}
              {contentType === "Dự án" && (
                <ProjectFields content={editor as unknown as Partial<AdminProjectContent>} onChange={update} />
              )}
              {contentType === "Khóa học" && (
                <CourseFields content={editor as unknown as Partial<AdminCourseContent>} onChange={update} />
              )}
              {(contentType === "Tin tức" || contentType === "Chuyên môn") && (
                <PostFields content={editor as unknown as Partial<AdminPostContent>} onChange={update} />
              )}
              {contentType === "Dịch vụ" && (
                <ServiceFields content={editor as unknown as Partial<AdminServiceContent>} onChange={update} />
              )}

              {/* STRUCTURED CONTENT BLOCKS */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Khối nội dung chi tiết</h3>
                  <p className="text-xs text-muted-foreground">
                    Văn bản, hình ảnh, trích dẫn, danh sách… Mỗi khối hiển thị bản Tiếng Việt và English cạnh nhau.
                  </p>
                </div>
                <ContentBlockEditor
                  valueVi={editor.contentBlocks_vi ?? []}
                  valueEn={editor.contentBlocks ?? []}
                  onChange={({ contentBlocks_vi, contentBlocks }) => update({ contentBlocks_vi, contentBlocks })}
                />
              </div>

              {/* SEO */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Search className="size-4 text-primary" /> SEO & chia sẻ mạng xã hội
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Không bắt buộc. Để trống thì Google dùng tiêu đề và mô tả tóm tắt ở trên.
                  </p>
                </div>
                <BilingualColumnsHeader />
                {textField(SEO_FIELDS[0], {
                  hint: "Nên dưới 60 ký tự",
                  placeholderVi: editor.title_vi || "",
                  placeholderEn: editor.title || "",
                })}
                {textField(SEO_FIELDS[1], {
                  multiline: true,
                  rows: 2,
                  hint: "Nên 120–160 ký tự",
                  placeholderVi: editor.description_vi || "",
                  placeholderEn: editor.description || "",
                })}

                <div className="grid gap-3 md:grid-cols-2">
                  {(["vi", "en"] as const).map((lang) => {
                    const t = (lang === "vi" ? editor.seoTitle_vi || editor.title_vi : editor.seoTitle || editor.title) || "";
                    const d =
                      (lang === "vi"
                        ? editor.seoDescription_vi || editor.description_vi
                        : editor.seoDescription || editor.description) || "";
                    return (
                      <div key={lang} className="rounded-lg border border-border bg-white p-3 dark:bg-background">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Xem trước Google · {lang === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
                        </p>
                        <p className="truncate text-[11px] text-emerald-700 dark:text-emerald-400">
                          {publicBase}/{editor.slug || "…"}
                        </p>
                        <p className={cn("truncate text-sm font-medium", t ? "text-blue-700 dark:text-blue-400" : "italic text-muted-foreground")}>
                          {t ? (t.length > 60 ? `${t.slice(0, 60)}…` : t) : "Chưa có tiêu đề"}
                        </p>
                        <p className={cn("line-clamp-2 text-xs", d ? "text-slate-600 dark:text-muted-foreground" : "italic text-muted-foreground")}>
                          {d ? (d.length > 160 ? `${d.slice(0, 160)}…` : d) : "Chưa có mô tả"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="bf-seoImage" className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      Ảnh khi chia sẻ (OG image) <SharedBadge />
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="bf-seoImage"
                        value={editor.seoImage ?? ""}
                        onChange={(e) => update({ seoImage: e.target.value })}
                        placeholder="Để trống = dùng ảnh đại diện"
                        className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background"
                      />
                      <MediaPicker label="Chọn" onSelect={(media) => update({ seoImage: media.url })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="bf-canonicalUrl" className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 dark:text-foreground">
                      Canonical URL <SharedBadge />
                    </label>
                    <input
                      id="bf-canonicalUrl"
                      value={editor.canonicalUrl ?? ""}
                      onChange={(e) => update({ canonicalUrl: e.target.value })}
                      placeholder="Chỉ điền khi bài đăng lại từ nguồn khác (https://...)"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6 xl:sticky xl:top-32">
              <div id="translation-checklist" className="rounded-xl transition">
                <TranslationChecklist issues={check.issues} progress={check.progress} />
              </div>

              {/* Publishing Control Card */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Save className="size-4 text-primary" />
                  <span>Trạng thái & Phân loại</span>
                </h3>

                <div className="space-y-1.5">
                  <label htmlFor="bf-status" className="text-[13px] font-medium text-slate-700 dark:text-foreground">Trạng thái xuất bản</label>
                  <select
                    id="bf-status"
                    value={editor.status}
                    onChange={(e) => update({ status: e.target.value as AdminContentStatus })}
                    className="w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground px-3 py-2"
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
                  <p className="text-[11px] text-muted-foreground">
                    {editor.status === "DRAFT"
                      ? "Bản nháp: chưa hiển thị trên website."
                      : editor.status === "ARCHIVED"
                        ? "Lưu trữ: đã ẩn khỏi website."
                        : "Đang hiển thị công khai trên website."}
                  </p>
                </div>

                {hasCategories && (
                  <div className="space-y-1.5">
                    <label htmlFor="bf-category" className="text-[13px] font-medium text-slate-700 dark:text-foreground">
                      Danh mục {contentType === "Dự án" && <span className="text-destructive">*</span>}
                    </label>
                    <select
                      id="bf-category"
                      value={"categoryId" in editor ? (editor.categoryId ?? "") : ""}
                      onChange={(e) => update({ categoryId: e.target.value || null })}
                      className={cn(
                        "w-full rounded-md border bg-white text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:bg-background dark:text-foreground px-3 py-2",
                        check.errors.some((issue) => issue.target === "bf-category") ? "border-red-400" : "border-slate-300 dark:border-border",
                      )}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        Chưa có danh mục nào — tạo ở phần Danh mục trên trang danh sách.
                      </p>
                    )}
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
              <div id="bf-image" className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ImageIcon className="size-4 text-primary" />
                    <span>Ảnh đại diện</span>
                    <SharedBadge />
                  </h3>
                  {editor.image && <MediaPicker label="Đổi ảnh" onSelect={(media) => update({ image: media.url })} />}
                </div>

                {editor.image ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted group">
                    <Image src={editor.image} alt="Thumbnail preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <MediaPicker label="Thay đổi ảnh" onSelect={(media) => update({ image: media.url })} />
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
                  <div className="rounded-xl border border-dashed border-amber-400 p-6 text-center space-y-3 bg-amber-50/30 dark:bg-amber-500/5">
                    <ImageIcon className="size-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">Chưa có ảnh đại diện — website sẽ dùng ảnh mặc định.</p>
                    <MediaPicker label="Tải ảnh lên / Chọn từ Thư viện" onSelect={(media) => update({ image: media.url })} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <LivePreviewModal content={editor} lang="vi" isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
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
            <SearchBox
              value={query}
              onChange={changeFilter(setQuery)}
              placeholder={`Tìm theo tiêu đề, slug ${contentType.toLowerCase()}...`}
            />
            <FilterSelect
              label="Lọc theo trạng thái"
              value={status}
              onChange={changeFilter(setStatus)}
              allLabel="Tất cả trạng thái"
              options={
                contentType === "Dự án"
                  ? [
                      { value: "draft", label: statusLabel("project", "DRAFT") },
                      { value: "published", label: "Đang hiển thị (mọi giai đoạn)" },
                      { value: "profiled", label: statusLabel("project", "PROFILED") },
                      { value: "planned", label: statusLabel("project", "PLANNED") },
                      { value: "in_progress", label: statusLabel("project", "IN_PROGRESS") },
                      { value: "completed", label: statusLabel("project", "COMPLETED") },
                      { value: "archived", label: statusLabel("project", "ARCHIVED") },
                    ]
                  : [
                      { value: "draft", label: statusLabel("content", "DRAFT") },
                      { value: "published", label: statusLabel("content", "PUBLISHED") },
                      { value: "archived", label: statusLabel("content", "ARCHIVED") },
                    ]
              }
            />
            {hasCategories && categories.length > 0 && (
              <FilterSelect
                label="Lọc theo danh mục"
                value={category}
                onChange={changeFilter(setCategory)}
                allLabel="Tất cả danh mục"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            )}
            {(query || status || category) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 shrink-0 text-xs"
                onClick={() => {
                  setQuery("");
                  setStatus("");
                  setCategory("");
                  setPage(1);
                }}
              >
                Xóa lọc
              </Button>
            )}
          </div>

          <Button
            onClick={() => { setSlugTouched(false); setEditor(createEmptyContent(contentType)); }}
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
                <SortableTh label="Nội dung" field="title" sort={sort} onSort={changeFilter(setSort)} />
                <th className="whitespace-nowrap px-4 py-2.5 font-medium">{hasCategories ? "Danh mục" : "Loại"}</th>
                <SortableTh label="Trạng thái" field="status" sort={sort} onSort={changeFilter(setSort)} />
                <SortableTh label="Xuất bản" field="publishedAt" sort={sort} onSort={changeFilter(setSort)} firstDir="desc" />
                <SortableTh label="Cập nhật" field="updatedAt" sort={sort} onSort={changeFilter(setSort)} firstDir="desc" />
                <th className="w-24 whitespace-nowrap px-4 py-2.5 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-12">
                    <LoadingState label="Đang tải nội dung…" />
                  </td>
                </tr>
              )}
              {!loading && items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      aria-label={`Chọn ${item.title_vi || item.title}`}
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
                          {/* The admin works in Vietnamese: show that title, English as fallback. */}
                          {item.title_vi || item.title}
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
                    <span className="rounded-md bg-muted px-2.5 py-1 font-medium">
                      {hasCategories
                        ? ("category" in item && item.category?.name) || "Chưa phân loại"
                        : item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    <StatusBadge domain={contentType === "Dự án" ? "project" : "content"} value={item.status} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {formatDateTime(item.publishedAt, false)}
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
                        aria-label={`Sửa ${item.title_vi || item.title}`}
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
                        aria-label={`Xóa ${item.title_vi || item.title}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="size-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">Chưa có {contentType.toLowerCase()} nào phù hợp.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSlugTouched(false); setEditor(createEmptyContent(contentType)); }}
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

        <ListFooter
          page={page}
          pages={totalPages}
          total={total}
          pageSize={pageSize}
          itemLabel={contentType.toLowerCase()}
          onPage={(next) => {
            setPage(next);
            setSelected([]);
            scrollToPageTop();
          }}
          onPageSize={changeFilter(setPageSize)}
        />
      </section>

      {(contentType === "Dự án" || contentType === "Tin tức") && (
        <div className="mt-8">
          <CategoryManager
            type={contentType}
            onChange={() => {
              void load();
              void loadCategories();
            }}
          />
        </div>
      )}
    </>
  );
}
