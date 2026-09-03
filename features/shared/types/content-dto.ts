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
  description: string;
  image: string;
  eyebrow: string;
  category?: string | { name?: string | null } | null;
  meta?: string | null;
  sections?: ContentSectionDto[];
  highlights: string[];
  contentBlocks?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  canonicalUrl?: string | null;
  authorName?: string | null;
  relatedIds?: string[] | null;
  status?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  duration?: string | null;
  level?: string | null;
  price?: string | number | null;
  instructor?: string | null;
  learningOutcomes?: string[] | null;
  gallery?: ContentSectionDto["images"];
  curriculum?: { id?: string; title: string; description?: string | null; sortOrder?: number }[] | null;
}
