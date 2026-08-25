export interface ContentSectionDto {
  title: string;
  body: string;
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
