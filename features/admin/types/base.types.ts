import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";

export type AdminContentType =
  | "Dự án"
  | "Tin tức"
  | "Chuyên môn"
  | "Khóa học"
  | "Dịch vụ";

export type AdminContentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED"
  | "PROFILED"
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface AdminContentBlock {
  title: string;
  body: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
}

/** Base Content fields shared across all content types */
export interface AdminBaseContent {
  id: string;
  type: AdminContentType;
  title: string;
  slug: string;
  image: string;
  status: AdminContentStatus;
  description: string;
  eyebrow: string;
  meta: string | null;
  highlights: string[];
  sections: AdminContentBlock[];
  publishedAt: string | null;
  updatedAt: string;
  sortOrder: number;
  contentBlocks?: ContentBlock[];

  // SEO
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  canonicalUrl?: string | null;
  relatedIds?: string[];

  // Bilingual translation fields (VI)
  title_vi?: string | null;
  description_vi?: string | null;
  eyebrow_vi?: string | null;
  meta_vi?: string | null;
  highlights_vi?: string[];
  sections_vi?: { title: string; body: string }[];
  contentBlocks_vi?: ContentBlock[];
  seoTitle_vi?: string | null;
  seoDescription_vi?: string | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageResult<T> {
  data: T[];
  meta: PageMeta;
}

export interface ContentFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  sort?: string;
}
