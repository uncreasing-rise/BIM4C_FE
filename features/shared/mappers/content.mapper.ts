import { getMediaUrl } from "@/lib/utils/media";
import { getSafeVideoUrl } from "@/lib/utils/safe-url";
import type { ContentEntry } from "@/types/content";
import type { ContentEntryDto } from "../types/content-dto";
import { parseContentBlocks, type ContentBlock } from "@/features/shared/schemas/content-block.schema";

export class ContentMappingError extends Error {
  constructor(field: string) {
    super(
      `Invalid content API contract: "${field}" is missing or has an invalid type.`,
    );
    this.name = "ContentMappingError";
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new ContentMappingError(field);
  return value;
}

export function mapContentDto(dto: ContentEntryDto): ContentEntry {
  if (!dto || typeof dto !== "object") throw new ContentMappingError("content");
  if (!Array.isArray(dto.sections) && !Array.isArray(dto.contentBlocks)) throw new ContentMappingError("sections/contentBlocks");
  if (
    !Array.isArray(dto.highlights) ||
    !dto.highlights.every((item) => typeof item === "string")
  )
    throw new ContentMappingError("highlights");
  const sections = (dto.sections ?? []).map((section, index) => ({
    title: requireString(section?.title, `sections[${index}].title`),
    body: requireString(section?.body, `sections[${index}].body`),
    images: section.images?.map((image, imageIndex) => ({
      url: requireString(image.url, `sections[${index}].images[${imageIndex}].url`), alt: image.alt?.trim() || "", caption: image.caption?.trim() || undefined, width: image.width, height: image.height,
    })),
    imageLayout: section.imageLayout,
    unorderedList: section.unorderedList?.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()),
    orderedList: section.orderedList?.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()),
    quote: section.quote?.trim() || undefined,
    videoUrl: getSafeVideoUrl(section.videoUrl),
  }));
  const legacyBlocks: ContentBlock[] = sections.flatMap((section, index) => {
    const prefix = `legacy-${index}`;
    const blocks: ContentBlock[] = [{ id: `${prefix}-text`, type: "rich-text", heading: section.title, content: section.body }];
    if (section.images?.length === 1) blocks.push({ id: `${prefix}-image`, type: "image", image: section.images[0] });
    if ((section.images?.length ?? 0) > 1) blocks.push({ id: `${prefix}-gallery`, type: "gallery", images: section.images! });
    if (section.unorderedList?.length) blocks.push({ id: `${prefix}-list`, type: "feature-list", items: section.unorderedList, ordered: false });
    if (section.orderedList?.length) blocks.push({ id: `${prefix}-ordered`, type: "feature-list", items: section.orderedList, ordered: true });
    if (section.quote) blocks.push({ id: `${prefix}-quote`, type: "quote", quote: section.quote });
    if (section.videoUrl) blocks.push({ id: `${prefix}-video`, type: "video", url: section.videoUrl });
    return blocks;
  });
  return {
    id: typeof dto.id === "string" && dto.id ? dto.id : undefined,
    slug: requireString(dto.slug, "slug"),
    title: requireString(dto.title, "title"),
    description: requireString(dto.description, "description"),
    image: getMediaUrl(requireString(dto.image, "image")),
    eyebrow: requireString(dto.eyebrow, "eyebrow"),
    meta: dto.meta ?? undefined,
    sections,
    contentBlocks: dto.contentBlocks === undefined ? legacyBlocks : parseContentBlocks(dto.contentBlocks),
    highlights: dto.highlights,
    seoTitle: dto.seoTitle?.trim() || undefined,
    seoDescription: dto.seoDescription?.trim() || undefined,
    seoImage: dto.seoImage ? getMediaUrl(dto.seoImage) : undefined,
    canonicalUrl: dto.canonicalUrl?.trim() || undefined,
    authorName: dto.authorName?.trim() || undefined,
    relatedIds: dto.relatedIds?.filter((item): item is string => typeof item === "string" && Boolean(item.trim())),
    status: dto.status ?? undefined,
    publishedAt: dto.publishedAt ?? undefined,
    createdAt: dto.createdAt ?? undefined,
    updatedAt: dto.updatedAt ?? undefined,
    duration: dto.duration?.trim() || undefined,
    level: dto.level?.trim() || undefined,
    price: dto.price == null ? undefined : String(dto.price),
    instructor: dto.instructor?.trim() || undefined,
    learningOutcomes: dto.learningOutcomes?.filter((item): item is string => typeof item === "string" && Boolean(item.trim())),
    gallery: dto.gallery?.map((image) => ({ url: getMediaUrl(image.url), alt: image.alt?.trim() || "", caption: image.caption?.trim() || undefined, width: image.width, height: image.height })),
    curriculum: dto.curriculum?.filter((item) => typeof item?.title === "string" && Boolean(item.title.trim())).map((item) => ({ id: item.id, title: item.title.trim(), description: item.description?.trim() || undefined, sortOrder: item.sortOrder })),
  };
}
