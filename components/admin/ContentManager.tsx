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
import { Sparkles, Eye, Wand2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  contentBlocksSchema,
  isSafeMediaReference,
  type ContentBlock,
} from "@/features/shared/schemas/content-block.schema";

const statusLabels: Record<AdminContentStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
  PLANNED: "Đã xuất bản",
  IN_PROGRESS: "Đã xuất bản",
  COMPLETED: "Đã xuất bản",
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
  const [adminLangTab, setAdminLangTab] = useState<"en" | "vi">("en");
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
  const [aiBusy, setAiBusy] = useState(false);
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
    if (dirty && !window.confirm("Có thay đổi chưa lưu. Bạn có muốn thoát?"))
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
    if (!editor.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề tiếng Anh (Title).");
      return;
    }
    if (!editor.description.trim()) {
      toast.error("Vui lòng nhập mô tả tiếng Anh (Description).");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Đang lưu nội dung...");
    try {
      if (editor.contentBlocks) {
        contentBlocksSchema.parse(editor.contentBlocks);
      }
      if (editor.id) {
        await adminContentApi.update(contentType, editor.id, editor);
        toast.success("Cập nhật nội dung thành công!", { id: toastId });
      } else {
        await adminContentApi.create(contentType, editor);
        toast.success("Tạo mới nội dung thành công!", { id: toastId });
      }
      setDirty(false);
      setEditor(null);
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
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa.", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAiTranslate() {
    if (!editor) return;
    setAiBusy(true);
    const toastId = toast.loading("Trợ lý AI đang dịch thuật nội dung...");
    try {
      const isTranslatingToVi = adminLangTab === "en";
      const sourceText = isTranslatingToVi
        ? [editor.title, editor.description, editor.eyebrow, editor.highlights?.join("\n")].filter(Boolean).join("\n---\n")
        : [editor.title_vi, editor.description_vi, editor.eyebrow_vi, editor.highlights_vi?.join("\n")].filter(Boolean).join("\n---\n");

      if (!sourceText.trim()) {
        toast.error("Vui lòng nhập tiêu đề hoặc mô tả trước khi dịch AI.", { id: toastId });
        return;
      }

      const res = await fetch("/api/admin/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          targetLang: isTranslatingToVi ? "vi" : "en",
          context: `BIM4C Enterprise ${contentType}`,
        }),
      });

      const resData = await res.json().catch(() => null);
      if (!res.ok) throw new Error(resData?.message || "Lỗi dịch AI");

      const translated = resData?.data?.translatedText || "";
      const parts = translated.split("\n---\n").map((p: string) => p.trim());

      if (isTranslatingToVi) {
        update({
          title_vi: parts[0] || editor.title,
          description_vi: parts[1] || editor.description,
          eyebrow_vi: parts[2] || editor.eyebrow,
          highlights_vi: parts[3] ? parts[3].split("\n").filter(Boolean) : editor.highlights_vi,
        });
        setAdminLangTab("vi");
        toast.success("✨ Đã dịch sang Tiếng Việt thành công!", { id: toastId });
      } else {
        update({
          title: parts[0] || editor.title_vi || "",
          description: parts[1] || editor.description_vi || "",
          eyebrow: parts[2] || editor.eyebrow_vi || "",
          highlights: parts[3] ? parts[3].split("\n").filter(Boolean) : editor.highlights,
        });
        setAdminLangTab("en");
        toast.success("✨ Đã dịch sang Tiếng Anh thành công!", { id: toastId });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi dịch AI", { id: toastId });
    } finally {
      setAiBusy(false);
    }
  }

  async function handleAiSeo() {
    if (!editor) return;
    setAiBusy(true);
    const toastId = toast.loading("AI đang phân tích và tối ưu SEO metadata...");
    try {
      const activeTitle = adminLangTab === "vi" ? (editor.title_vi || editor.title) : editor.title;
      const activeDesc = adminLangTab === "vi" ? (editor.description_vi || editor.description) : editor.description;

      const res = await fetch("/api/admin/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeTitle,
          description: activeDesc,
          lang: adminLangTab,
        }),
      });

      const resData = await res.json().catch(() => null);
      if (!res.ok) throw new Error(resData?.message || "Lỗi tạo SEO AI");

      const seoData = resData?.data;
      if (seoData) {
        if (adminLangTab === "vi") {
          update({
            seoTitle_vi: seoData.seoTitle,
            seoDescription_vi: seoData.seoDescription,
          });
        } else {
          update({
            seoTitle: seoData.seoTitle,
            seoDescription: seoData.seoDescription,
          });
        }
        toast.success("✨ Đã tự động điền SEO Title & Description tối ưu!", { id: toastId });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tạo SEO AI", { id: toastId });
    } finally {
      setAiBusy(false);
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
    if (!editor?.id) return;
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

  async function addCurriculum() {
    if (!editor?.id || !newCurriculum.title.trim()) return;
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
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Không thể thêm phần học");
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
      setFeedback(
        error instanceof Error ? error.message : "Không thể cập nhật phần học",
      );
    }
  }

  async function moveCurriculum(index: number, direction: -1 | 1) {
    if (!editor?.id || !editor.curriculum) return;
    const target = index + direction;
    if (target < 0 || target >= editor.curriculum.length) return;
    const next = [...editor.curriculum];
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((item, order) => {
      item.sortOrder = order;
    });
    update({ curriculum: next });
    await Promise.all([
      adminContentApi.updateCourseSection(editor.id, next[index].id, {
        sortOrder: index,
      }),
      adminContentApi.updateCourseSection(editor.id, next[target].id, {
        sortOrder: target,
      }),
    ]);
  }

  async function moveProjectImage(index: number, direction: -1 | 1) {
    if (!editor?.id || !editor.images) return;
    const target = index + direction;
    if (target < 0 || target >= editor.images.length) return;
    const next = [...editor.images];
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((item, order) => {
      item.sortOrder = order;
    });
    update({ images: next });
    await Promise.all([
      adminContentApi.updateProjectImage(editor.id, next[index].id, {
        sortOrder: index,
      }),
      adminContentApi.updateProjectImage(editor.id, next[target].id, {
        sortOrder: target,
      }),
    ]);
  }

  const allSelected = useMemo(
    () => items.length > 0 && items.every((x) => selected.includes(x.id)),
    [items, selected],
  );

  return (
    <>
      <section className="overflow-hidden rounded-md border border-border bg-background shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 [&_label]:flex [&_label]:h-10 [&_label]:min-w-52 [&_label]:flex-1 [&_label]:items-center [&_label]:gap-2 [&_label]:border [&_label]:border-border [&_label]:px-3 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:outline-none [&_select]:h-10 [&_select]:border [&_select]:border-border [&_select]:px-3 [&>button]:min-h-10 [&>button]:bg-primary [&>button]:px-4 [&>button]:text-white">
          <label>
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={`Tìm ${contentType.toLowerCase()}...`}
            />
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <button onClick={() => setEditor(empty(contentType))}>
            ＋ Tạo mới
          </button>
        </div>
        {feedback && (
          <div className="mx-4 mt-3 flex justify-between bg-primary/10 px-3 py-2.5 text-xs text-primary">
            {feedback}
            <button
              onClick={() => setFeedback("")}
              aria-label="Đóng thông báo"
            >
              ×
            </button>
          </div>
        )}
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-foreground px-4 py-3 text-xs text-white [&_button]:rounded [&_button]:bg-background/10 [&_button]:px-3 [&_button]:py-2">
            <span>
              Đã chọn <b>{selected.length}</b> nội dung
            </span>
            <button disabled={saving} onClick={() => void bulk("publish")}>
              Xuất bản
            </button>
            <button disabled={saving} onClick={() => void bulk("archive")}>
              Lưu trữ
            </button>
            <button disabled={saving} onClick={() => void bulk("delete")}>
              Xóa
            </button>
            <button onClick={() => setSelected([])}>Bỏ chọn</button>
          </div>
        )}
        <div className="w-full overflow-x-auto [&_table]:min-w-full [&_table]:border-collapse [&_th]:h-10 [&_th]:border-b [&_th]:border-border [&_th]:bg-muted [&_th]:px-4 [&_th]:text-left [&_th]:text-xs [&_td]:h-16 [&_td]:border-b [&_td]:border-border [&_td]:px-4 [&_td]:text-sm [&_td]:text-muted-foreground [&_td_img]:h-[38px] [&_td_img]:w-[54px] [&_td_img]:object-cover">
          <table className="min-w-[760px]">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả"
                    checked={allSelected}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? items.map((x) => x.id) : [],
                      )
                    }
                  />
                </th>
                <th>NỘI DUNG</th>
                <th>LOẠI</th>
                <th>TRẠNG THÁI</th>
                <th>CẬP NHẬT</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
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
                    />
                  </td>
                  <td>
                    <Image src={item.image} alt="" width={64} height={46} />
                    <span>
                      <strong>{item.title}</strong>
                      <small>
                        /{item.slug} · {item.sections.length} khối
                      </small>
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {contentType}
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {statusLabels[item.status]}
                    </span>
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("vi-VN").format(
                      new Date(item.updatedAt),
                    )}
                  </td>
                  <td>
                    <div className="flex min-w-[104px] gap-2 [&_button]:min-h-[44px] [&_button]:min-w-[44px] [&_button]:rounded-lg [&_button]:border [&_button]:border-border [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:transition-colors [&_button]:hover:bg-muted [&_button]:active:scale-95">
                      <button
                        onClick={() => {
                          const value = structuredClone(item);
                          const blocks: ContentBlock[] = value.contentBlocks
                            ?.length
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
                        aria-label={`Sửa ${item.title}`}
                        className="text-base font-medium text-foreground hover:text-primary"
                      >
                        ✎
                      </button>
                      <button
                        disabled={saving}
                        onClick={() => void remove(item.id)}
                        aria-label={`Xóa ${item.title}`}
                        className="text-lg font-bold text-destructive hover:bg-destructive/10"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Chưa có nội dung phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-xs text-muted-foreground">
          <span>
            Trang {page} / {totalPages}
          </span>
          <div className="flex gap-2 [&_button]:min-h-[44px] [&_button]:min-w-[44px] [&_button]:rounded-lg [&_button]:border [&_button]:border-border [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:font-bold [&_button]:transition-colors [&_button]:hover:bg-muted [&_button]:disabled:opacity-40">
            <button
              disabled={page <= 1}
              onClick={() => {
                setPage((x) => Math.max(1, x - 1));
                scrollToPageTop();
              }}
              aria-label="Trang trước"
            >
              ←
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => {
                setPage((x) => x + 1);
                scrollToPageTop();
              }}
              aria-label="Trang sau"
            >
              →
            </button>
          </div>
          <span>Nội dung đã lưu</span>
        </footer>
      </section>

      {(contentType === "Dự án" || contentType === "Tin tức") && (
        <CategoryManager type={contentType} onChange={() => void load()} />
      )}

      {editor && (
        <>
          <button
            className="fixed inset-0 z-50 bg-foreground/45"
            onClick={() => !saving && closeEditor()}
            aria-label="Đóng"
          />
          <aside className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-[780px] flex-col bg-background shadow-2xl [&>header]:flex [&>header]:items-center [&>header]:justify-between [&>header]:border-b [&>header]:border-border [&>header]:p-5 [&>footer]:mt-auto [&>footer]:flex [&>footer]:justify-end [&>footer]:gap-2 [&>footer]:border-t [&>footer]:border-border [&>footer]:p-4">
            <header className="flex items-center justify-between border-b border-border p-5 bg-card">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {editor.id ? "CHỈNH SỬA NỘI DUNG" : "TẠO NỘI DUNG MỚI"}
                </p>
                <h2 className="text-lg font-bold text-foreground">{editor.title || "Nội dung chưa đặt tên"}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen(true)}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Eye className="size-3.5 text-teal-500" /> Live Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={aiBusy}
                  onClick={handleAiTranslate}
                  className="gap-1.5 text-xs font-semibold border-primary/30 hover:bg-primary/5 text-primary"
                >
                  <Sparkles className="size-3.5 text-primary" /> {adminLangTab === "en" ? "AI Dịch sang VI" : "AI Dịch sang EN"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={aiBusy}
                  onClick={handleAiSeo}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Wand2 className="size-3.5 text-amber-500" /> Gợi ý SEO
                </Button>
                <button onClick={closeEditor} aria-label="Đóng trình soạn thảo" className="size-8 rounded-lg text-lg text-muted-foreground hover:bg-muted">
                  ×
                </button>
              </div>
            </header>
            <div className="grid flex-1 gap-4 overflow-y-auto p-5 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-sm [&_input]:min-h-10 [&_input]:border [&_input]:border-border [&_input]:px-3 [&_select]:min-h-10 [&_select]:border [&_select]:border-border [&_select]:px-3 [&_textarea]:border [&_textarea]:border-border [&_textarea]:p-3">
              <BilingualFormTabs
                activeTab={adminLangTab}
                onTabChange={setAdminLangTab}
                hasViTranslation={Boolean(
                  editor.title_vi || editor.description_vi,
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  Trạng thái
                  <select
                    value={editor.status}
                    onChange={(e) =>
                      update({ status: e.target.value as AdminContentStatus })
                    }
                  >
                    <option value="DRAFT">Bản nháp</option>
                    <option
                      value={contentType === "Dự án" ? "PLANNED" : "PUBLISHED"}
                    >
                      Đã xuất bản
                    </option>
                    <option value="ARCHIVED">Đã lưu trữ</option>
                  </select>
                </label>
                <label>
                  Thứ tự
                  <input
                    type="number"
                    min="0"
                    value={editor.sortOrder}
                    onChange={(e) =>
                      update({ sortOrder: Number(e.target.value) })
                    }
                  />
                </label>
              </div>

              {adminLangTab === "en" ? (
                <>
                  <label>
                    Tiêu đề (English - Bắt buộc) <em>*</em>
                    <input
                      autoFocus
                      placeholder="e.g. BIM Consulting for High-Rise"
                      value={editor.title}
                      onChange={(e) =>
                        update({
                          title: e.target.value,
                          slug: editor.id
                            ? editor.slug
                            : slugify(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Mô tả (English - Bắt buộc) <em>*</em>
                    <textarea
                      rows={3}
                      placeholder="Short English summary..."
                      value={editor.description}
                      onChange={(e) =>
                        update({ description: e.target.value })
                      }
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label>
                      Nhãn nội dung (English) <em>*</em>
                      <input
                        placeholder="e.g. BIM4C SOLUTION"
                        value={editor.eyebrow}
                        onChange={(e) => update({ eyebrow: e.target.value })}
                      />
                    </label>
                    <label>
                      Thông tin phụ
                      <input
                        value={editor.meta ?? ""}
                        onChange={(e) => update({ meta: e.target.value })}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <label>
                    Tiêu đề (Tiếng Việt - Bản dịch)
                    <input
                      autoFocus
                      placeholder="Ví dụ: Tư vấn BIM cho công trình cao tầng"
                      value={editor.title_vi ?? ""}
                      onChange={(e) => update({ title_vi: e.target.value })}
                    />
                  </label>
                  <label>
                    Mô tả (Tiếng Việt - Bản dịch)
                    <textarea
                      rows={3}
                      placeholder="Tóm tắt ngắn gọn bằng Tiếng Việt..."
                      value={editor.description_vi ?? ""}
                      onChange={(e) =>
                        update({ description_vi: e.target.value })
                      }
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label>
                      Nhãn nội dung (Tiếng Việt)
                      <input
                        placeholder="Ví dụ: DỊCH VỤ BIM4C"
                        value={editor.eyebrow_vi ?? ""}
                        onChange={(e) => update({ eyebrow_vi: e.target.value })}
                      />
                    </label>
                    <label>
                      Thông tin phụ
                      <input
                        value={editor.meta ?? ""}
                        onChange={(e) => update({ meta: e.target.value })}
                      />
                    </label>
                  </div>
                </>
              )}

              <label>
                Đường dẫn (Slug URL)
                <input
                  value={editor.slug}
                  onChange={(e) => update({ slug: slugify(e.target.value) })}
                />
              </label>

              <label>
                Ảnh đại diện
                <input
                  value={editor.image}
                  onChange={(e) => update({ image: e.target.value })}
                />
              </label>
              <MediaPicker
                label="Chọn ảnh đại diện từ Media"
                onSelect={(media) => update({ image: media.url })}
              />

              {(contentType === "Dự án" || contentType === "Tin tức") && (
                <label>
                  Danh mục
                  <select
                    value={editor.categoryId ?? ""}
                    onChange={(e) =>
                      update({ categoryId: e.target.value || null })
                    }
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {contentType === "Dự án" && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label>
                      Địa điểm
                      <input
                        value={adminLangTab === "en" ? editor.location ?? "" : editor.location_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { location: e.target.value } : { location_vi: e.target.value })}
                      />
                    </label>
                    <label>
                      Năm
                      <input
                        type="number"
                        value={editor.year ?? ""}
                        onChange={(e) =>
                          update({ year: Number(e.target.value) })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Chủ đầu tư
                    <textarea
                      rows={2}
                      value={adminLangTab === "en" ? editor.investor ?? "" : editor.investor_vi ?? ""}
                      onChange={(e) => update(adminLangTab === "en" ? { investor: e.target.value } : { investor_vi: e.target.value })}
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label>
                      Dự kiến hoàn thành
                      <input
                        value={adminLangTab === "en" ? editor.expectedCompletion ?? "" : editor.expectedCompletion_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { expectedCompletion: e.target.value } : { expectedCompletion_vi: e.target.value })}
                      />
                    </label>
                    <label>
                      Gói thầu
                      <input
                        value={adminLangTab === "en" ? editor.contractPackage ?? "" : editor.contractPackage_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { contractPackage: e.target.value } : { contractPackage_vi: e.target.value })}
                      />
                    </label>
                  </div>
                  <label>
                    Quy mô
                    <textarea
                      rows={3}
                    value={adminLangTab === "en" ? editor.scale ?? "" : editor.scale_vi ?? ""}
                    onChange={(e) => update(adminLangTab === "en" ? { scale: e.target.value } : { scale_vi: e.target.value })}
                    />
                  </label>
                </>
              )}

              {contentType === "Tin tức" && (
                <label>
                  Tác giả
                  <input
                    value={editor.authorName ?? ""}
                    onChange={(e) => update({ authorName: e.target.value })}
                  />
                </label>
              )}

              {contentType === "Khóa học" && (
                <section className="grid gap-4 border-t pt-5">
                  <h3 className="font-semibold">Thông tin khóa học</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      Thời lượng
                      <input
                        value={adminLangTab === "en" ? editor.duration ?? "" : editor.duration_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { duration: e.target.value } : { duration_vi: e.target.value })}
                      />
                    </label>
                    <label>
                      Cấp độ
                      <input
                        value={adminLangTab === "en" ? editor.level ?? "" : editor.level_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { level: e.target.value } : { level_vi: e.target.value })}
                      />
                    </label>
                    <label>
                      Học phí
                      <input
                        value={adminLangTab === "en" ? editor.price ?? "" : editor.price_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { price: e.target.value } : { price_vi: e.target.value })}
                      />
                    </label>
                    <label>
                      Giảng viên
                      <input
                        value={adminLangTab === "en" ? editor.instructor ?? "" : editor.instructor_vi ?? ""}
                        onChange={(e) => update(adminLangTab === "en" ? { instructor: e.target.value } : { instructor_vi: e.target.value })}
                      />
                    </label>
                  </div>
                  <label>
                    Kết quả học tập (mỗi dòng một mục)
                    <textarea
                      rows={4}
                      value={((adminLangTab === "en" ? editor.learningOutcomes : editor.learningOutcomes_vi) ?? []).join("\n")}
                      onChange={(e) =>
                        update(adminLangTab === "en"
                          ? { learningOutcomes: e.target.value.split("\n").filter(Boolean) }
                          : { learningOutcomes_vi: e.target.value.split("\n").filter(Boolean) })
                      }
                    />
                  </label>
                </section>
              )}

              {adminLangTab === "en" ? (
                <label>
                  Điểm nổi bật (English - mỗi dòng một mục)
                  <textarea
                    rows={4}
                    placeholder="e.g. BIM Execution Plan&#10;Common Data Environment&#10;Model Quality Assurance"
                    value={editor.highlights.join("\n")}
                    onChange={(e) =>
                      update({
                        highlights: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                  />
                </label>
              ) : (
                <label>
                  Điểm nổi bật (Tiếng Việt - mỗi dòng một mục)
                  <textarea
                    rows={4}
                    placeholder="Ví dụ: Kế hoạch triển khai BIM&#10;Môi trường dữ liệu chung&#10;Đảm bảo chất lượng mô hình"
                    value={(editor.highlights_vi ?? []).join("\n")}
                    onChange={(e) =>
                      update({
                        highlights_vi: e.target.value
                          .split("\n")
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
              )}

              {contentType === "Dự án" && (
                <div>
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-[18px] text-sm font-semibold [&_button]:border [&_button]:border-border [&_button]:px-2 [&_button]:py-1.5">
                    <span>
                      Gallery dự án ({editor.images?.length ?? 0})
                    </span>
                    <MediaPicker
                      label="Thêm ảnh từ Media"
                      onSelect={(media) => void addProjectImage(media)}
                    />
                  </div>
                  {editor.images?.map((image, index) => (
                    <div
                      className="grid grid-cols-[1fr_auto] gap-3 border border-border p-3"
                      key={image.id}
                    >
                      <div className="grid gap-2">
                        <input
                          aria-label={`Alt ảnh ${index + 1}`}
                          value={image.alt}
                          onChange={(event) =>
                            update({
                              images: editor.images?.map((item) =>
                                item.id === image.id
                                  ? { ...item, alt: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          onBlur={() =>
                            void adminContentApi.updateProjectImage(
                              editor.id,
                              image.id,
                              { alt: image.alt },
                            )
                          }
                        />
                        <input
                          aria-label={`Chú thích ảnh ${index + 1}`}
                          value={image.caption ?? ""}
                          placeholder="Chú thích (không bắt buộc)"
                          onChange={(event) =>
                            update({
                              images: editor.images?.map((item) =>
                                item.id === image.id
                                  ? { ...item, caption: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          onBlur={() =>
                            void adminContentApi.updateProjectImage(
                              editor.id,
                              image.id,
                              { caption: image.caption ?? null },
                            )
                          }
                        />
                        <small className="break-all">{image.url}</small>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => void moveProjectImage(index, -1)}
                          aria-label={`Đưa ảnh ${index + 1} lên`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={
                            index === (editor.images?.length ?? 0) - 1
                          }
                          onClick={() => void moveProjectImage(index, 1)}
                          aria-label={`Đưa ảnh ${index + 1} xuống`}
                        >
                          ↓
                        </button>
                        <button
                          aria-label={`Xóa ảnh ${image.alt}`}
                          onClick={async () => {
                            await adminContentApi.deleteProjectImage(
                              editor.id,
                              image.id,
                            );
                            update({
                              images: editor.images?.filter(
                                (x) => x.id !== image.id,
                              ),
                            });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {contentType === "Khóa học" && (
                <div>
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-[18px] text-sm font-semibold [&_button]:border [&_button]:border-border [&_button]:px-2 [&_button]:py-1.5">
                    <span>
                      Chương trình học ({editor.curriculum?.length ?? 0})
                    </span>
                    <span />
                  </div>
                  <div className="grid gap-3 border p-3 sm:grid-cols-2">
                    <label>
                      Tên phần học
                      <input
                        value={newCurriculum.title}
                        onChange={(e) =>
                          setNewCurriculum((value) => ({
                            ...value,
                            title: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      Nội dung
                      <input
                        value={newCurriculum.description}
                        onChange={(e) =>
                          setNewCurriculum((value) => ({
                            ...value,
                            description: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <button
                      className="min-h-10 bg-primary px-4 text-sm font-semibold text-white sm:col-span-2"
                      type="button"
                      onClick={() => void addCurriculum()}
                    >
                      ＋ Thêm phần học
                    </button>
                  </div>
                  {editor.curriculum?.map((section, index) => (
                    <div
                      className="grid grid-cols-[1fr_auto] gap-3 border border-border p-3"
                      key={section.id}
                    >
                      <div className="grid gap-2">
                        <input
                          aria-label={`Tên phần học ${index + 1}`}
                          value={section.title}
                          onChange={(event) =>
                            update({
                              curriculum: editor.curriculum?.map((item) =>
                                item.id === section.id
                                  ? { ...item, title: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          onBlur={() =>
                            void saveCurriculumSection(section.id, {
                              title: section.title,
                            })
                          }
                        />
                        <textarea
                          aria-label={`Nội dung phần học ${index + 1}`}
                          rows={2}
                          value={section.description}
                          onChange={(event) =>
                            update({
                              curriculum: editor.curriculum?.map((item) =>
                                item.id === section.id
                                  ? { ...item, description: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          onBlur={() =>
                            void saveCurriculumSection(section.id, {
                              description: section.description,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => void moveCurriculum(index, -1)}
                          aria-label={`Đưa phần ${section.title} lên`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={
                            index === (editor.curriculum?.length ?? 0) - 1
                          }
                          onClick={() => void moveCurriculum(index, 1)}
                          aria-label={`Đưa phần ${section.title} xuống`}
                        >
                          ↓
                        </button>
                        <button
                          aria-label={`Xóa phần ${section.title}`}
                          onClick={async () => {
                            await adminContentApi.deleteCourseSection(
                              editor.id,
                              section.id,
                            );
                            update({
                              curriculum: editor.curriculum?.filter(
                                (x) => x.id !== section.id,
                              ),
                            });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

              <fieldset className="grid gap-2 border-t pt-5">
                <legend className="mb-2 font-semibold">
                  Nội dung liên quan
                </legend>
                {items.filter((item) => item.id !== editor.id).length ? (
                  items
                    .filter((item) => item.id !== editor.id)
                    .map((item) => (
                      <label
                        className="flex items-center gap-3 rounded border p-3"
                        key={item.id}
                      >
                        <input
                          type="checkbox"
                          checked={(editor.relatedIds ?? []).includes(item.id)}
                          onChange={(event) =>
                            update({
                              relatedIds: event.target.checked
                                ? [...(editor.relatedIds ?? []), item.id]
                                : (editor.relatedIds ?? []).filter(
                                    (id) => id !== item.id,
                                  ),
                            })
                          }
                        />
                        <span>{item.title}</span>
                      </label>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có nội dung khác để liên kết.
                  </p>
                )}
              </fieldset>

              <section className="grid gap-4 border-t pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Cấu hình SEO</h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    Đang sửa SEO cho:{" "}
                    <b>
                      {adminLangTab === "en"
                        ? "🇬🇧 English"
                        : "🇻🇳 Tiếng Việt"}
                    </b>
                  </span>
                </div>
                {adminLangTab === "en" ? (
                  <>
                    <label>
                      SEO Title (English)
                      <input
                        placeholder="Meta title in English..."
                        value={editor.seoTitle ?? ""}
                        onChange={(e) => update({ seoTitle: e.target.value })}
                      />
                    </label>
                    <label>
                      SEO Description (English)
                      <textarea
                        rows={3}
                        placeholder="Meta description in English..."
                        value={editor.seoDescription ?? ""}
                        onChange={(e) =>
                          update({ seoDescription: e.target.value })
                        }
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      SEO Title (Tiếng Việt)
                      <input
                        placeholder="Tiêu đề SEO bằng Tiếng Việt..."
                        value={editor.seoTitle_vi ?? ""}
                        onChange={(e) =>
                          update({ seoTitle_vi: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      SEO Description (Tiếng Việt)
                      <textarea
                        rows={3}
                        placeholder="Mô tả SEO bằng Tiếng Việt..."
                        value={editor.seoDescription_vi ?? ""}
                        onChange={(e) =>
                          update({ seoDescription_vi: e.target.value })
                        }
                      />
                    </label>
                  </>
                )}
                <label>
                  Canonical URL
                  <input
                    value={editor.canonicalUrl ?? ""}
                    onChange={(e) =>
                      update({ canonicalUrl: e.target.value })
                    }
                  />
                </label>
                <label>
                  Ảnh SEO
                  <input
                    value={editor.seoImage ?? ""}
                    onChange={(e) => update({ seoImage: e.target.value })}
                  />
                </label>
                <MediaPicker
                  label="Chọn ảnh SEO từ Media"
                  onSelect={(media) => update({ seoImage: media.url })}
                />
              </section>
            </div>
            <footer>
              {editor.id && editor.slug && (
                <Link
                  className="mr-auto inline-flex min-h-[42px] items-center px-3 text-sm font-semibold text-primary"
                  href={`${publicBase}/${editor.slug}`}
                  target="_blank"
                >
                  Xem trang public
                </Link>
              )}
              <button disabled={saving} onClick={closeEditor}>
                Hủy
              </button>
              <button
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white hover:bg-primary disabled:opacity-50"
                disabled={saving}
                onClick={() => void save()}
              >
                {saving ? "Đang lưu…" : "Lưu nội dung"}
              </button>
            </footer>
          </aside>
          {editor && (
            <LivePreviewModal
              content={editor}
              lang={adminLangTab}
              isOpen={previewOpen}
              onClose={() => setPreviewOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
}
