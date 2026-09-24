"use client";

import {
  ArrowDown,
  ArrowUp,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";
import { MediaPicker } from "./MediaPicker";

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const blockConfigs: Record<
  ContentBlock["type"],
  { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }
> = {
  "rich-text": {
    label: "Văn bản",
    icon: FileText,
    desc: "Đoạn văn có tiêu đề & nội dung",
  },
  image: {
    label: "Hình ảnh",
    icon: ImageIcon,
    desc: "Ảnh đơn lẻ kèm mô tả & chú thích",
  },
  gallery: {
    label: "Thư viện ảnh",
    icon: LayoutGrid,
    desc: "Bộ sưu tập nhiều hình ảnh",
  },
  quote: {
    label: "Trích dẫn",
    icon: Quote,
    desc: "Câu trích dẫn & tác giả / nguồn",
  },
  "feature-list": {
    label: "Danh sách",
    icon: ListChecks,
    desc: "Danh sách các điểm nổi bật hoặc đánh số",
  },
  video: {
    label: "Video",
    icon: Video,
    desc: "Video từ YouTube hoặc đường dẫn URL",
  },
  divider: {
    label: "Đường phân cách",
    icon: Minus,
    desc: "Nét kẻ phân chia các phần",
  },
};

function createBlock(type: ContentBlock["type"], explicitId?: string): ContentBlock {
  const id = explicitId || createId();
  switch (type) {
    case "rich-text":
      return { id, type, heading: "", content: "" };
    case "image":
      return { id, type, image: { url: "/images/news-project-coordination.webp", alt: "" } };
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

/**
 * Creates a counterpart block in the opposite language matching the structure and ID
 */
function scaffoldCounterpartBlock(source: ContentBlock, existingCounterpart?: ContentBlock): ContentBlock {
  const id = source.id;
  const type = source.type;

  // If counterpart already exists with matching type, preserve its localized text while syncing structure
  if (existingCounterpart && existingCounterpart.type === type) {
    switch (type) {
      case "rich-text":
        {
        const counterpart = existingCounterpart as Extract<ContentBlock, { type: "rich-text" }>;
        return {
          id,
          type,
          heading: counterpart.heading ?? "",
          content: counterpart.content ?? "",
        };
        }
      case "image":
        {
        const counterpart = existingCounterpart as Extract<ContentBlock, { type: "image" }>;
        return {
          id,
          type,
          image: {
            url: source.image.url || counterpart.image.url || "",
            alt: counterpart.image.alt ?? "",
            caption: counterpart.image.caption ?? source.image.caption,
          },
        };
        }
      case "gallery":
        return {
          id,
          type,
          images: source.images || [],
        };
      case "quote":
        {
        const counterpart = existingCounterpart as Extract<ContentBlock, { type: "quote" }>;
        return {
          id,
          type,
          quote: counterpart.quote ?? "",
          author: counterpart.author ?? source.author ?? "",
        };
        }
      case "feature-list": {
        const sourceItems = source.items || [];
        const counterpart = existingCounterpart as Extract<ContentBlock, { type: "feature-list" }>;
        const existingItems = counterpart.items || [];
        const items = sourceItems.map((_: string, idx: number) => existingItems[idx] ?? "");
        return {
          id,
          type,
          heading: counterpart.heading ?? "",
          items: items.length > 0 ? items : [""],
          ordered: source.ordered ?? false,
        };
      }
      case "video":
        {
        const counterpart = existingCounterpart as Extract<ContentBlock, { type: "video" }>;
        return {
          id,
          type,
          url: source.url || counterpart.url || "",
          title: counterpart.title ?? "",
        };
        }
      case "divider":
        return { id, type };
    }
  }

  // Otherwise create a fresh scaffold matching the source structure
  switch (type) {
    case "rich-text":
      return { id, type, heading: "", content: "" };
    case "image":
      return {
        id,
        type,
        image: {
          url: source.image?.url || "/images/news-project-coordination.webp",
          alt: "",
          caption: source.image?.caption || "",
        },
      };
    case "gallery":
      return { id, type, images: source.images || [] };
    case "quote":
      return { id, type, quote: "", author: source.author || "" };
    case "feature-list": {
      const sourceItems = source.items || [""];
      return {
        id,
        type,
        heading: "",
        items: sourceItems.map(() => ""),
        ordered: source.ordered ?? false,
      };
    }
    case "video":
      return { id, type, url: source.url || "", title: "" };
    case "divider":
      return { id, type };
  }
}

export interface BilingualContentBlockEditorProps {
  valueVi?: ContentBlock[];
  valueEn?: ContentBlock[];
  activeLang?: "vi" | "en";
  onChangeBilingual?: (payload: { contentBlocks_vi: ContentBlock[]; contentBlocks: ContentBlock[] }) => void;
  // Backward compatibility props
  value?: ContentBlock[];
  onChange?: (value: ContentBlock[]) => void;
}

export function ContentBlockEditor({
  valueVi,
  valueEn,
  activeLang = "vi",
  onChangeBilingual,
  value,
  onChange,
}: BilingualContentBlockEditorProps) {
  // Support both dual bilingual mode and single array mode
  const isBilingualMode = Boolean(onChangeBilingual);
  const blocksVi = valueVi ?? value ?? [];
  const blocksEn = valueEn ?? [];
  const currentList = isBilingualMode ? (activeLang === "en" ? blocksEn : blocksVi) : (value ?? []);
  const counterpartList = activeLang === "en" ? blocksVi : blocksEn;

  const emitBilingual = (nextActive: ContentBlock[], nextCounterpart: ContentBlock[]) => {
    if (onChangeBilingual) {
      if (activeLang === "en") {
        onChangeBilingual({ contentBlocks: nextActive, contentBlocks_vi: nextCounterpart });
      } else {
        onChangeBilingual({ contentBlocks_vi: nextActive, contentBlocks: nextCounterpart });
      }
    } else if (onChange) {
      onChange(nextActive);
    }
  };

  const update = (index: number, block: ContentBlock) => {
    const nextActive = currentList.map((item, itemIndex) => (itemIndex === index ? block : item));
    if (!isBilingualMode) {
      onChange?.(nextActive);
      return;
    }

    // When updating media assets / non-text structures, sync them to counterpart
    const counterpartMap = new Map(counterpartList.map((item) => [item.id, item]));
    const nextCounterpart = nextActive.map((activeItem) => {
      const existing = counterpartMap.get(activeItem.id);
      if (!existing) return scaffoldCounterpartBlock(activeItem);

      // If this is the edited block, sync shared non-translatable attributes
      if (activeItem.id === block.id) {
        if (block.type === "image") {
          const existingImage = existing as Extract<ContentBlock, { type: "image" }>;
          return {
            ...existing,
            image: {
              ...existingImage.image,
              url: block.image.url,
            },
          };
        }
        if (block.type === "gallery") {
          return {
            ...existing,
            images: block.images,
          };
        }
        if (block.type === "video") {
          return {
            ...existing,
            url: block.url,
          };
        }
        if (block.type === "feature-list") {
          const existingFeatureList = existing as Extract<ContentBlock, { type: "feature-list" }>;
          const activeItems = block.items || [];
          const existingItems = existingFeatureList.items || [];
          const syncedItems = activeItems.map((_: string, idx: number) => existingItems[idx] ?? "");
          return {
            ...existing,
            items: syncedItems.length > 0 ? syncedItems : [""],
            ordered: block.ordered,
          };
        }
      }
      return existing;
    });

    emitBilingual(nextActive, nextCounterpart);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= currentList.length) return;
    const nextActive = [...currentList];
    [nextActive[index], nextActive[target]] = [nextActive[target], nextActive[index]];

    if (!isBilingualMode) {
      onChange?.(nextActive);
      return;
    }

    // Align counterpart order strictly by matching ID sequence
    const counterpartMap = new Map(counterpartList.map((item) => [item.id, item]));
    const nextCounterpart = nextActive.map((activeItem) => {
      const existing = counterpartMap.get(activeItem.id);
      return existing ? existing : scaffoldCounterpartBlock(activeItem);
    });

    emitBilingual(nextActive, nextCounterpart);
  };

  const addBlock = (type: ContentBlock["type"]) => {
    const newId = createId();
    const newBlockActive = createBlock(type, newId);
    const nextActive = [...currentList, newBlockActive];

    if (!isBilingualMode) {
      onChange?.(nextActive);
      return;
    }

    const newBlockCounterpart = scaffoldCounterpartBlock(newBlockActive);
    const nextCounterpart = [...counterpartList, newBlockCounterpart];
    emitBilingual(nextActive, nextCounterpart);
  };

  const removeBlock = (index: number) => {
    const targetBlock = currentList[index];
    if (!targetBlock) return;
    const nextActive = currentList.filter((_, itemIndex) => itemIndex !== index);

    if (!isBilingualMode) {
      onChange?.(nextActive);
      return;
    }

    // Remove matching ID from counterpart
    const nextCounterpart = counterpartList.filter((item) => item.id !== targetBlock.id);
    emitBilingual(nextActive, nextCounterpart);
  };

  const syncStructure = () => {
    if (!isBilingualMode) return;
    const counterpartMap = new Map(counterpartList.map((item) => [item.id, item]));
    const nextCounterpart = currentList.map((activeItem) => {
      const existing = counterpartMap.get(activeItem.id);
      return existing && existing.type === activeItem.type
        ? existing
        : scaffoldCounterpartBlock(activeItem, existing);
    });
    emitBilingual(currentList, nextCounterpart);
  };

  const isAligned =
    isBilingualMode &&
    currentList.length === counterpartList.length &&
    currentList.every((item, i) => counterpartList[i]?.id === item.id && counterpartList[i]?.type === item.type);

  return (
    <div className="space-y-4">
      {/* TOOLBAR ADD BLOCKS & BILINGUAL SYNC STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-border bg-slate-50/80 dark:bg-muted/30 p-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[13px] font-medium text-slate-700 dark:text-foreground">
            Thêm khối nội dung:
          </span>
          <span className="text-[11px] font-semibold text-foreground bg-background px-2 py-0.5 rounded-md border border-border">
            {currentList.length} khối
          </span>
          {isBilingualMode && (
            <div className="flex items-center gap-1.5">
              {isAligned ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                  ● Đồng bộ song ngữ 100%
                </span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={syncStructure}
                  className="h-6 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 px-2 rounded-full"
                >
                  ⚡ Đồng bộ cấu trúc 2 ngôn ngữ
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(blockConfigs) as Array<ContentBlock["type"]>).map((type) => {
            const config = blockConfigs[type];
            const Icon = config.icon;
            return (
              <Button
                key={type}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addBlock(type)}
                className="h-8 gap-1.5 px-2.5 text-xs font-medium bg-white dark:bg-card border-slate-200 dark:border-border shadow-2xs hover:bg-slate-100 dark:hover:bg-accent"
              >
                <Plus className="size-3.5 text-primary" />
                <Icon className="size-3.5 text-muted-foreground" />
                <span>{config.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* BLOCKS LIST */}
      {currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-border/60 py-10 px-4 text-center bg-slate-50/40 dark:bg-transparent">
          <FileText className="size-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-sm font-bold text-foreground">Chưa có khối nội dung nào</h4>
          <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
            Bấm vào các nút bên trên để thêm đoạn văn bản, hình ảnh, trích dẫn hoặc danh sách cho bài viết (tự động đồng bộ cấu trúc sang cả Tiếng Việt và Tiếng Anh).
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => addBlock("rich-text")}
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="size-3.5" /> Thêm đoạn văn bản đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {currentList.map((block, index) => {
            const config = blockConfigs[block.type] ?? {
              label: "Khối nội dung",
              icon: FileText,
              desc: "",
            };
            const Icon = config.icon;

            return (
              <div
                key={block.id}
                className="overflow-hidden rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs transition hover:border-slate-300 dark:hover:border-border/80"
              >
                {/* BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 bg-slate-50/70 dark:bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary font-mono">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-foreground">
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      aria-label="Di chuyển lên"
                      title="Di chuyển lên"
                      onClick={() => move(index, -1)}
                      className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === currentList.length - 1}
                      aria-label="Di chuyển xuống"
                      title="Di chuyển xuống"
                      onClick={() => move(index, 1)}
                      className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Xóa khối ${index + 1}`}
                      title="Xóa khối này (đồng bộ xóa cả 2 ngôn ngữ)"
                      onClick={() => removeBlock(index)}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* BLOCK BODY */}
                <div className="p-4 space-y-3.5">
                  {/* RICH TEXT */}
                  {block.type === "rich-text" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                          Tiêu đề đoạn (Tùy chọn)
                        </label>
                        <Input
                          value={block.heading ?? ""}
                          onChange={(e) =>
                            update(index, { ...block, heading: e.target.value })
                          }
                          placeholder="Ví dụ: Giới thiệu giải pháp BIM cho doanh nghiệp"
                          className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                          Nội dung đoạn văn
                        </label>
                        <Textarea
                          rows={6}
                          value={block.content}
                          onChange={(e) =>
                            update(index, { ...block, content: e.target.value })
                          }
                          placeholder="Nhập nội dung văn bản chi tiết ở đây..."
                          className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm leading-relaxed"
                        />
                      </div>
                    </>
                  )}

                  {/* IMAGE */}
                  {block.type === "image" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MediaPicker
                          label="Chọn ảnh từ Thư viện"
                          onSelect={(media) =>
                            update(index, {
                              ...block,
                              image: {
                                ...block.image,
                                url: media.url,
                                alt: block.image.alt || media.alt,
                              },
                            })
                          }
                        />
                        {block.image.url && (
                          <span className="truncate text-xs text-muted-foreground font-mono max-w-xs">
                            {block.image.url}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                            Văn bản thay thế (Alt text cho SEO)
                          </label>
                          <Input
                            value={block.image.alt}
                            onChange={(e) =>
                              update(index, {
                                ...block,
                                image: { ...block.image, alt: e.target.value },
                              })
                            }
                            placeholder="Mô tả hình ảnh..."
                            className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                            Chú thích dưới ảnh (Caption)
                          </label>
                          <Input
                            value={block.image.caption ?? ""}
                            onChange={(e) =>
                              update(index, {
                                ...block,
                                image: { ...block.image, caption: e.target.value },
                              })
                            }
                            placeholder="Chú thích hiển thị dưới hình..."
                            className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GALLERY */}
                  {block.type === "gallery" && (
                    <div className="space-y-3">
                      <MediaPicker
                        label="Thêm ảnh vào Thư viện"
                        onSelect={(media) =>
                          update(index, {
                            ...block,
                            images: [...block.images, media],
                          })
                        }
                      />
                      {block.images.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          Chưa có hình ảnh nào trong bộ sưu tập này.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {block.images.map((image, imageIndex) => (
                            <div
                              key={`${image.url}-${imageIndex}`}
                              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/20 p-2.5"
                            >
                              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                                {image.alt || image.url}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  update(index, {
                                    ...block,
                                    images: block.images.filter((_, i) => i !== imageIndex),
                                  })
                                }
                                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                Xóa
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* QUOTE */}
                  {block.type === "quote" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                          Nội dung trích dẫn
                        </label>
                        <Textarea
                          rows={3}
                          value={block.quote}
                          onChange={(e) =>
                            update(index, { ...block, quote: e.target.value })
                          }
                          placeholder="Nhập câu danh ngôn, trích dẫn ý kiến chuyên gia..."
                          className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm italic"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                          Tác giả / Nguồn phát biểu
                        </label>
                        <Input
                          value={block.author ?? ""}
                          onChange={(e) =>
                            update(index, { ...block, author: e.target.value })
                          }
                          placeholder="Ví dụ: ThS. KTS Nguyễn Văn A - Trưởng phòng BIM"
                          className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* FEATURE LIST */}
                  {block.type === "feature-list" && (
                    <>
                      <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Danh sách mục / tính năng hiển thị chi tiết trong <strong>thân bài viết</strong>.</span>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                          Tiêu đề danh sách (Tùy chọn)
                        </label>
                        <Input
                          value={block.heading ?? ""}
                          onChange={(e) =>
                            update(index, { ...block, heading: e.target.value })
                          }
                          placeholder="Ví dụ: Các tính năng & phạm vi thực thi"
                          className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                          Danh sách mục (Mỗi mục trên một dòng riêng)
                        </label>
                        <Textarea
                          rows={5}
                          value={block.items.join("\n")}
                          onChange={(e) =>
                            update(index, {
                              ...block,
                              items: e.target.value.split("\n"),
                            })
                          }
                          placeholder="Mục 1&#10;Mục 2&#10;Mục 3"
                          className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm font-sans"
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-foreground">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                          checked={block.ordered}
                          onChange={(e) =>
                            update(index, { ...block, ordered: e.target.checked })
                          }
                        />
                        Hiển thị dạng danh sách đánh số (1, 2, 3...)
                      </label>
                    </>
                  )}

                  {/* VIDEO */}
                  {block.type === "video" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                          Tiêu đề Video
                        </label>
                        <Input
                          value={block.title ?? ""}
                          onChange={(e) =>
                            update(index, { ...block, title: e.target.value })
                          }
                          placeholder="Tiêu đề video giới thiệu..."
                          className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-700 dark:text-foreground">
                          Đường dẫn URL Video (YouTube / MP4)
                        </label>
                        <Input
                          value={block.url}
                          onChange={(e) =>
                            update(index, { ...block, url: e.target.value })
                          }
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="bg-white dark:bg-card border-slate-200 dark:border-border text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* DIVIDER */}
                  {block.type === "divider" && (
                    <div className="py-2 text-center text-xs text-muted-foreground italic border-t border-dashed border-slate-200 dark:border-border">
                      Đường phân cách phân chia nội dung (Sẽ hiển thị nét kẻ ngăn cách trang ngoài Website).
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
