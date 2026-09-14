"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminMediaApi } from "@/features/admin/api/media";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";
import type { HeroSlide, StrategicPartner } from "@/features/homepage/types";
import { MediaPicker } from "./MediaPicker";
import {
  Sparkles,
  Handshake,
  Plus,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  Layers,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Resource = "slides" | "partners";
type Item = HeroSlide | StrategicPartner;
const isSlide = (item: Item): item is HeroSlide => "title" in item;

export function HomepageManager() {
  const [tab, setTab] = useState<Resource>("slides");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [editing, setEditing] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/homepage/${tab}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.message ??
            "Không thể tải dữ liệu",
        );
      }
      const data = (await response.json()) as Item[];
      setItems(data);
      setSelectedId((current) =>
        data.some((item) => item.id === current) ? current : data[0]?.id,
      );
    } catch (error) {
      setItems([]);
      toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId],
  );

  const endpoint = (item?: Item) =>
    `/api/admin/homepage/${tab}${item?.id ? `/${item.id}` : ""}`;

  const fresh = (): Item =>
    tab === "slides"
      ? {
          eyebrow: "BIM4C ENTERPRISE",
          title: "",
          image: "/images/news-project-coordination.webp",
          alt: "BIM4C Hero Slide",
          sortOrder: items.length,
          isActive: true,
        }
      : {
          name: "",
          logo: "/images/news-project-coordination.webp",
          website: "",
          sortOrder: items.length,
          isActive: true,
        };

  const mutate = async (url: string, init: RequestInit, message: string) => {
    try {
      const response = await fetch(url, init);
      if (response.ok) return true;
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      toast.error(body?.message ?? message);
    } catch {
      toast.error("Không thể kết nối đến máy chủ.");
    }
    return false;
  };

  const save = async () => {
    if (!editing) return;
    if (isSlide(editing) && (!editing.title.trim() || !editing.alt.trim())) {
      toast.error("Tiêu đề và mô tả ảnh là bắt buộc.");
      return;
    }
    if (!isSlide(editing) && !editing.name.trim()) {
      toast.error("Tên đối tác là bắt buộc.");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Đang lưu...");
    try {
      const ok = await mutate(
        endpoint(editing),
        {
          method: editing.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        },
        "Không thể lưu dữ liệu.",
      );
      if (!ok) return;
      setEditing(null);
      toast.success("Đã cập nhật trang chủ thành công!", { id: toastId });
      void revalidateCmsCache();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Item) => {
    if (
      !item.id ||
      !window.confirm(`Xóa “${isSlide(item) ? item.title : item.name}”?`)
    )
      return;
    const toastId = toast.loading("Đang xóa...");
    if (
      await mutate(
        endpoint(item),
        { method: "DELETE" },
        "Không thể xóa nội dung.",
      )
    ) {
      toast.success("Đã xóa nội dung!", { id: toastId });
      void revalidateCmsCache();
      await load();
    }
  };

  const toggle = async (item: Item) => {
    if (!item.id) return;
    const toastId = toast.loading("Đang cập nhật trạng thái...");
    if (
      await mutate(
        endpoint(item),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !item.isActive }),
        },
        "Không thể cập nhật trạng thái.",
      )
    ) {
      toast.success("Đã đổi trạng thái hiển thị!", { id: toastId });
      void revalidateCmsCache();
      await load();
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const first = items[index],
      second = items[target];
    if (!first.id || !second.id) return;
    const requests = [
      [first, second.sortOrder],
      [second, first.sortOrder],
    ] as const;
    for (const [item, sortOrder] of requests) {
      if (
        !(await mutate(
          endpoint(item),
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder }),
          },
          "Không thể thay đổi vị trí.",
        ))
      )
        return;
    }
    toast.success("Đã thay đổi thứ tự!");
    void revalidateCmsCache();
    await load();
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm space-y-6 p-6">
      {/* Tab Switcher & Add Button Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-xl border border-border">
          <button
            type="button"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === "slides"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setTab("slides");
              setEditing(null);
            }}
          >
            <Sparkles className="size-3.5" />
            <span>Hero Slides Trang chủ</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === "partners"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setTab("partners");
              setEditing(null);
            }}
          >
            <Handshake className="size-3.5" />
            <span>Đối tác chiến lược</span>
          </button>
        </div>

        <Button
          onClick={() => setEditing(fresh())}
          className="gap-2 bg-primary text-white text-xs font-semibold h-10 px-4"
        >
          <Plus className="size-4" />
          <span>Thêm {tab === "slides" ? "Slide" : "Đối tác"} mới</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground">
          Đang tải dữ liệu trang chủ…
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground border border-dashed rounded-2xl">
          Chưa có {tab === "slides" ? "slide" : "đối tác"} nào. Nhấn &quot;Thêm mới&quot; ở trên để bắt đầu.
        </div>
      ) : tab === "slides" ? (
        <div className="space-y-6">
          {/* Live Hero Preview Banner */}
          {selected && isSlide(selected) && (
            <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden rounded-2xl border border-border text-white shadow-lg group">
              <Image
                src={selected.image}
                alt={selected.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-mono text-teal-300 border border-white/10">
                XEM TRƯỚC SLIDE {items.indexOf(selected) + 1}/{items.length}
              </div>
              <div className="absolute bottom-6 left-6 right-6 max-w-2xl space-y-2">
                <span className="rounded bg-teal-500/20 px-2 py-0.5 text-xs font-bold text-teal-300 border border-teal-500/30">
                  {selected.eyebrow}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-white drop-shadow-md">
                  {selected.title}
                </h2>
              </div>
              <Button
                onClick={() => setEditing({ ...selected })}
                className="absolute bottom-6 right-6 gap-2 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs"
              >
                <Edit2 className="size-3.5" />
                <span>Chỉnh sửa slide này</span>
              </Button>
            </div>
          )}

          {/* Slide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, index) => {
              if (!isSlide(item)) return null;
              const isCurrent = item.id === selected?.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`group flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-muted/20 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                    <Image src={item.image} alt={item.alt} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-primary">
                        SLIDE {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                        item.isActive ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-500/15 text-slate-400"
                      }`}>
                        {item.isActive ? "Đang hiển thị" : "Đang ẩn"}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-foreground truncate mt-1">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{item.eyebrow}</div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => void move(index, -1)}
                      className="size-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoveUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === items.length - 1}
                      onClick={() => void move(index, 1)}
                      className="size-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoveDown className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void toggle(item)}
                      className="size-8 text-muted-foreground hover:text-foreground"
                      title={item.isActive ? "Ẩn slide" : "Hiện slide"}
                    >
                      {item.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing({ ...item })}
                      className="size-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void remove(item)}
                      className="size-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Partners Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            if (isSlide(item)) return null;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground font-bold">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    item.isActive ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-500/15 text-slate-400"
                  }`}>
                    {item.isActive ? "Đang hiển thị" : "Đang ẩn"}
                  </span>
                </div>

                <div className="relative h-20 w-full rounded-xl bg-muted/30 border border-border p-2 flex items-center justify-center">
                  <Image src={item.logo} alt={item.name} fill className="object-contain p-2" />
                </div>

                <div>
                  <div className="font-bold text-sm text-foreground truncate">{item.name}</div>
                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 truncate"
                    >
                      <span>{item.website}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="size-7 text-muted-foreground"
                  >
                    <MoveUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                    className="size-7 text-muted-foreground"
                  >
                    <MoveDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggle(item)}
                    className="size-7 text-muted-foreground"
                  >
                    {item.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing({ ...item })}
                    className="size-7 text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(item)}
                    className="size-7 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide / Partner Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase text-primary">
                  {editing.id ? "CHỈNH SỬA" : "THÊM MỚI"}
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {isSlide(editing) ? "Slide Banner Trang Chủ" : "Đối tác Chiến lược"}
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
              {isSlide(editing) ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nhãn nhỏ (Eyebrow)
                    </label>
                    <Input
                      value={editing.eyebrow}
                      onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })}
                      placeholder="BIM4C ENTERPRISE"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tiêu đề chính (Title) *
                    </label>
                    <textarea
                      rows={2}
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      placeholder="Tiêu đề slide..."
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Mô tả ảnh (Alt) *
                    </label>
                    <Input
                      value={editing.alt}
                      onChange={(e) => setEditing({ ...editing, alt: e.target.value })}
                      placeholder="Mô tả cho công cụ tìm kiếm..."
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Hình ảnh Slide
                      </label>
                      <MediaPicker
                        label="Chọn ảnh từ Thư viện"
                        onSelect={(media) => setEditing({ ...editing, image: media.url })}
                      />
                    </div>
                    <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden border border-border bg-muted">
                      <Image src={editing.image} alt={editing.alt} fill className="object-cover" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tên đối tác / Thương hiệu *
                    </label>
                    <Input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      placeholder="Ví dụ: Autodesk, Vinaconex..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Website liên kết
                    </label>
                    <Input
                      value={editing.website ?? ""}
                      onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Logo đối tác
                      </label>
                      <MediaPicker
                        label="Chọn logo từ Thư viện"
                        onSelect={(media) => setEditing({ ...editing, logo: media.url })}
                      />
                    </div>
                    <div className="relative h-24 w-full rounded-xl overflow-hidden border border-border bg-muted/40 flex items-center justify-center p-3">
                      <Image src={editing.logo} alt={editing.name} fill className="object-contain p-2" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)} className="text-xs">
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
