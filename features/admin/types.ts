import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";

export type AdminContentType = "Dự án" | "Tin tức" | "Khóa học" | "Dịch vụ";
export type AdminContentStatus =
  "DRAFT" | "PUBLISHED" | "ARCHIVED" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";
export interface AdminContentBlock {
  title: string;
  body: string;
}
export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
}
export interface AdminContent {
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
  isFeatured?: boolean;
  categoryId?: string | null;
  category?: AdminCategory | null;
  location?: string;
  year?: number;
  investor?: string | null;
  expectedCompletion?: string | null;
  scale?: string | null;
  contractPackage?: string | null;
  authorName?: string | null;
  images?: {
    id: string;
    url: string;
    alt: string;
    caption?: string | null;
    sortOrder: number;
  }[];
  curriculum?: {
    id: string;
    title: string;
    description: string;
    sortOrder: number;
  }[];
  contentBlocks?: ContentBlock[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  canonicalUrl?: string | null;
  relatedIds?: string[];
  duration?: string | null;
  level?: string | null;
  price?: string | null;
  instructor?: string | null;
  learningOutcomes?: string[];
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
