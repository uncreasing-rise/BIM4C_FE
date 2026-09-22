import type {
  AdminBaseContent,
  AdminContentStatus,
} from "../types/base.types";

export function normalizeStatus(status: unknown): AdminContentStatus {
  if (typeof status !== "string") return "DRAFT";
  const upper = status.trim().toUpperCase();
  if (upper === "ACTIVE") return "PUBLISHED";
  if (upper === "INACTIVE") return "ARCHIVED";
  if (
    [
      "DRAFT",
      "PUBLISHED",
      "ARCHIVED",
      "PLANNED",
      "IN_PROGRESS",
      "COMPLETED",
    ].includes(upper)
  ) {
    return upper as AdminContentStatus;
  }
  return "DRAFT";
}

export function serializeBaseContent(data: Partial<AdminBaseContent>): Record<string, unknown> {
  const result: Record<string, unknown> = {
    title: (data.title || data.title_vi || "").trim(),
    slug: (data.slug || "").trim(),
    image: (data.image || "").trim(),
    status: normalizeStatus(data.status),
    description: (data.description || data.description_vi || "").trim(),
    eyebrow: (data.eyebrow || data.eyebrow_vi || "").trim(),
    meta: data.meta ? data.meta.trim() : null,
    highlights: Array.isArray(data.highlights)
      ? data.highlights.map((h) => String(h).trim()).filter(Boolean)
      : [],
    sections: Array.isArray(data.sections)
      ? data.sections.map((s) => ({
          title: String(s.title || "").trim(),
          body: String(s.body || "").trim(),
        }))
      : [],
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
  };

  if (Array.isArray(data.contentBlocks) && data.contentBlocks.length > 0) {
    result.contentBlocks = data.contentBlocks;
  }

  // Bilingual fields (VI)
  if (data.title_vi) result.title_vi = data.title_vi.trim();
  if (data.description_vi) result.description_vi = data.description_vi.trim();
  if (data.eyebrow_vi) result.eyebrow_vi = data.eyebrow_vi.trim();
  if (data.meta_vi) result.meta_vi = data.meta_vi.trim();
  if (Array.isArray(data.highlights_vi) && data.highlights_vi.length > 0) {
    result.highlights_vi = data.highlights_vi.map((h) => String(h).trim()).filter(Boolean);
  }
  if (Array.isArray(data.sections_vi) && data.sections_vi.length > 0) {
    result.sections_vi = data.sections_vi.map((s) => ({
      title: String(s.title || "").trim(),
      body: String(s.body || "").trim(),
    }));
  }
  if (Array.isArray(data.contentBlocks_vi) && data.contentBlocks_vi.length > 0) {
    result.contentBlocks_vi = data.contentBlocks_vi;
  }

  // SEO fields
  if (data.seoTitle) result.seoTitle = data.seoTitle.trim();
  if (data.seoTitle_vi) result.seoTitle_vi = data.seoTitle_vi.trim();
  if (data.seoDescription) result.seoDescription = data.seoDescription.trim();
  if (data.seoDescription_vi) result.seoDescription_vi = data.seoDescription_vi.trim();
  if (data.seoImage) result.seoImage = data.seoImage.trim();
  if (data.canonicalUrl) result.canonicalUrl = data.canonicalUrl.trim();
  if (Array.isArray(data.relatedIds) && data.relatedIds.length > 0) {
    result.relatedIds = data.relatedIds;
  }
  if (data.publishedAt) {
    result.publishedAt = data.publishedAt;
  }

  return result;
}

export function createBaseEmptyContent(): AdminBaseContent {
  return {
    id: "",
    type: "Tin tức",
    title: "",
    slug: "",
    image: "",
    status: "DRAFT",
    description: "",
    eyebrow: "",
    meta: "",
    highlights: [],
    sections: [],
    contentBlocks: [],
    contentBlocks_vi: [],
    publishedAt: null,
    updatedAt: new Date().toISOString(),
    sortOrder: 0,
    title_vi: "",
    description_vi: "",
    eyebrow_vi: "",
    highlights_vi: [],
    seoTitle_vi: "",
    seoDescription_vi: "",
  };
}
