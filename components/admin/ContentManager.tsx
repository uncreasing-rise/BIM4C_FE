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
import { contentBlocksSchema, isSafeMediaReference, type ContentBlock } from "@/features/shared/schemas/content-block.schema";

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
});

export function ContentManager({
  contentType,
}: {
  contentType: AdminContentType;
}) {
  const params = useSearchParams();
  const router = useRouter();
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
  const [newCurriculum, setNewCurriculum] = useState({ title: "", description: "" });
  const publicBase = contentType === "Dịch vụ" ? "/dich-vu" : contentType === "Dự án" ? "/du-an" : contentType === "Khóa học" ? "/khoa-hoc" : "/blog";

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setFeedback("");
    try {
      const [result, categoryResult] = await Promise.all([
        adminContentApi.list(contentType, {
          page,
          limit: 20,
          search: query,
          status,
          sortBy: "updatedAt",
          sortOrder: "desc",
        }, signal),
        adminContentApi.categories(contentType, signal),
      ]);
      if (signal?.aborted) return;
      setItems(result.data.map((x) => ({ ...x, type: contentType })));
      setTotalPages(result.meta.totalPages || 1);
      setCategories(categoryResult.data);
    } catch (error) {
      if (signal?.aborted) return;
      setFeedback(
        error instanceof Error ? error.message : "Không thể tải dữ liệu",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [contentType, page, query, status]);
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
    router.replace(`?${q}`, { scroll: false });
  }, [page, query, status, router]);

  const update = (patch: Partial<AdminContent>) => {
    setDirty(true);
    setEditor((current) => (current ? { ...current, ...patch } : null));
  };
  const closeEditor = () => {
    if (dirty && !window.confirm("Bạn có thay đổi chưa lưu. Vẫn đóng trình soạn thảo?")) return;
    setDirty(false);
    setEditor(null);
  };
  const payload = (value: AdminContent) => {
    const common = {
      slug: value.slug || slugify(value.title),
      title: value.title,
      description: value.description,
      image: value.image,
      eyebrow: value.eyebrow,
      meta: value.meta || null,
      highlights: value.highlights,
      sections: [],
      contentBlocks: value.contentBlocks ?? [],
      seoTitle: value.seoTitle || null,
      seoDescription: value.seoDescription || null,
      seoImage: value.seoImage || null,
      canonicalUrl: value.canonicalUrl || null,
      relatedIds: value.relatedIds ?? [],
      status: value.status,
      sortOrder: value.sortOrder,
      publishedAt:
        value.status === "PUBLISHED" ||
        ["PLANNED", "IN_PROGRESS", "COMPLETED"].includes(value.status)
          ? (value.publishedAt ?? new Date().toISOString())
          : null,
    };
    if (contentType === "Dự án")
      return {
        ...common,
        status: value.status === "PUBLISHED" ? "PLANNED" : value.status,
        categoryId: value.categoryId,
        location: value.location,
        year: value.year,
        investor: value.investor || null,
        expectedCompletion: value.expectedCompletion || null,
        scale: value.scale || null,
        contractPackage: value.contractPackage || null,
        isFeatured: value.isFeatured,
      };
    if (contentType === "Tin tức")
      return {
        ...common,
        categoryId: value.categoryId || null,
        authorName: value.authorName || null,
      };
    if (contentType === "Khóa học")
      return { ...common, duration: value.duration || null, level: value.level || null, price: value.price || null, instructor: value.instructor || null, learningOutcomes: value.learningOutcomes ?? [] };
    return common;
  };
  async function save() {
    if (!editor || saving) return;
    if (
      !editor.title.trim() ||
      !editor.description.trim() ||
      !editor.eyebrow.trim() ||
      !editor.image.trim()
    )
      return setFeedback("Tiêu đề, mô tả, nhãn nội dung và ảnh cover là bắt buộc.");
    if (
      contentType === "Dự án" &&
      (!editor.categoryId || !editor.location || !editor.year)
    )
      return setFeedback("Dự án cần danh mục, địa điểm và năm.");
    const blockValidation = contentBlocksSchema.safeParse(editor.contentBlocks ?? []);
    if (!blockValidation.success)
      return setFeedback(`Nội dung chi tiết chưa hợp lệ: ${blockValidation.error.issues[0]?.message ?? "Kiểm tra lại các khối"}`);
    if (!isSafeMediaReference(editor.image) || (editor.seoImage && !isSafeMediaReference(editor.seoImage)) || (editor.canonicalUrl && !isSafeMediaReference(editor.canonicalUrl)))
      return setFeedback("Cover, ảnh SEO và canonical phải là HTTPS hoặc đường dẫn nội bộ an toàn.");
    setSaving(true);
    setFeedback("");
    try {
      if (editor.id)
        await adminContentApi.update(contentType, editor.id, payload(editor));
      else await adminContentApi.create(contentType, payload(editor));
      setDirty(false);
      setEditor(null);
      setFeedback("Đã lưu dữ liệu vào PostgreSQL.");
      await load();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Không thể lưu nội dung",
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove(item: AdminContent) {
    if (!window.confirm(`Xóa “${item.title}”? Hành động này không thể hoàn tác.`)) return;
    try {
      await adminContentApi.remove(contentType, item.id);
      await load();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không thể xóa");
    }
  }
  async function bulk(action: "publish" | "archive" | "delete") {
    if (
      !selected.length ||
      (action === "delete" &&
        !window.confirm(`Xóa ${selected.length} nội dung?`))
    )
      return;
    setSaving(true);
    try {
      await adminContentApi.bulk(contentType, selected, action);
      setSelected([]);
      await load();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Bulk action thất bại",
      );
    } finally {
      setSaving(false);
    }
  }
  async function addProjectImage(media: { url: string; alt: string }) {
    if (!editor?.id)
      return setFeedback("Hãy lưu dự án trước khi thêm gallery.");
    try {
      await adminContentApi.addProjectImage(editor.id, {
        url: media.url,
        alt: media.alt,
        sortOrder: editor.images?.length ?? 0,
      });
      const result = await adminContentApi.list(contentType, {
        search: editor.slug,
        limit: 1,
      });
      const fresh = result.data.find((x) => x.id === editor.id);
      if (fresh) setEditor({ ...fresh, type: contentType });
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Không thể thêm ảnh");
    }
  }
  async function addCurriculum() {
    if (!editor?.id)
      return setFeedback("Hãy lưu khóa học trước khi thêm chương trình.");
    const title = newCurriculum.title.trim();
    const description = newCurriculum.description.trim();
    if (!title || !description) return setFeedback("Tên và nội dung phần học là bắt buộc.");
    try {
      await adminContentApi.addCourseSection(editor.id, {
        title,
        description,
        sortOrder: editor.curriculum?.length ?? 0,
      });
      const result = await adminContentApi.list(contentType, {
        search: editor.slug,
        limit: 1,
      });
      const fresh = result.data.find((x) => x.id === editor.id);
      if (fresh) setEditor({ ...fresh, type: contentType });
      setNewCurriculum({ title: "", description: "" });
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Không thể thêm phần học");
    }
  }
  async function saveCurriculumSection(id: string, patch: { title?: string; description?: string }) {
    if (!editor?.id) return;
    try { await adminContentApi.updateCourseSection(editor.id, id, patch); }
    catch (error) { setFeedback(error instanceof Error ? error.message : "Không thể cập nhật phần học"); }
  }
  async function moveCurriculum(index: number, direction: -1 | 1) {
    if (!editor?.id || !editor.curriculum) return;
    const target = index + direction;
    if (target < 0 || target >= editor.curriculum.length) return;
    const next = [...editor.curriculum];
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((item, order) => { item.sortOrder = order; });
    update({ curriculum: next });
    await Promise.all([adminContentApi.updateCourseSection(editor.id, next[index].id, { sortOrder: index }), adminContentApi.updateCourseSection(editor.id, next[target].id, { sortOrder: target })]);
  }
  async function moveProjectImage(index: number, direction: -1 | 1) {
    if (!editor?.id || !editor.images) return;
    const target = index + direction;
    if (target < 0 || target >= editor.images.length) return;
    const next = [...editor.images];
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((item, order) => { item.sortOrder = order; });
    update({ images: next });
    await Promise.all([adminContentApi.updateProjectImage(editor.id, next[index].id, { sortOrder: index }), adminContentApi.updateProjectImage(editor.id, next[target].id, { sortOrder: target })]);
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
            <button onClick={() => setFeedback("")} aria-label="Đóng thông báo">×</button>
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
                    <div className="flex min-w-[104px] gap-1 [&_button]:size-8 [&_button]:border [&_button]:border-border">
                      <button
                        onClick={() => {
                          const value = structuredClone(item);
                          const blocks: ContentBlock[] = value.contentBlocks?.length ? value.contentBlocks : value.sections.flatMap((section, index) => [{ id: `legacy-${index}`, type: "rich-text" as const, heading: section.title, content: section.body }]);
                          setEditor({ ...value, contentBlocks: blocks });
                        }}
                        title="Chỉnh sửa"
                        aria-label={`Chỉnh sửa ${item.title}`}
                      >
                        ✎
                      </button>
                      <button onClick={() => void remove(item)} title="Xóa" aria-label={`Xóa ${item.title}`}>
                        ⌫
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <p>Đang tải…</p>
            </div>
          ) : (
            items.length === 0 && (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <h3>Chưa có dữ liệu</h3>
                <p>Tạo nội dung mới hoặc thay đổi bộ lọc.</p>
              </div>
            )
          )}
        </div>
        <footer className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground [&_button]:size-9 [&_button]:border [&_button]:border-border">
          <span>
            Trang {page}/{totalPages}
          </span>
          <div>
            <button
              disabled={page <= 1}
              onClick={() => {
                setPage((x) => x - 1);
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
          <span>Dữ liệu từ PostgreSQL</span>
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
            <header>
              <div>
                <p>{editor.id ? "CHỈNH SỬA NỘI DUNG" : "TẠO NỘI DUNG MỚI"}</p>
                <h2>{editor.title || "Nội dung chưa đặt tên"}</h2>
              </div>
              <button onClick={closeEditor} aria-label="Đóng trình soạn thảo">×</button>
            </header>
            <div className="grid flex-1 gap-4 overflow-y-auto p-5 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-sm [&_input]:min-h-10 [&_input]:border [&_input]:border-border [&_input]:px-3 [&_select]:min-h-10 [&_select]:border [&_select]:border-border [&_select]:px-3 [&_textarea]:border [&_textarea]:border-border [&_textarea]:p-3">
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
              <label>
                Tiêu đề <em>*</em>
                <input
                  autoFocus
                  value={editor.title}
                  onChange={(e) =>
                    update({
                      title: e.target.value,
                      slug: editor.id ? editor.slug : slugify(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Đường dẫn
                <input
                  value={editor.slug}
                  onChange={(e) => update({ slug: slugify(e.target.value) })}
                />
              </label>
              <label>
                Mô tả <em>*</em>
                <textarea
                  rows={3}
                  value={editor.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  Nhãn nội dung <em>*</em>
                  <input
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
              <label>
                Ảnh đại diện
                <input
                  value={editor.image}
                  onChange={(e) => update({ image: e.target.value })}
                />
              </label>
              <MediaPicker label="Chọn ảnh đại diện từ Media" onSelect={(media) => update({ image: media.url })} />
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
                        value={editor.location ?? ""}
                        onChange={(e) => update({ location: e.target.value })}
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
                      value={editor.investor ?? ""}
                      onChange={(e) => update({ investor: e.target.value })}
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label>
                      Dự kiến hoàn thành
                      <input
                        value={editor.expectedCompletion ?? ""}
                        onChange={(e) =>
                          update({ expectedCompletion: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Gói thầu
                      <input
                        value={editor.contractPackage ?? ""}
                        onChange={(e) =>
                          update({ contractPackage: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Quy mô
                    <textarea
                      rows={3}
                      value={editor.scale ?? ""}
                      onChange={(e) => update({ scale: e.target.value })}
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
              {contentType === "Khóa học" && <section className="grid gap-4 border-t pt-5"><h3 className="font-semibold">Thông tin khóa học</h3><div className="grid gap-4 sm:grid-cols-2"><label>Thời lượng<input value={editor.duration ?? ""} onChange={(e) => update({ duration: e.target.value })} /></label><label>Cấp độ<input value={editor.level ?? ""} onChange={(e) => update({ level: e.target.value })} /></label><label>Học phí<input value={editor.price ?? ""} onChange={(e) => update({ price: e.target.value })} /></label><label>Giảng viên<input value={editor.instructor ?? ""} onChange={(e) => update({ instructor: e.target.value })} /></label></div><label>Kết quả học tập (mỗi dòng một mục)<textarea rows={4} value={(editor.learningOutcomes ?? []).join("\n")} onChange={(e) => update({ learningOutcomes: e.target.value.split("\n").filter(Boolean) })} /></label></section>}
              <label>
                Điểm nổi bật (mỗi dòng một mục)
                <textarea
                  rows={4}
                  value={editor.highlights.join("\n")}
                  onChange={(e) =>
                    update({
                      highlights: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </label>
              {contentType === "Dự án" && (
                <div>
                  <div className="mt-2 flex items-center justify-between border-t border-border pt-[18px] text-sm font-semibold [&_button]:border [&_button]:border-border [&_button]:px-2 [&_button]:py-1.5">
                    <span>Gallery dự án ({editor.images?.length ?? 0})</span>
                    <MediaPicker label="Thêm ảnh từ Media" onSelect={(media) => void addProjectImage(media)} />
                  </div>
                  {editor.images?.map((image, index) => (
                    <div
                      className="grid grid-cols-[1fr_auto] gap-3 border border-border p-3"
                      key={image.id}
                    >
                      <div className="grid gap-2">
                        <input aria-label={`Alt ảnh ${index + 1}`} value={image.alt} onChange={(event) => update({ images: editor.images?.map((item) => item.id === image.id ? { ...item, alt: event.target.value } : item) })} onBlur={() => void adminContentApi.updateProjectImage(editor.id, image.id, { alt: image.alt })} />
                        <input aria-label={`Chú thích ảnh ${index + 1}`} value={image.caption ?? ""} placeholder="Chú thích (không bắt buộc)" onChange={(event) => update({ images: editor.images?.map((item) => item.id === image.id ? { ...item, caption: event.target.value } : item) })} onBlur={() => void adminContentApi.updateProjectImage(editor.id, image.id, { caption: image.caption ?? null })} />
                        <small className="break-all">{image.url}</small>
                      </div>
                      <div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => void moveProjectImage(index, -1)} aria-label={`Đưa ảnh ${index + 1} lên`}>↑</button><button type="button" disabled={index === (editor.images?.length ?? 0) - 1} onClick={() => void moveProjectImage(index, 1)} aria-label={`Đưa ảnh ${index + 1} xuống`}>↓</button><button
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
                      >×</button></div>
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
                  <div className="grid gap-3 border p-3 sm:grid-cols-2"><label>Tên phần học<input value={newCurriculum.title} onChange={(e) => setNewCurriculum((value) => ({ ...value, title: e.target.value }))} /></label><label>Nội dung<input value={newCurriculum.description} onChange={(e) => setNewCurriculum((value) => ({ ...value, description: e.target.value }))} /></label><button className="min-h-10 bg-primary px-4 text-sm font-semibold text-white sm:col-span-2" type="button" onClick={() => void addCurriculum()}>＋ Thêm phần học</button></div>
                  {editor.curriculum?.map((section, index) => (
                    <div
                      className="grid grid-cols-[1fr_auto] gap-3 border border-border p-3"
                      key={section.id}
                    >
                      <div className="grid gap-2">
                        <input aria-label={`Tên phần học ${index + 1}`} value={section.title} onChange={(event) => update({ curriculum: editor.curriculum?.map((item) => item.id === section.id ? { ...item, title: event.target.value } : item) })} onBlur={() => void saveCurriculumSection(section.id, { title: section.title })} />
                        <textarea aria-label={`Nội dung phần học ${index + 1}`} rows={2} value={section.description} onChange={(event) => update({ curriculum: editor.curriculum?.map((item) => item.id === section.id ? { ...item, description: event.target.value } : item) })} onBlur={() => void saveCurriculumSection(section.id, { description: section.description })} />
                      </div>
                      <div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => void moveCurriculum(index, -1)} aria-label={`Đưa phần ${section.title} lên`}>↑</button><button type="button" disabled={index === (editor.curriculum?.length ?? 0) - 1} onClick={() => void moveCurriculum(index, 1)} aria-label={`Đưa phần ${section.title} xuống`}>↓</button><button
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
                      >×</button></div>
                    </div>
                  ))}
                </div>
              )}
              <ContentBlockEditor value={editor.contentBlocks ?? []} onChange={(contentBlocks) => update({ contentBlocks })} />
              <fieldset className="grid gap-2 border-t pt-5">
                <legend className="mb-2 font-semibold">Nội dung liên quan</legend>
                {items.filter((item) => item.id !== editor.id).length ? items.filter((item) => item.id !== editor.id).map((item) => (
                  <label className="flex items-center gap-3 rounded border p-3" key={item.id}>
                    <input type="checkbox" checked={(editor.relatedIds ?? []).includes(item.id)} onChange={(event) => update({ relatedIds: event.target.checked ? [...(editor.relatedIds ?? []), item.id] : (editor.relatedIds ?? []).filter((id) => id !== item.id) })} />
                    <span>{item.title}</span>
                  </label>
                )) : <p className="text-sm text-muted-foreground">Chưa có nội dung khác để liên kết.</p>}
              </fieldset>
              <section className="grid gap-4 border-t pt-5"><h3 className="font-semibold">SEO</h3><label>SEO title<input value={editor.seoTitle ?? ""} onChange={(e) => update({ seoTitle: e.target.value })} /></label><label>SEO description<textarea rows={3} value={editor.seoDescription ?? ""} onChange={(e) => update({ seoDescription: e.target.value })} /></label><label>Canonical URL<input value={editor.canonicalUrl ?? ""} onChange={(e) => update({ canonicalUrl: e.target.value })} /></label><label>Ảnh SEO<input value={editor.seoImage ?? ""} onChange={(e) => update({ seoImage: e.target.value })} /></label><MediaPicker label="Chọn ảnh SEO từ Media" onSelect={(media) => update({ seoImage: media.url })} /></section>
            </div>
            <footer>
              {editor.id && editor.slug && <Link className="mr-auto inline-flex min-h-[42px] items-center px-3 text-sm font-semibold text-primary" href={`${publicBase}/${editor.slug}`} target="_blank">Xem trang public</Link>}
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
        </>
      )}
    </>
  );
}
