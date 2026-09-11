import type { ContentEntry } from "@/types/content";
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
      /(?:about\.jpg|hero\.jpg|project-(?:lumi|matrix|elysian)\.jpg)/iu.test(
        entry.image,
      )
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

// Preserve authored Vietnamese content in mock exports.
// Dynamic localization happens on the frontend/API via localizeContent/localizeContentList.
export const serviceEntries = normalizeImages(enrich(rawServiceEntries));
export const projectEntries = normalizeImages(enrich(rawProjectEntries));
export const courseEntries = normalizeImages(enrich(rawCourseEntries));
export const blogEntries = normalizeImages(enrich(rawBlogEntries));
export type { ContentEntry, ContentSection } from "@/types/content";
