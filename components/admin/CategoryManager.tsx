"use client";
import { useCallback, useEffect, useState } from "react";
import { adminContentApi } from "@/features/admin/api/client";
import type { AdminCategory, AdminContentType } from "@/features/admin/types";
import { slugify } from "@/lib/utils/slug";

export function CategoryManager({ type, onChange }: { type: AdminContentType; onChange: () => void }) {
  const [items, setItems] = useState<AdminCategory[]>([]); const [name, setName] = useState(""); const [editing, setEditing] = useState<AdminCategory | null>(null); const [error, setError] = useState("");
  const load = useCallback(async () => setItems((await adminContentApi.categories(type)).data), [type]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function save() { try { if (editing) await adminContentApi.updateCategory(type, editing.id, { name, slug: editing.slug }); else await adminContentApi.createCategory(type, { name, slug: slugify(name) }); setName(""); setEditing(null); await load(); onChange(); } catch (e) { setError(e instanceof Error ? e.message : "Không thể lưu danh mục"); } }
  async function remove(id: string) { if (!confirm("Xóa danh mục này?")) return; try { await adminContentApi.deleteCategory(type, id); await load(); onChange(); } catch (e) { setError(e instanceof Error ? e.message : "Không thể xóa danh mục"); } }
  return <section className="admin-panel"><header><h2>Danh mục</h2></header>{error && <div className="homepage-feedback">{error}</div>}<div className="content-toolbar"><label><input value={name} onChange={e => setName(e.target.value)} placeholder="Tên danh mục"/></label><button disabled={!name.trim()} onClick={() => void save()}>{editing ? "Lưu" : "＋ Thêm"}</button></div><div className="homepage-items">{items.map(item => <article key={item.id}><div><strong>{item.name}</strong><small>/{item.slug}</small></div><button onClick={() => { setEditing(item); setName(item.name); }}>Sửa</button><button onClick={() => void remove(item.id)}>Xóa</button></article>)}</div></section>;
}
