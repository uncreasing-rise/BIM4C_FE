import type { ContentEntry } from "@/types/content";
import { blogEntries as rawBlogEntries, courseEntries as rawCourseEntries, projectEntries as rawProjectEntries, serviceEntries as rawServiceEntries } from "./content-data";

function enrich(entries: ContentEntry[]): ContentEntry[] {
  return entries.map(entry => ({
    ...entry,
    sections: entry.sections.map((section, index) => ({
      ...section,
      unorderedList: index === 0 && !section.unorderedList ? entry.highlights : section.unorderedList,
      quote: index === entry.sections.length - 1 && !section.quote ? entry.description : section.quote,
    })),
  }));
}

export const serviceEntries = enrich(rawServiceEntries);
export const projectEntries = enrich(rawProjectEntries);
export const courseEntries = enrich(rawCourseEntries);
export const blogEntries = enrich(rawBlogEntries);
export type { ContentEntry, ContentSection } from "@/types/content";
