export interface ContentSection {
  title: string;
  body: string;
}

export interface ContentEntry {
  slug: string;
  title: string;
  description: string;
  image: string;
  eyebrow: string;
  meta?: string;
  sections: ContentSection[];
  highlights: string[];
}

