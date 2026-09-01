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
  sections: ContentSectionDto[];
  highlights: string[];
}
