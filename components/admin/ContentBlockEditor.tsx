"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ClipboardCopy,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  ListChecks,
  Minus,
  Plus,
  Quote,
  Trash2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";
import { MediaPicker } from "./MediaPicker";
import { BilingualColumnsHeader, LANGS, LANG_META, SharedBadge, filled, looksVietnamese, type Lang } from "./bilingual";
import { blockDomId } from "./content-check";

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const blockConfigs: Record<
  ContentBlock["type"],
  { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }
> = {
  "rich-text": { label: "Văn bản", icon: FileText, desc: "Đoạn văn có tiêu đề & nội dung" },
  image: { label: "Hình ảnh", icon: ImageIcon, desc: "Ảnh đơn lẻ kèm mô tả & chú thích" },
  gallery: { label: "Thư viện ảnh", icon: LayoutGrid, desc: "Bộ sưu tập nhiều hình ảnh" },
  quote: { label: "Trích dẫn", icon: Quote, desc: "Câu trích dẫn & tác giả / nguồn" },
  "feature-list": { label: "Danh sách", icon: ListChecks, desc: "Danh sách các điểm nổi bật hoặc đánh số" },
  video: { label: "Video", icon: Video, desc: "Video từ YouTube hoặc đường dẫn URL" },
  divider: { label: "Đường phân cách", icon: Minus, desc: "Nét kẻ phân chia các phần" },
};

function createBlock(type: ContentBlock["type"], id: string): ContentBlock {
  switch (type) {
    case "rich-text":
      return { id, type, heading: "", content: "" };
    case "image":
      return { id, type, image: { url: "", alt: "" } };
    case "gallery":
      return { id, type, images: [] };
    case "quote":
      return { id, type, quote: "", author: "" };
    case "feature-list":
      return { id, type, heading: "", items: [""], ordered: false };
    case "video":
      return { id, type, url: "", title: "" };
    case "divider":
      return { id, type };
  }
}

/** Empty block of the same type for the other language, sharing media and layout but no text. */
function scaffoldCounterpart(source: ContentBlock): ContentBlock {
  const { id } = source;
  switch (source.type) {
    case "image":
      return { id, type: "image", image: { url: source.image.url, alt: "", caption: "" } };
    case "gallery":
      return { id, type: "gallery", images: source.images };
    case "quote":
      return { id, type: "quote", quote: "", author: source.author ?? "" };
    case "feature-list":
      return { id, type: "feature-list", heading: "", items: source.items.map(() => ""), ordered: source.ordered };
    case "video":
      return { id, type: "video", url: source.url, title: "" };
    default:
      return createBlock(source.type, id);
  }
}

/** Applies media / layout (not text) of `source` to `target` when both are the same type. */
function syncShared(source: ContentBlock, target: ContentBlock): ContentBlock {
  if (source.type !== target.type) return target;
  if (source.type === "image" && target.type === "image")
    return { ...target, image: { ...target.image, url: source.image.url } };
  if (source.type === "gallery" && target.type === "gallery") return { ...target, images: source.images };
  if (source.type === "video" && target.type === "video") return { ...target, url: source.url };
  if (source.type === "feature-list" && target.type === "feature-list") return { ...target, ordered: source.ordered };
  return target;
}

export interface ContentBlockEditorProps {
  valueVi: ContentBlock[];
  valueEn: ContentBlock[];
  onChange: (payload: { contentBlocks_vi: ContentBlock[]; contentBlocks: ContentBlock[] }) => void;
}

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:ring-2 dark:bg-background dark:text-foreground";
const okBorder = "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-border";
const warnBorder = "border-amber-400 bg-amber-50/40 focus:border-amber-500 focus:ring-amber-500/20 dark:border-amber-500/60 dark:bg-amber-500/5";

/** One text input inside a block, amber when the other language has text here and this one does not. */
function BlockText({
  label,
  value,
  other,
  lang,
  onChange,
  multiline,
  rows = 3,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  other: string | undefined;
  lang: Lang;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  const missing = !filled(value) && filled(other);
  const untranslated = lang === "en" && looksVietnamese(value);
  const props = {
    value,
    lang,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: cn(inputClass, missing || untranslated ? warnBorder : okBorder, className),
  };
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between gap-2 text-[12px] font-medium text-slate-700 dark:text-foreground">
        {label}
        {missing && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(other ?? "");
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            <ClipboardCopy className="size-3" /> Chép từ {lang === "en" ? "VI" : "EN"}
          </button>
        )}
      </span>
      {multiline ? <textarea rows={rows} {...props} /> : <input {...props} />}
      {untranslated && (
        <span className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3" /> Có vẻ vẫn còn chữ tiếng Việt
        </span>
      )}
    </label>
  );
}

