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
  description: string;
  image: string;
  eyebrow: string;
  meta?: string;
  sections: ContentSection[];
  highlights: string[];
  contentBlocks?: import("@/features/shared/schemas/content-block.schema").ContentBlock[];
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  canonicalUrl?: string;
  authorName?: string;
  relatedIds?: string[];
  status?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  duration?: string;
  level?: string;
  price?: string;
  instructor?: string;
  learningOutcomes?: string[];
  gallery?: ContentMedia[];
  curriculum?: { id?: string; title: string; description?: string; sortOrder?: number }[];
}
