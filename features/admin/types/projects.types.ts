import type { AdminBaseContent, AdminCategory, ContentFilterQuery } from "./base.types";

export interface ProjectGalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string | null;
  sortOrder: number;
}

/** Project Content (Dự án kiến trúc, kết cấu, MEP...) */
export interface AdminProjectContent extends AdminBaseContent {
  type: "Dự án";
  categoryId?: string | null;
  category?: AdminCategory | null;
  location?: string;
  location_vi?: string | null;
  year?: number | null;
  investor?: string | null;
  investor_vi?: string | null;
  expectedCompletion?: string | null;
  expectedCompletion_vi?: string | null;
  scale?: string | null;
  scale_vi?: string | null;
  contractPackage?: string | null;
  contractPackage_vi?: string | null;
  isFeatured?: boolean;
  images?: ProjectGalleryImage[];
}

export type ProjectFilterQuery = ContentFilterQuery;

export interface CreateProjectPayload {
  title: string;
  slug: string;
  image: string;
  status: string;
  description: string;
  eyebrow?: string;
  meta?: string | null;
  highlights?: string[];
  sections?: { title: string; body: string }[];
  contentBlocks?: unknown[];
  categoryId?: string;
  location: string;
  location_vi?: string | null;
  year?: number | null;
  investor?: string | null;
  investor_vi?: string | null;
  expectedCompletion?: string | null;
  expectedCompletion_vi?: string | null;
  scale?: string | null;
  scale_vi?: string | null;
  contractPackage?: string | null;
  contractPackage_vi?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
  publishedAt?: string | null;
  title_vi?: string | null;
  description_vi?: string | null;
  eyebrow_vi?: string | null;
  meta_vi?: string | null;
  highlights_vi?: string[];
  sections_vi?: { title: string; body: string }[];
  contentBlocks_vi?: unknown[];
  seoTitle?: string | null;
  seoTitle_vi?: string | null;
  seoDescription?: string | null;
  seoDescription_vi?: string | null;
  seoImage?: string | null;
  canonicalUrl?: string | null;
  relatedIds?: string[];
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;
