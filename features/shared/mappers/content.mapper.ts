import { getMediaUrl } from "@/lib/utils/media";
import type { ContentEntry } from "@/types/content";
import type { ContentEntryDto } from "../types/content-dto";

export class ContentMappingError extends Error {
  constructor(field: string) {
    super(`Invalid content API contract: "${field}" is missing or has an invalid type.`);
    this.name = "ContentMappingError";
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new ContentMappingError(field);
  return value;
}

export function mapContentDto(dto: ContentEntryDto): ContentEntry {
  if (!dto || typeof dto !== "object") throw new ContentMappingError("content");
  if (!Array.isArray(dto.sections)) throw new ContentMappingError("sections");
  if (!Array.isArray(dto.highlights) || !dto.highlights.every(item => typeof item === "string")) throw new ContentMappingError("highlights");
  return {
    slug: requireString(dto.slug, "slug"),
    title: requireString(dto.title, "title"),
    description: requireString(dto.description, "description"),
    image: getMediaUrl(requireString(dto.image, "image")),
    eyebrow: requireString(dto.eyebrow, "eyebrow"),
    meta: dto.meta ?? undefined,
    sections: dto.sections.map((section, index) => ({
      title: requireString(section?.title, `sections[${index}].title`),
      body: requireString(section?.body, `sections[${index}].body`),
    })),
    highlights: dto.highlights,
  };
}
