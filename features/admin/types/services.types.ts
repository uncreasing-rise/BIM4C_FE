import type { AdminBaseContent, ContentFilterQuery } from "./base.types";

/** Service Content (Dịch vụ BIM, Tư vấn, Quét 3D...) */
export interface AdminServiceContent extends AdminBaseContent {
  type: "Dịch vụ";
}

export type ServiceFilterQuery = ContentFilterQuery;

export interface CreateServicePayload {
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

export type UpdateServicePayload = Partial<CreateServicePayload>;
