export interface ContentSectionDto {
  title: string;
  body: string;
  images?: {
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  }[];
  imageLayout?: "stack" | "grid";
  unorderedList?: string[];
  orderedList?: string[];
  quote?: string;
  videoUrl?: string;
}

export interface ContentEntryDto {
  id?: string | null;
  slug: string;
  title: string;
  title_vi?: string | null;
  description: string;
  description_vi?: string | null;
  image: string;
  eyebrow: string;
  eyebrow_vi?: string | null;
  category?: string | { name?: string | null } | null;
  meta?: string | null;
  meta_vi?: string | null;
  sections?: ContentSectionDto[];
  highlights: string[];
  highlights_vi?: string[] | null;
  sections_vi?: ContentSectionDto[] | null;
  contentBlocks?: unknown;
  contentBlocks_vi?: unknown;
  seoTitle?: string | null;
  seoTitle_vi?: string | null;
  seoDescription?: string | null;
  seoDescription_vi?: string | null;
  seoImage?: string | null;
  canonicalUrl?: string | null;
  authorName?: string | null;
  relatedIds?: string[] | null;
  status?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  duration?: string | null;
  duration_vi?: string | null;
  level?: string | null;
  level_vi?: string | null;
  price?: string | number | null;
  price_vi?: string | number | null;
  instructor?: string | null;
  instructor_vi?: string | null;
  learningOutcomes?: string[] | null;
  learningOutcomes_vi?: string[] | null;
  gallery?: ContentSectionDto["images"];
  curriculum?: { id?: string; title: string; description?: string | null; sortOrder?: number }[] | null;
}
