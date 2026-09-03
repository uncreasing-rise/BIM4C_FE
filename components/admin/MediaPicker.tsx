"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageIcon, Search } from "lucide-react";
import { adminMediaApi, type AdminMedia } from "@/features/admin/api/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MediaPicker({ onSelect, label = "Chọn ảnh" }: { onSelect: (media: { url: string; alt: string }) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => adminMediaApi.list(search, controller.signal).then((result) => setItems(result.data)).catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Không thể tải thư viện ảnh"); }), 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, search]);
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button type="button" variant="outline"><ImageIcon /> {label}</Button></SheetTrigger><SheetContent className="w-full overflow-y-auto p-6 sm:max-w-xl"><SheetHeader><SheetTitle>Thư viện Media</SheetTitle></SheetHeader><div className="relative mt-5"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên file…" /></div>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}<div className="mt-5 grid grid-cols-2 gap-3">{items.map((media) => <button className="group overflow-hidden rounded-xl border text-left focus-visible:ring-2 focus-visible:ring-ring" type="button" key={media.id} onClick={() => { onSelect({ url: media.url, alt: media.alt ?? media.filename }); setOpen(false); }}><div className="relative aspect-square bg-muted"><Image src={media.url} alt={media.alt ?? ""} fill sizes="240px" className="object-cover" /></div><span className="block truncate p-2 text-xs font-medium">{media.filename}</span></button>)}</div>{!items.length && !error && <p className="py-12 text-center text-sm text-muted-foreground">Không có ảnh phù hợp.</p>}</SheetContent></Sheet>;
}
