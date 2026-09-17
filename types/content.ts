export interface ContentMedia {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ContentSection {
  title: string;
  body: string;
  images?: ContentMedia[];
  imageLayout?: "stack" | "grid";
  unorderedList?: string[];
  orderedList?: string[];
  quote?: string;
  videoUrl?: string;
}

export interface ContentEntry {
  id?: string;
  slug: string;
  title: string;
  title_vi?: string | null;
  title_en?: string | null;
  description: string;
  description_vi?: string | null;
  description_en?: string | null;
  image: string;
  eyebrow: string;
  eyebrow_vi?: string | null;
  eyebrow_en?: string | null;
  meta?: string;
  meta_vi?: string | null;
  meta_en?: string | null;
  sections: ContentSection[];
  highlights: string[];
  highlights_vi?: string[];
  highlights_en?: string[];
  sections_vi?: ContentSection[];
  sections_en?: ContentSection[];
  contentBlocks?: import("@/features/shared/schemas/content-block.schema").ContentBlock[];
  contentBlocks_vi?: import("@/features/shared/schemas/content-block.schema").ContentBlock[];
  contentBlocks_en?: import("@/features/shared/schemas/content-block.schema").ContentBlock[];
  seoTitle?: string;
  seoTitle_vi?: string | null;
  seoDescription?: string;
  seoDescription_vi?: string | null;
  seoImage?: string;
  canonicalUrl?: string;
  authorName?: string;
  relatedIds?: string[];
  status?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  category_en?: string | null;
  duration?: string;
  duration_vi?: string | null;
  duration_en?: string | null;
  level?: string;
  level_vi?: string | null;
  level_en?: string | null;
  price?: string;
  price_vi?: string | null;
  price_en?: string | null;
  instructor?: string;
  instructor_vi?: string | null;
  instructor_en?: string | null;
  learningOutcomes?: string[];
  learningOutcomes_vi?: string[];
  learningOutcomes_en?: string[];
  gallery?: ContentMedia[];
  curriculum?: { id?: string; title: string; description?: string; sortOrder?: number }[];
  curriculum_vi?: { id?: string; title: string; description?: string; sortOrder?: number }[];
  curriculum_en?: { id?: string; title: string; description?: string; sortOrder?: number }[];
}

