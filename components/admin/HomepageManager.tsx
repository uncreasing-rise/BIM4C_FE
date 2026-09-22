"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";
import type { StrategicPartner } from "@/features/homepage/types";
import { MediaPicker } from "./MediaPicker";
import {
  Handshake,
  Plus,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  Save,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { adminRequest } from "@/features/admin/api/http-client";

export function HomepageManager() {
  const [items, setItems] = useState<StrategicPartner[]>([]);
  const [editing, setEditing] = useState<StrategicPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminRequest<
        StrategicPartner[] | { data: StrategicPartner[] }
      >("homepage/partners");
      const list = Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: StrategicPartner[] })?.data)
          ? (response as { data: StrategicPartner[] }).data
          : [];
      setItems(list);
    } catch (error) {
      setItems([]);
      toast.error(
        error instanceof Error ? error.message : "Không thể tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const fresh = (): StrategicPartner => ({
    name: "",
    logo: "/images/partners/bitexco.png",
    website: "",
    sortOrder: items.length,
    isActive: true,
  });

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Tên đối tác / thương hiệu là bắt buộc.");
      return;
    }
    if (!editing.logo?.trim()) {
      toast.error("Logo đối tác là bắt buộc.");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Đang lưu...");
    try {
      const path = editing.id ? `homepage/partners/${editing.id}` : "homepage/partners";
      await adminRequest(path, {
        method: editing.id ? "PATCH" : "POST",
        body: JSON.stringify(editing),
      });
      setEditing(null);
      toast.success("Đã cập nhật đối tác thành công!", { id: toastId });
      void revalidateCmsCache();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu dữ liệu.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: StrategicPartner) => {
    if (
      !item.id ||
      !window.confirm(`Xóa đối tác “${item.name}”?`)
    )
      return;
    const prevItems = [...items];
    setItems((prev) => prev.filter((p) => p.id !== item.id));
    const toastId = toast.loading("Đang xóa...");
    try {
      await adminRequest(`homepage/partners/${item.id}`, { method: "DELETE" });
      toast.success("Đã xóa đối tác thành công!", { id: toastId });
      void revalidateCmsCache();
      void load();
    } catch (err) {
      setItems(prevItems);
      toast.error(err instanceof Error ? err.message : "Không thể xóa nội dung.", { id: toastId });
    }
  };

  const toggle = async (item: StrategicPartner) => {
    if (!item.id) return;
    const prevItems = [...items];
    const newActive = !item.isActive;
    setItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isActive: newActive } : p)),
    );
    const toastId = toast.loading("Đang cập nhật trạng thái...");
    try {
      await adminRequest(`homepage/partners/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: newActive }),
      });
      toast.success("Đã đổi trạng thái hiển thị!", { id: toastId });
      void revalidateCmsCache();
      void load();
    } catch (err) {
      setItems(prevItems);
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.", { id: toastId });
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const prevItems = [...items];
    const first = items[index],
      second = items[target];
    if (!first.id || !second.id) return;

    // Optimistic swap
    const nextItems = [...items];
    nextItems[index] = second;
    nextItems[target] = first;
    setItems(nextItems);

    const requests = [
      [first, second.sortOrder],
      [second, first.sortOrder],
    ] as const;
    try {
      for (const [item, sortOrder] of requests) {
        await adminRequest(`homepage/partners/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ sortOrder }),
        });
      }
      toast.success("Đã thay đổi thứ tự!");
      void revalidateCmsCache();
      void load();
    } catch {
      setItems(prevItems);
      toast.error("Không thể thay đổi vị trí.");
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm space-y-6 p-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Handshake className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Khách hàng & Đối tác chiến lược
            </h2>
            <p className="text-xs text-muted-foreground">
              Tổng cộng {items.length} thương hiệu hiển thị trên thanh cuộn và trang Giới thiệu.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setEditing(fresh())}
          className="gap-2 bg-primary text-white text-xs font-semibold h-10 px-4"
        >
          <Plus className="size-4" />
          <span>Thêm đối tác mới</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground">
          Đang tải danh sách đối tác…
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground border border-dashed rounded-2xl">
          Chưa có đối tác nào. Nhấn &quot;Thêm đối tác mới&quot; ở trên để bắt đầu.
        </div>
      ) : (
        /* Partners Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground font-bold">
                  #{String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    item.isActive
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-slate-500/15 text-slate-400"
                  }`}
                >
                  {item.isActive ? "Đang hiển thị" : "Đang ẩn"}
                </span>
              </div>

              <div className="relative h-20 w-full rounded-xl bg-muted/40 border border-border p-2 flex items-center justify-center">
                <Image
                  src={item.logo}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                />
              </div>

              <div>
                <div className="font-bold text-sm text-foreground truncate">
                  {item.name}
                </div>
                {item.website ? (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 truncate"
                  >
                    <Globe className="size-3 shrink-0" />
                    <span className="truncate">{item.website}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Chưa có liên kết web
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="size-7 text-muted-foreground hover:text-foreground"
                  title="Di chuyển lên"
                >
                  <MoveUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  className="size-7 text-muted-foreground hover:text-foreground"
                  title="Di chuyển xuống"
                >
                  <MoveDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggle(item)}
                  className="size-7 text-muted-foreground hover:text-foreground"
                  title={item.isActive ? "Ẩn đối tác" : "Hiện đối tác"}
                >
                  {item.isActive ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <EyeOff className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing({ ...item })}
                  className="size-7 text-muted-foreground hover:text-primary"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(item)}
                  className="size-7 text-destructive hover:bg-destructive/10"
                  title="Xóa"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partner Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase text-primary">
                  {editing.id ? "CHỈNH SỬA" : "THÊM MỚI"}
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  Đối tác & Khách hàng
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditing(null)}
                className="size-8 text-muted-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tên đối tác / Thương hiệu *
                </label>
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Ví dụ: Bitexco, Ecopark, Gamuda Land..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Website liên kết
                </label>
                <Input
                  value={editing.website ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Logo đối tác *
                  </label>
                  <MediaPicker
                    label="Chọn logo từ Thư viện"
                    onSelect={(media) =>
                      setEditing({ ...editing, logo: media.url })
                    }
                  />
                </div>
                <div className="relative h-24 w-full rounded-xl overflow-hidden border border-border bg-muted/40 flex items-center justify-center p-3">
                  <Image
                    src={editing.logo}
                    alt={editing.name || "Partner Logo"}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="ghost"
                onClick={() => setEditing(null)}
                className="text-xs"
              >
                Hủy
              </Button>
              <Button
                disabled={saving}
                onClick={() => void save()}
                className="gap-2 bg-primary text-white font-bold text-xs px-5"
              >
                <Save className="size-3.5" />
                <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
