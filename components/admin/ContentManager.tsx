"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminContentApi } from "@/features/admin/api/client";
import type { AdminCategory, AdminContent, AdminContentStatus, AdminContentType } from "@/features/admin/types";
import { slugify } from "@/lib/utils/slug";
import { CategoryManager } from "./CategoryManager";

const statusLabels: Record<AdminContentStatus, string> = { DRAFT: "Bản nháp", PUBLISHED: "Đã xuất bản", ARCHIVED: "Đã lưu trữ", PLANNED: "Đã xuất bản", IN_PROGRESS: "Đã xuất bản", COMPLETED: "Đã xuất bản" };
const empty = (type: AdminContentType): AdminContent => ({ id: "", type, title: "", slug: "", image: "/images/hero.jpg", status: "DRAFT", description: "", eyebrow: "", meta: "", highlights: [], sections: [{ title: "", body: "" }], publishedAt: null, updatedAt: new Date().toISOString(), sortOrder: 0, isFeatured: false, location: "", year: new Date().getFullYear(), categoryId: null, authorName: "" });

export function ContentManager({ contentType }: { contentType: AdminContentType }) {
  const params = useSearchParams(); const router = useRouter();
  const [items, setItems] = useState<AdminContent[]>([]); const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [query, setQuery] = useState(params.get("search") ?? ""); const [status, setStatus] = useState(params.get("status") ?? "");
  const [page, setPage] = useState(Number(params.get("page") ?? 1)); const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<string[]>([]); const [editor, setEditor] = useState<AdminContent | null>(() => params.get("create") ? empty(contentType) : null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setFeedback("");
    try { const [result, categoryResult] = await Promise.all([adminContentApi.list(contentType, { page, limit: 20, search: query, status, sortBy: "updatedAt", sortOrder: "desc" }), adminContentApi.categories(contentType)]); setItems(result.data.map(x => ({ ...x, type: contentType }))); setTotalPages(result.meta.totalPages || 1); setCategories(categoryResult.data); }
    catch (error) { setFeedback(error instanceof Error ? error.message : "Không thể tải dữ liệu"); }
    finally { setLoading(false); }
  }, [contentType, page, query, status]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 250); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => { const q = new URLSearchParams(); if (page > 1) q.set("page", String(page)); if (query) q.set("search", query); if (status) q.set("status", status); router.replace(`?${q}`, { scroll: false }); }, [page, query, status, router]);

  const update = (patch: Partial<AdminContent>) => setEditor(current => current ? { ...current, ...patch } : null);
  const payload = (value: AdminContent) => {
    const common = { slug: value.slug || slugify(value.title), title: value.title, description: value.description, image: value.image, eyebrow: value.eyebrow, meta: value.meta || null, highlights: value.highlights, sections: value.sections, status: value.status, sortOrder: value.sortOrder, publishedAt: value.status === "PUBLISHED" || ["PLANNED", "IN_PROGRESS", "COMPLETED"].includes(value.status) ? value.publishedAt ?? new Date().toISOString() : null };
    if (contentType === "Dự án") return { ...common, status: value.status === "PUBLISHED" ? "PLANNED" : value.status, categoryId: value.categoryId, location: value.location, year: value.year, isFeatured: value.isFeatured };
    if (contentType === "Tin tức") return { ...common, categoryId: value.categoryId || null, authorName: value.authorName || null };
    return common;
  };
  async function save() {
    if (!editor || saving) return; if (!editor.title.trim() || !editor.description.trim() || !editor.eyebrow.trim()) return setFeedback("Tiêu đề, mô tả và nhãn nội dung là bắt buộc.");
    if (contentType === "Dự án" && (!editor.categoryId || !editor.location || !editor.year)) return setFeedback("Dự án cần danh mục, địa điểm và năm.");
    setSaving(true); setFeedback("");
    try { if (editor.id) await adminContentApi.update(contentType, editor.id, payload(editor)); else await adminContentApi.create(contentType, payload(editor)); setEditor(null); setFeedback("Đã lưu dữ liệu vào PostgreSQL."); await load(); }
    catch (error) { setFeedback(error instanceof Error ? error.message : "Không thể lưu nội dung"); }
    finally { setSaving(false); }
  }
  async function remove(id: string) { if (!window.confirm("Xóa nội dung này?")) return; try { await adminContentApi.remove(contentType, id); await load(); } catch (error) { setFeedback(error instanceof Error ? error.message : "Không thể xóa"); } }
  async function bulk(action: "publish" | "archive" | "delete") { if (!selected.length || (action === "delete" && !window.confirm(`Xóa ${selected.length} nội dung?`))) return; setSaving(true); try { await adminContentApi.bulk(contentType, selected, action); setSelected([]); await load(); } catch (error) { setFeedback(error instanceof Error ? error.message : "Bulk action thất bại"); } finally { setSaving(false); } }
  async function addProjectImage() { if (!editor?.id) return setFeedback("Hãy lưu dự án trước khi thêm gallery."); const url = window.prompt("URL hình ảnh"); if (!url) return; const alt = window.prompt("Mô tả ảnh")?.trim(); if (!alt) return setFeedback("Mô tả ảnh là bắt buộc."); try { await adminContentApi.addProjectImage(editor.id, { url, alt, sortOrder: editor.images?.length ?? 0 }); const result = await adminContentApi.list(contentType, { search: editor.slug, limit: 1 }); const fresh = result.data.find(x => x.id === editor.id); if (fresh) setEditor({ ...fresh, type: contentType }); } catch (e) { setFeedback(e instanceof Error ? e.message : "Không thể thêm ảnh"); } }
  async function addCurriculum() { if (!editor?.id) return setFeedback("Hãy lưu khóa học trước khi thêm chương trình."); const title = window.prompt("Tên phần học")?.trim(); if (!title) return; const description = window.prompt("Nội dung phần học")?.trim(); if (!description) return; try { await adminContentApi.addCourseSection(editor.id, { title, description, sortOrder: editor.curriculum?.length ?? 0 }); const result = await adminContentApi.list(contentType, { search: editor.slug, limit: 1 }); const fresh = result.data.find(x => x.id === editor.id); if (fresh) setEditor({ ...fresh, type: contentType }); } catch (e) { setFeedback(e instanceof Error ? e.message : "Không thể thêm phần học"); } }
  const allSelected = useMemo(() => items.length > 0 && items.every(x => selected.includes(x.id)), [items, selected]);

  return <>
    <section className="admin-panel content-panel">
      <div className="content-toolbar"><label><span>⌕</span><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder={`Tìm ${contentType.toLowerCase()}...`}/></label><select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option><option value="draft">Bản nháp</option><option value="published">Đã xuất bản</option><option value="archived">Đã lưu trữ</option></select><button onClick={() => setEditor(empty(contentType))}>＋ Tạo mới</button></div>
      {feedback && <div className="homepage-feedback">{feedback}<button onClick={() => setFeedback("")}>×</button></div>}
      {selected.length > 0 && <div className="bulk-bar"><span>Đã chọn <b>{selected.length}</b> nội dung</span><button disabled={saving} onClick={() => void bulk("publish")}>Xuất bản</button><button disabled={saving} onClick={() => void bulk("archive")}>Lưu trữ</button><button disabled={saving} onClick={() => void bulk("delete")}>Xóa</button><button onClick={() => setSelected([])}>Bỏ chọn</button></div>}
      <div className="admin-table-wrap"><table className="content-table"><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả" checked={allSelected} onChange={e => setSelected(e.target.checked ? items.map(x => x.id) : [])}/></th><th>NỘI DUNG</th><th>LOẠI</th><th>TRẠNG THÁI</th><th>CẬP NHẬT</th><th/></tr></thead><tbody>{items.map(item => <tr key={item.id}><td><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected(old => old.includes(item.id) ? old.filter(x => x !== item.id) : [...old, item.id])}/></td><td><Image src={item.image} alt="" width={64} height={46}/><span><strong>{item.title}</strong><small>/{item.slug} · {item.sections.length} khối</small></span></td><td><span className="type-chip">{contentType}</span></td><td><span className="admin-status">{statusLabels[item.status]}</span></td><td>{new Intl.DateTimeFormat("vi-VN").format(new Date(item.updatedAt))}</td><td><div className="row-actions"><button onClick={() => setEditor(structuredClone(item))} title="Chỉnh sửa">✎</button><button onClick={() => void remove(item.id)} title="Xóa">⌫</button></div></td></tr>)}</tbody></table>{loading ? <div className="admin-empty"><p>Đang tải…</p></div> : items.length === 0 && <div className="admin-empty"><h3>Chưa có dữ liệu</h3><p>Tạo nội dung mới hoặc thay đổi bộ lọc.</p></div>}</div>
      <footer className="content-footer"><span>Trang {page}/{totalPages}</span><div><button disabled={page <= 1} onClick={() => setPage(x => x - 1)}>←</button><button disabled={page >= totalPages} onClick={() => setPage(x => x + 1)}>→</button></div><span>Dữ liệu từ PostgreSQL</span></footer>
    </section>
    {(contentType === "Dự án" || contentType === "Tin tức") && <CategoryManager type={contentType} onChange={() => void load()}/>} 
    {editor && <><button className="editor-backdrop" onClick={() => !saving && setEditor(null)} aria-label="Đóng"/><aside className="content-editor content-editor-wide"><header><div><p>{editor.id ? "CHỈNH SỬA NỘI DUNG" : "TẠO NỘI DUNG MỚI"}</p><h2>{editor.title || "Nội dung chưa đặt tên"}</h2></div><button onClick={() => setEditor(null)}>×</button></header><div className="editor-body">
      <div className="editor-grid"><label>Trạng thái<select value={editor.status} onChange={e => update({ status: e.target.value as AdminContentStatus })}><option value="DRAFT">Bản nháp</option><option value={contentType === "Dự án" ? "PLANNED" : "PUBLISHED"}>Đã xuất bản</option><option value="ARCHIVED">Đã lưu trữ</option></select></label><label>Thứ tự<input type="number" min="0" value={editor.sortOrder} onChange={e => update({ sortOrder: Number(e.target.value) })}/></label></div>
      <label>Tiêu đề <em>*</em><input autoFocus value={editor.title} onChange={e => update({ title: e.target.value, slug: editor.id ? editor.slug : slugify(e.target.value) })}/></label><label>Đường dẫn<input value={editor.slug} onChange={e => update({ slug: slugify(e.target.value) })}/></label><label>Mô tả <em>*</em><textarea rows={3} value={editor.description} onChange={e => update({ description: e.target.value })}/></label>
      <div className="editor-grid"><label>Nhãn nội dung <em>*</em><input value={editor.eyebrow} onChange={e => update({ eyebrow: e.target.value })}/></label><label>Thông tin phụ<input value={editor.meta ?? ""} onChange={e => update({ meta: e.target.value })}/></label></div><label>Ảnh đại diện<input value={editor.image} onChange={e => update({ image: e.target.value })}/></label>
      {(contentType === "Dự án" || contentType === "Tin tức") && <label>Danh mục<select value={editor.categoryId ?? ""} onChange={e => update({ categoryId: e.target.value || null })}><option value="">Chọn danh mục</option>{categories.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>}
      {contentType === "Dự án" && <div className="editor-grid"><label>Địa điểm<input value={editor.location ?? ""} onChange={e => update({ location: e.target.value })}/></label><label>Năm<input type="number" value={editor.year ?? ""} onChange={e => update({ year: Number(e.target.value) })}/></label></div>}
      {contentType === "Tin tức" && <label>Tác giả<input value={editor.authorName ?? ""} onChange={e => update({ authorName: e.target.value })}/></label>}
      <label>Điểm nổi bật (mỗi dòng một mục)<textarea rows={4} value={editor.highlights.join("\n")} onChange={e => update({ highlights: e.target.value.split("\n").filter(Boolean) })}/></label>
      {contentType === "Dự án" && <div><div className="editor-section-title"><span>Gallery dự án ({editor.images?.length ?? 0})</span><button onClick={() => void addProjectImage()}>＋ Thêm ảnh</button></div>{editor.images?.map(image => <div className="editor-block" key={image.id}><span/><div><strong>{image.alt}</strong><small>{image.url}</small></div><button onClick={async () => { await adminContentApi.deleteProjectImage(editor.id, image.id); update({ images: editor.images?.filter(x => x.id !== image.id) }); }}>×</button></div>)}</div>}
      {contentType === "Khóa học" && <div><div className="editor-section-title"><span>Chương trình học ({editor.curriculum?.length ?? 0})</span><button onClick={() => void addCurriculum()}>＋ Thêm phần</button></div>{editor.curriculum?.map(section => <div className="editor-block" key={section.id}><span/><div><strong>{section.title}</strong><small>{section.description}</small></div><button onClick={async () => { await adminContentApi.deleteCourseSection(editor.id, section.id); update({ curriculum: editor.curriculum?.filter(x => x.id !== section.id) }); }}>×</button></div>)}</div>}
      <div className="editor-section-title"><span>Các khối nội dung</span><button onClick={() => update({ sections: [...editor.sections, { title: "", body: "" }] })}>＋ Thêm khối</button></div>{editor.sections.map((section, index) => <div className="editor-block" key={index}><div/><div><label>Heading<input value={section.title} onChange={e => update({ sections: editor.sections.map((x, i) => i === index ? { ...x, title: e.target.value } : x) })}/></label><label>Nội dung<textarea rows={5} value={section.body} onChange={e => update({ sections: editor.sections.map((x, i) => i === index ? { ...x, body: e.target.value } : x) })}/></label></div><button onClick={() => update({ sections: editor.sections.filter((_, i) => i !== index) })}>×</button></div>)}
    </div><footer><button disabled={saving} onClick={() => setEditor(null)}>Hủy</button><button className="admin-primary" disabled={saving} onClick={() => void save()}>{saving ? "Đang lưu…" : "Lưu nội dung"}</button></footer></aside></>}
  </>;
}