/** Translatable fields of a block in one language. */
function BlockSide({
  block,
  other,
  lang,
  onChange,
}: {
  block: ContentBlock;
  other: ContentBlock | undefined;
  lang: Lang;
  onChange: (block: ContentBlock) => void;
}) {
  const same = other && other.type === block.type ? other : undefined;

  switch (block.type) {
    case "rich-text": {
      const o = same as Extract<ContentBlock, { type: "rich-text" }> | undefined;
      return (
        <>
          <BlockText
            label="Tiêu đề đoạn (tùy chọn)"
            lang={lang}
            value={block.heading ?? ""}
            other={o?.heading}
            placeholder={lang === "vi" ? "Ví dụ: Giải pháp BIM cho doanh nghiệp" : "e.g. BIM solutions for enterprises"}
            onChange={(heading) => onChange({ ...block, heading })}
          />
          <BlockText
            label="Nội dung đoạn văn *"
            lang={lang}
            multiline
            rows={7}
            value={block.content ?? ""}
            other={o?.content}
            placeholder={lang === "vi" ? "Nhập nội dung chi tiết..." : "Write the paragraph in English..."}
            onChange={(content) => onChange({ ...block, content })}
            className="leading-relaxed"
          />
        </>
      );
    }
    case "image": {
      const o = same as Extract<ContentBlock, { type: "image" }> | undefined;
      return (
        <>
          <BlockText
            label="Mô tả ảnh (alt, cho SEO & người khiếm thị)"
            lang={lang}
            value={block.image.alt ?? ""}
            other={o?.image.alt}
            placeholder={lang === "vi" ? "Mô tả nội dung ảnh..." : "Describe the image..."}
            onChange={(alt) => onChange({ ...block, image: { ...block.image, alt } })}
          />
          <BlockText
            label="Chú thích dưới ảnh"
            lang={lang}
            value={block.image.caption ?? ""}
            other={o?.image.caption}
            placeholder={lang === "vi" ? "Chú thích hiển thị dưới ảnh..." : "Caption shown under the image..."}
            onChange={(caption) => onChange({ ...block, image: { ...block.image, caption } })}
          />
        </>
      );
    }
    case "quote": {
      const o = same as Extract<ContentBlock, { type: "quote" }> | undefined;
      return (
        <>
          <BlockText
            label="Nội dung trích dẫn *"
            lang={lang}
            multiline
            value={block.quote ?? ""}
            other={o?.quote}
            onChange={(quote) => onChange({ ...block, quote })}
            className="italic"
          />
          <BlockText
            label="Tác giả / nguồn"
            lang={lang}
            value={block.author ?? ""}
            other={o?.author}
            placeholder={lang === "vi" ? "ThS. KTS Nguyễn Văn A - Trưởng phòng BIM" : "Nguyen Van A, MArch - Head of BIM"}
            onChange={(author) => onChange({ ...block, author })}
          />
        </>
      );
    }
    case "feature-list": {
      const o = same as Extract<ContentBlock, { type: "feature-list" }> | undefined;
      const lines = block.items.filter(filled).length;
      const otherLines = o?.items.filter(filled).length;
      return (
        <>
          <BlockText
            label="Tiêu đề danh sách (tùy chọn)"
            lang={lang}
            value={block.heading ?? ""}
            other={o?.heading}
            onChange={(heading) => onChange({ ...block, heading })}
          />
          <BlockText
            label="Các dòng (mỗi dòng một mục) *"
            lang={lang}
            multiline
            rows={6}
            value={block.items.join("\n")}
            other={o?.items.join("\n")}
            onChange={(text) => onChange({ ...block, items: text.split("\n") })}
          />
          <p
            className={cn(
              "text-[11px]",
              otherLines !== undefined && otherLines !== lines
                ? "font-medium text-amber-700 dark:text-amber-400"
                : "text-muted-foreground",
            )}
          >
            {lines} dòng
            {otherLines !== undefined && otherLines !== lines && ` — bản ${lang === "vi" ? "EN" : "VI"} có ${otherLines} dòng`}
          </p>
        </>
      );
    }
    case "video": {
      const o = same as Extract<ContentBlock, { type: "video" }> | undefined;
      return (
        <BlockText
          label="Tiêu đề video"
          lang={lang}
          value={block.title ?? ""}
          other={o?.title}
          onChange={(title) => onChange({ ...block, title })}
        />
      );
    }
    default:
      return <p className="text-xs italic text-muted-foreground">Khối này không có chữ cần dịch.</p>;
  }
}

