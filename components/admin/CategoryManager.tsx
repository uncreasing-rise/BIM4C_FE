"use client";

import { useCallback, useEffect, useState } from "react";
import { adminContentApi } from "@/features/admin/api/client";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";
import type { AdminCategory, AdminContentType } from "@/features/admin/types";
import { slugify } from "@/lib/utils/slug";
import { Folder, FolderPlus, Edit2, Trash2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CategoryManager({
  type,
  onChange,
}: {
  type: AdminContentType;
  onChange: () => void;
}) {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminContentApi.categories(type);
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    const toastId = toast.loading(editing ? "Đang cập nhật danh mục..." : "Đang tạo danh mục...");
    try {
      if (editing) {
        await adminContentApi.updateCategory(type, editing.id, {
          name: name.trim(),
          slug: editing.slug,
        });
        toast.success("Đã cập nhật danh mục!", { id: toastId });
      } else {
        await adminContentApi.createCategory(type, {
          name: name.trim(),
          slug: slugify(name.trim()),
        });
        toast.success("Đã thêm danh mục mới!", { id: toastId });
      }
      setName("");
      setEditing(null);
      void revalidateCmsCache();
      await load();
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể lưu danh mục", { id: toastId });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, catName: string) {
    if (!confirm(`Bạn có chắc muốn xóa danh mục “${catName}”?`)) return;
    setBusy(true);
    const toastId = toast.loading("Đang xóa danh mục...");
    try {
      await adminContentApi.deleteCategory(type, id);
      toast.success("Đã xóa danh mục!", { id: toastId });
      void revalidateCmsCache();
      await load();
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể xóa danh mục", { id: toastId });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-border pb-4">
        <div className="flex items-center gap-2">
          <Folder className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">
            Quản lý Danh mục {type}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          Tổng cộng <b>{items.length}</b> danh mục
        </span>
      </div>

      {/* Add / Edit Category Form Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <FolderPlus className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Tên danh mục ${type.toLowerCase()} mới (Ví dụ: Hạ tầng đô thị, BIM Consulting)...`}
            className="pl-9 h-10 bg-white dark:bg-background border-slate-200 dark:border-border"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void save();
              }
            }}
          />
        </div>
        <Button
          disabled={busy || !name.trim()}
          onClick={() => void save()}
          className="h-10 px-5 gap-2 font-semibold text-xs bg-primary text-white"
        >
          {editing ? (
            <>
              <Check className="size-4" />
              <span>Cập nhật</span>
            </>
          ) : (
            <>
              <Plus className="size-4" />
              <span>Thêm danh mục</span>
            </>
          )}
        </Button>
        {editing && (
          <Button
            variant="ghost"
            onClick={() => {
              setEditing(null);
              setName("");
            }}
            className="h-10 text-xs text-muted-foreground"
          >
            Hủy
          </Button>
        )}
      </div>

      {/* Category List Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-border p-3.5 bg-slate-50/70 dark:bg-muted/30 animate-pulse"
            >
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted/60 rounded" />
              </div>
              <div className="flex gap-1">
                <div className="size-7 bg-muted rounded" />
                <div className="size-7 bg-muted rounded" />
              </div>
            </div>
          ))
        ) : items.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
              editing?.id === item.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-slate-200/80 dark:border-border bg-slate-50/70 dark:bg-muted/30 hover:border-primary/40 hover:bg-slate-100/80 dark:hover:bg-muted/50"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-foreground truncate">{item.name}</div>
              <div className="font-mono text-[11px] text-muted-foreground truncate">/{item.slug}</div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(item);
                  setName(item.name);
                }}
                className="size-7 text-muted-foreground hover:text-primary"
                title="Sửa danh mục"
              >
                <Edit2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={busy}
                onClick={() => void remove(item.id, item.name)}
                className="size-7 text-muted-foreground hover:text-destructive"
                title="Xóa danh mục"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            Chưa có danh mục nào cho {type}. Hãy tạo danh mục đầu tiên ở trên.
          </div>
        )}
      </div>
    </section>
  );
}
