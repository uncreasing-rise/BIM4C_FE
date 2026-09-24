"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminMediaApi, type AdminMedia } from "@/features/admin/api/media";
import {
  UploadCloud,
  Search,
  Copy,
  Trash2,
  Check,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { toast } from "sonner";
import { useConfirm } from "./ConfirmDialog";

export function MediaLibrary() {
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [selected, setSelected] = useState<AdminMedia | null>(null);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setFeedback("");
      try {
        const result = await adminMediaApi.list(search, signal);
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : Array.isArray((result as unknown as { items: AdminMedia[] })?.items)
              ? (result as unknown as { items: AdminMedia[] }).items
              : [];
        if (!signal?.aborted) setItems(list);
      } catch (error) {
        if (signal?.aborted) return;
        setFeedback(
          error instanceof Error ? error.message : "Không thể tải media",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load]);

  async function upload(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    const toastId = toast.loading("Đang tải ảnh lên…");
    try {
      await adminMediaApi.upload(file, file.name.replace(/\.[^/.]+$/, ""));
      toast.success("Đã tải tệp lên thành công!", { id: toastId });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải tệp", {
        id: toastId,
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function saveAlt() {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const result = await adminMediaApi.update(
        selected.id,
        selected.alt ?? "",
      );
      setSelected(result.data);
      await load();
      toast.success("Đã cập nhật mô tả ảnh.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!selected || busy) return;
    if (
      !(await confirm({
        title: `Xóa tệp “${selected.filename}”?`,
        description: "Tệp bị xóa vĩnh viễn khỏi kho lưu trữ. Nội dung đang dùng ảnh này sẽ hiển thị ảnh lỗi cho đến khi được thay ảnh khác.",
      }))
    )
      return;
    setBusy(true);
    const toastId = toast.loading("Đang xóa tệp…");
    try {
      await adminMediaApi.remove(selected.id);
      setSelected(null);
      await load();
      toast.success("Đã xóa tệp thành công.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa", {
        id: toastId,
      });
    } finally {
      setBusy(false);
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Đã sao chép liên kết ảnh vào bộ nhớ tạm!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {dialog}
      {feedback && (
        <div className="mx-4 mt-3 flex justify-between rounded-lg bg-destructive/10 px-3.5 py-2.5 text-xs font-semibold text-destructive">
          {feedback}
          <button onClick={() => setFeedback("")} aria-label="Đóng thông báo">
            ×
          </button>
        </div>
      )}

      {/* Top Header & Upload Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tệp theo tên..."
            className="pl-9"
          />
        </div>

        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => void upload(e.target.files?.[0])}
        />

        <Button
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="gap-2 font-semibold shadow-xs"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UploadCloud className="size-4" />
          )}
          {busy ? "Đang tải lên…" : "Tải ảnh mới"}
        </Button>
      </div>

      {/* 2-Column: Grid & Detail Inspector */}
      <div className={`grid min-w-0 grid-cols-1 ${selected ? "lg:grid-cols-[1fr_340px]" : ""}`}>
        <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] content-start gap-4 p-4 sm:p-6">
          {loading && (
            <div className="col-span-full">
              <LoadingState label="Đang tải thư viện media…" />
            </div>
          )}

          {!loading && feedback && (
            <div className="col-span-full">
              <ErrorState message={feedback} onRetry={() => void load()} />
            </div>
          )}

          {!loading && !feedback && items.map((item) => (
            <button
              className={`group relative overflow-hidden rounded-xl border bg-background p-2.5 text-left transition-all hover:border-primary hover:shadow-md ${
                selected?.id === item.id
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border"
              }`}
              onClick={() => setSelected(item)}
              key={item.id}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={item.url}
                  alt={item.alt ?? ""}
                  fill
                  sizes="220px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <p className="mt-2 block truncate text-xs font-semibold text-foreground">
                {item.filename}
              </p>
              <span className="block text-[11px] text-muted-foreground">
                {item.mimeType} · {(item.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </button>
          ))}

          {!loading && !feedback && !items.length && (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
              <ImageIcon className="mx-auto size-8 text-muted-foreground/50 mb-2" />
              Chưa có tệp nào trong thư viện media. Hãy nhấn &quot;Tải ảnh mới&quot; để thêm ảnh.
            </div>
          )}
        </div>

        {/* Selected Media Inspector Drawer */}
        {selected && (
          <aside className="border-t lg:border-t-0 lg:border-l border-border p-5 sm:p-6 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Chi tiết tệp</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
                aria-label="Đóng chi tiết media"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-950/20 border">
              <Image
                src={selected.url}
                alt={selected.alt ?? ""}
                fill
                sizes="320px"
                className="object-contain"
              />
            </div>

            <div>
              <p className="font-semibold text-sm break-all text-foreground">
                {selected.filename}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full gap-1.5 text-xs font-semibold"
                onClick={() => copyUrl(selected.url)}
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? "Đã sao chép URL!" : "Sao chép URL"}
              </Button>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-xs border-y py-3 text-muted-foreground">
              <div>
                <dt className="text-[11px] uppercase tracking-wider font-semibold">Định dạng</dt>
                <dd className="font-medium text-foreground">{selected.mimeType}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider font-semibold">Dung lượng</dt>
                <dd className="font-medium text-foreground">
                  {(selected.size / 1024 / 1024).toFixed(2)} MB
                </dd>
              </div>
              <div className="col-span-2 mt-1">
                <dt className="text-[11px] uppercase tracking-wider font-semibold">Ngày tải lên</dt>
                <dd className="font-medium text-foreground">
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
                    new Date(selected.createdAt),
                  )}
                </dd>
              </div>
            </dl>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Văn bản thay thế (Alt text)
              </label>
              <Input
                value={selected.alt ?? ""}
                onChange={(e) =>
                  setSelected({ ...selected, alt: e.target.value })
                }
                placeholder="Nhập mô tả ảnh cho SEO..."
              />
            </div>

            <Button
              disabled={busy}
              className="w-full font-semibold shadow-xs"
              onClick={() => void saveAlt()}
            >
              Lưu mô tả ảnh
            </Button>

            <Button
              disabled={busy}
              variant="destructive"
              className="w-full gap-1.5 font-semibold"
              onClick={() => void remove()}
            >
              <Trash2 className="size-4" /> Xóa tệp
            </Button>
          </aside>
        )}
      </div>
    </section>
  );
}