/** Media / layout settings shared by both languages of a block. */
function SharedSettings({ block, onChange }: { block: ContentBlock; onChange: (block: ContentBlock) => void }) {
  if (block.type === "image") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <MediaPicker
          label={block.image.url ? "Đổi ảnh" : "Chọn ảnh từ Thư viện"}
          onSelect={(media) => onChange({ ...block, image: { ...block.image, url: media.url } })}
        />
        {block.image.url ? (
          <span className="max-w-xs truncate font-mono text-xs text-muted-foreground">{block.image.url}</span>
        ) : (
          <span className="text-xs font-medium text-red-600">Chưa chọn ảnh</span>
        )}
      </div>
    );
  }
  if (block.type === "gallery") {
    return (
      <div className="space-y-2">
        <MediaPicker label="Thêm ảnh vào thư viện" onSelect={(media) => onChange({ ...block, images: [...block.images, media] })} />
        {block.images.length === 0 ? (
          <p className="text-xs font-medium text-red-600">Chưa có ảnh nào.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {block.images.map((image, imageIndex) => (
              <div
                key={`${image.url}-${imageIndex}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 p-2"
              >
                <span className="min-w-0 flex-1 truncate text-xs">{image.alt || image.url}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onChange({ ...block, images: block.images.filter((_, i) => i !== imageIndex) })}
                  className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (block.type === "video") {
    return (
      <label className="block space-y-1">
        <span className="text-[12px] font-medium text-slate-700 dark:text-foreground">
          Đường dẫn video (YouTube / MP4, bắt đầu bằng https://) *
        </span>
        <input
          value={block.url}
          onChange={(e) => onChange({ ...block, url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          className={cn(inputClass, filled(block.url) ? okBorder : "border-red-400")}
        />
      </label>
    );
  }
  if (block.type === "feature-list") {
    return (
      <label className="inline-flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-foreground">
        <input
          type="checkbox"
          className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
          checked={block.ordered}
          onChange={(e) => onChange({ ...block, ordered: e.target.checked })}
        />
        Hiển thị dạng đánh số (1, 2, 3...)
      </label>
    );
  }
  return null;
}

const hasShared = (type: ContentBlock["type"]) => ["image", "gallery", "video", "feature-list"].includes(type);

/**
 * Content blocks with Vietnamese and English side by side. Row N of each
 * language is the same block; adding, moving or deleting applies to both.
 */
export function ContentBlockEditor({ valueVi, valueEn, onChange }: ContentBlockEditorProps) {
  const length = Math.max(valueVi.length, valueEn.length);
  const lists: Record<Lang, (ContentBlock | undefined)[]> = {
    vi: Array.from({ length }, (_, i) => valueVi[i]),
    en: Array.from({ length }, (_, i) => valueEn[i]),
  };

  /** Fills holes so both lists have a block at every row, then emits. */
  const emit = (vi: (ContentBlock | undefined)[], en: (ContentBlock | undefined)[]) => {
    const n = Math.max(vi.length, en.length);
    const outVi: ContentBlock[] = [];
    const outEn: ContentBlock[] = [];
    for (let i = 0; i < n; i++) {
      const a = vi[i];
      const b = en[i];
      if (!a && !b) continue;
      outVi.push(a ?? scaffoldCounterpart(b!));
      outEn.push(b ?? scaffoldCounterpart(a!));
    }
    onChange({ contentBlocks_vi: outVi, contentBlocks: outEn });
  };

  const setSide = (index: number, lang: Lang, block: ContentBlock) => {
    const next = { vi: [...lists.vi], en: [...lists.en] };
    next[lang][index] = block;
    emit(next.vi, next.en);
  };

  const setShared = (index: number, block: ContentBlock) => {
    const next = { vi: [...lists.vi], en: [...lists.en] };
    for (const lang of LANGS) {
      const current = next[lang][index];
      if (current) next[lang][index] = syncShared(block, current);
    }
    emit(next.vi, next.en);
  };

  const add = (type: ContentBlock["type"]) => {
    const id = createId();
    emit([...lists.vi, createBlock(type, id)], [...lists.en, createBlock(type, id)]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= length) return;
    const swap = (list: (ContentBlock | undefined)[]) => {
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    };
    emit(swap(lists.vi), swap(lists.en));
  };

  const remove = (index: number) => {
    emit(
      lists.vi.filter((_, i) => i !== index),
      lists.en.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
        <span className="text-[13px] font-medium text-foreground">Thêm khối (tạo cho cả 2 ngôn ngữ):</span>
        {(Object.keys(blockConfigs) as Array<ContentBlock["type"]>).map((type) => {
          const config = blockConfigs[type];
          const Icon = config.icon;
          return (
            <Button
              key={type}
              type="button"
              size="sm"
              variant="outline"
              title={config.desc}
              onClick={() => add(type)}
              className="h-8 gap-1.5 bg-white px-2.5 text-xs font-medium shadow-2xs dark:bg-card"
            >
              <Plus className="size-3.5 text-primary" />
              <Icon className="size-3.5 text-muted-foreground" />
              {config.label}
            </Button>
          );
        })}
      </div>

      {length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-4 py-10 text-center">
          <FileText className="mb-3 size-10 text-muted-foreground/40" />
          <h4 className="text-sm font-bold text-foreground">Chưa có khối nội dung nào</h4>
          <p className="mb-4 mt-1 max-w-md text-xs text-muted-foreground">
            Mỗi khối có 2 cột: Tiếng Việt bên trái, English bên phải. Ảnh và video chọn một lần dùng cho cả hai.
          </p>
          <Button type="button" size="sm" onClick={() => add("rich-text")} className="gap-1.5 text-xs font-semibold">
            <Plus className="size-3.5" /> Thêm đoạn văn bản đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <BilingualColumnsHeader />
          {Array.from({ length }, (_, index) => {
            const vi = lists.vi[index];
            const en = lists.en[index];
            const master = (vi ?? en)!;
            const config = blockConfigs[master.type] ?? { label: "Khối nội dung", icon: FileText, desc: "" };
            const Icon = config.icon;
            const mismatch = vi && en && vi.type !== en.type;

            return (
              <div key={`${master.id}-${index}`} className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{config.label}</span>
                    {(mismatch || !vi || !en) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="size-3" /> {mismatch ? "2 bản khác loại khối" : "Thiếu một ngôn ngữ"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" disabled={index === 0} title="Di chuyển lên" aria-label="Di chuyển lên" onClick={() => move(index, -1)} className="size-7 text-muted-foreground disabled:opacity-30">
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" disabled={index === length - 1} title="Di chuyển xuống" aria-label="Di chuyển xuống" onClick={() => move(index, 1)} className="size-7 text-muted-foreground disabled:opacity-30">
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title="Xóa khối (cả 2 ngôn ngữ)" aria-label={`Xóa khối ${index + 1}`} onClick={() => remove(index)} className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {hasShared(master.type) && !mismatch && (
                  <div className="space-y-1.5 border-b border-dashed border-border/70 bg-slate-50/60 px-4 py-3 dark:bg-muted/10">
                    <SharedBadge />
                    <SharedSettings block={master} onChange={(block) => setShared(index, block)} />
                  </div>
                )}

                <div className="grid gap-4 p-4 md:grid-cols-2 md:divide-x md:divide-border/60">
                  {LANGS.map((lang) => {
                    const block = lists[lang][index];
                    const otherLang: Lang = lang === "vi" ? "en" : "vi";
                    const other = lists[otherLang][index];
                    return (
                      <div key={lang} id={blockDomId(index, lang)} className={cn("space-y-3 rounded-lg transition", lang === "en" && "md:pl-4")}>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground md:hidden">
                          {LANG_META[lang].flag} {LANG_META[lang].name}
                        </span>
                        {!block ? (
                          <div className="space-y-2 rounded-lg border border-dashed border-amber-400 bg-amber-50/40 p-3 text-xs dark:bg-amber-500/5">
                            <p className="font-medium text-amber-800 dark:text-amber-300">Bản {LANG_META[lang].name} chưa có khối này.</p>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSide(index, lang, scaffoldCounterpart(other!))}>
                                Tạo khối trống để dịch
                              </Button>
                              <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSide(index, lang, structuredClone(other!))}>
                                Chép nguyên từ bản {LANG_META[otherLang].short}
                              </Button>
                            </div>
                          </div>
                        ) : mismatch && lang === "en" ? (
                          <div className="space-y-2 rounded-lg border border-dashed border-amber-400 bg-amber-50/40 p-3 text-xs dark:bg-amber-500/5">
                            <p className="font-medium text-amber-800 dark:text-amber-300">
                              Bản English đang là khối “{blockConfigs[block.type].label}”, khác bản Tiếng Việt.
                            </p>
                            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSide(index, "en", scaffoldCounterpart(vi!))}>
                              Đổi bản English thành “{blockConfigs[vi!.type].label}”
                            </Button>
                          </div>
                        ) : (
                          <BlockSide block={block} other={other} lang={lang} onChange={(next) => setSide(index, lang, next)} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
