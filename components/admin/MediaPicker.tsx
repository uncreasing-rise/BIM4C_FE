"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Search, UploadCloud, Loader2 } from "lucide-react";
import { adminMediaApi, type AdminMedia } from "@/features/admin/api/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export function MediaPicker({
  onSelect,
  label = "Chọn ảnh",
}: {
  onSelect: (media: { url: string; alt: string }) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async (signal?: AbortSignal) => {
    try {
      setError("");
      const result = await adminMediaApi.list(search, signal);
      const list = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : Array.isArray((result as unknown as { items: AdminMedia[] })?.items)
            ? (result as unknown as { items: AdminMedia[] }).items
            : [];
      if (!signal?.aborted) setItems(list);
    } catch (cause: unknown) {
      if (!signal?.aborted) {
        setError(
          cause instanceof Error ? cause.message : "Không thể tải thư viện ảnh",
        );
      }
    }
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => void loadMedia(controller.signal), 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadMedia, open]);

  const handleUpload = async (file?: File) => {
    if (!file || uploading) return;
    setUploading(true);
    const toastId = toast.loading("Đang tải ảnh lên Supabase Storage...");
    try {
      const response = await adminMediaApi.upload(file, file.name.replace(/\.[^/.]+$/, ""));
      const uploaded = response.data;
      toast.success("Tải ảnh lên thành công!", { id: toastId });
      onSelect({ url: uploaded.url, alt: uploaded.alt ?? uploaded.filename });
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải ảnh", {
        id: toastId,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <ImageIcon className="size-4" /> {label}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Thư viện Media & Tải ảnh</SheetTitle>
        </SheetHeader>

        {/* Upload Action Button */}
        <div className="mt-5 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files?.[0])}
          />
          <Button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2 font-semibold shadow-xs"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            {uploading ? "Đang tải lên Supabase..." : "Tải ảnh mới từ máy tính"}
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Hỗ trợ PNG, JPG, WEBP, SVG lên Supabase Storage
          </p>
        </div>

        {/* Search Media */}
        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên file…"
          />
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        {/* Media Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((media) => (
            <button
              className="group overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
              type="button"
              key={media.id}
              onClick={() => {
                onSelect({
                  url: media.url,
                  alt: media.alt ?? media.filename,
                });
                setOpen(false);
              }}
            >
              <div className="relative aspect-square bg-muted">
                <Image
                  src={media.url}
                  alt={media.alt ?? ""}
                  fill
                  sizes="240px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <span className="block truncate p-2 text-xs font-medium text-foreground">
                {media.filename}
              </span>
            </button>
          ))}
        </div>

        {!items.length && !error && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Không có ảnh phù hợp trong thư viện.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
