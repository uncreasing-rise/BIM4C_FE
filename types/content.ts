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
}
