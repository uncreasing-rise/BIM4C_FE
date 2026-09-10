import type { ContentEntry } from "@/types/content";
import { englishContent } from "@/lib/content/english-content";
import {
  blogEntries as rawBlogEntries,
  courseEntries as rawCourseEntries,
  projectEntries as rawProjectEntries,
  serviceEntries as rawServiceEntries,
} from "./content-data";

// Keep every public-facing mock entry on BIM4C-owned, neutral imagery.
// Legacy seed data may still reference old campaign photos, so normalize them
// at the boundary before any page or API consumes the entries.
function normalizeImages(entries: ContentEntry[]): ContentEntry[] {
  return entries.map((entry) => ({
    ...entry,
    image:
      entry.image === "/images/about.jpg"
        ? "/images/news-project-coordination.webp"
        : entry.image === "/images/hero.jpg"
          ? "/images/news-project-coordination.webp"
          : entry.image === "/images/service-training.jpg"
            ? "/images/news-bim-training.webp"
            : entry.image,
  }));
}

function enrich(entries: ContentEntry[]): ContentEntry[] {
  return entries.map((entry) => ({
    ...entry,
    sections: entry.sections.map((section, index) => ({
      ...section,
      unorderedList:
        index === 0 && !section.unorderedList
          ? entry.highlights
          : section.unorderedList,
      quote:
        index === entry.sections.length - 1 && !section.quote
          ? entry.description
          : section.quote,
    })),
  }));
}

export const serviceEntries = normalizeImages(enrich(rawServiceEntries)).map(
  englishContent,
);
export const projectEntries = normalizeImages(enrich(rawProjectEntries)).map(
  englishContent,
);
export const courseEntries = normalizeImages(enrich(rawCourseEntries)).map(
  englishContent,
);
export const blogEntries = normalizeImages(enrich(rawBlogEntries)).map(
  englishContent,
);
export type { ContentEntry, ContentSection } from "@/types/content";
