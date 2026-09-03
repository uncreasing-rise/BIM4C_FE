"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";
import { MediaPicker } from "./MediaPicker";

const createId = () => globalThis.crypto?.randomUUID?.() ?? `block-${Date.now()}`;
const blockLabels: Record<ContentBlock["type"], string> = { "rich-text": "Văn bản", image: "Hình ảnh", gallery: "Thư viện ảnh", quote: "Trích dẫn", "feature-list": "Danh sách", video: "Video", divider: "Đường phân cách" };

function createBlock(type: ContentBlock["type"]): ContentBlock {
  const id = createId();
  switch (type) {
    case "rich-text": return { id, type, heading: "", content: "" };
    case "image": return { id, type, image: { url: "/images/image.png", alt: "" } };
    case "gallery": return { id, type, images: [] };
    case "quote": return { id, type, quote: "", author: "" };
    case "feature-list": return { id, type, heading: "", items: [""], ordered: false };
    case "video": return { id, type, url: "", title: "" };
    case "divider": return { id, type };
  }
}

export function ContentBlockEditor({ value, onChange }: { value: ContentBlock[]; onChange: (value: ContentBlock[]) => void }) {
  const update = (index: number, block: ContentBlock) => onChange(value.map((item, itemIndex) => itemIndex === index ? block : item));
  const move = (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= value.length) return; const next = [...value]; [next[index], next[target]] = [next[target], next[index]]; onChange(next); };
  return <section><div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5"><div><h3 className="font-semibold">Nội dung chi tiết</h3><p className="text-xs text-muted-foreground">Thêm và sắp xếp các khối theo thứ tự hiển thị.</p></div><div className="flex flex-wrap gap-2">{Object.entries(blockLabels).map(([type, label]) => <Button type="button" size="sm" variant="outline" key={type} onClick={() => onChange([...value, createBlock(type as ContentBlock["type"])])}><Plus /> {label}</Button>)}</div></div><div className="mt-5 grid gap-4">{value.map((block, index) => <Card className="gap-0 p-0" key={block.id}><CardHeader className="flex-row items-center justify-between border-b p-4"><CardTitle>{String(index + 1).padStart(2, "0")} · {blockLabels[block.type]}</CardTitle><div className="flex gap-1"><Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} aria-label="Di chuyển lên" onClick={() => move(index, -1)}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon-sm" disabled={index === value.length - 1} aria-label="Di chuyển xuống" onClick={() => move(index, 1)}><ArrowDown /></Button><Button type="button" variant="destructive" size="icon-sm" aria-label={`Xóa khối ${index + 1}`} onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></Button></div></CardHeader><CardContent className="grid gap-4 p-4">
        {block.type === "rich-text" && <><Label>Tiêu đề<Input value={block.heading ?? ""} onChange={(e) => update(index, { ...block, heading: e.target.value })} /></Label><Label>Nội dung<Textarea rows={7} value={block.content} onChange={(e) => update(index, { ...block, content: e.target.value })} /></Label></>}
        {block.type === "image" && <><MediaPicker onSelect={(media) => update(index, { ...block, image: media })} /><Label>Mô tả ảnh<Input value={block.image.alt} onChange={(e) => update(index, { ...block, image: { ...block.image, alt: e.target.value } })} /></Label><Label>Chú thích<Input value={block.image.caption ?? ""} onChange={(e) => update(index, { ...block, image: { ...block.image, caption: e.target.value } })} /></Label></>}
        {block.type === "gallery" && <><MediaPicker label="Thêm ảnh từ Media" onSelect={(media) => update(index, { ...block, images: [...block.images, media] })} />{block.images.map((image, imageIndex) => <div className="flex items-center gap-3 rounded-lg border p-3" key={`${image.url}-${imageIndex}`}><span className="min-w-0 flex-1 truncate text-sm">{image.alt || image.url}</span><Button type="button" size="sm" variant="destructive" onClick={() => update(index, { ...block, images: block.images.filter((_, i) => i !== imageIndex) })}>Xóa</Button></div>)}</>}
        {block.type === "quote" && <><Label>Trích dẫn<Textarea rows={4} value={block.quote} onChange={(e) => update(index, { ...block, quote: e.target.value })} /></Label><Label>Tác giả / nguồn<Input value={block.author ?? ""} onChange={(e) => update(index, { ...block, author: e.target.value })} /></Label></>}
        {block.type === "feature-list" && <><Label>Tiêu đề<Input value={block.heading ?? ""} onChange={(e) => update(index, { ...block, heading: e.target.value })} /></Label><Label>Mỗi dòng một mục<Textarea rows={5} value={block.items.join("\n")} onChange={(e) => update(index, { ...block, items: e.target.value.split("\n") })} /></Label><Label className="flex-row items-center"><input type="checkbox" checked={block.ordered} onChange={(e) => update(index, { ...block, ordered: e.target.checked })} /> Danh sách đánh số</Label></>}
        {block.type === "video" && <><Label>Tiêu đề<Input value={block.title ?? ""} onChange={(e) => update(index, { ...block, title: e.target.value })} /></Label><Label>URL video<Input value={block.url} onChange={(e) => update(index, { ...block, url: e.target.value })} /></Label></>}
        {block.type === "divider" && <p className="text-sm text-muted-foreground">Đường phân cách không cần cấu hình.</p>}
      </CardContent></Card>)}</div></section>;
}
