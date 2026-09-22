import type { AdminBaseContent, AdminCategory, ContentFilterQuery } from "./base.types";

/** Post Content (Tin tức, Chuyên môn, Blog) */
export interface AdminPostContent extends AdminBaseContent {
  type: "Tin tức" | "Chuyên môn";
  categoryId?: string | null;
  category?: AdminCategory | null;
  authorName?: string | null;
}

export type PostFilterQuery = ContentFilterQuery;

export interface CreatePostPayload {
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
  categoryId?: string | null;
  authorName?: string | null;
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

export type UpdatePostPayload = Partial<CreatePostPayload>;
