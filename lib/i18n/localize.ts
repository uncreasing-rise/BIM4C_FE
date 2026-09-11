import { englishContent } from "@/lib/content/english-content";
import type { Locale } from "./config";

/**
 * Localizes any structured content entry based on the requested locale.
 * - 'vi': Uses explicit Vietnamese authored fields (e.g. title_vi, description_vi) if present,
 *         or returns raw Vietnamese content.
 * - 'en': Uses explicit English authored fields if present, or applies the dictionary translation.
 */
export function localizeContent<T extends { title: string }>(
  entry: T,
  locale: Locale = "en",
): T {
  const item = entry as T & {
    title_vi?: string | null;
    description_vi?: string | null;
    eyebrow_vi?: string | null;
    highlights_vi?: string[];
    seoTitle_vi?: string | null;
    seoDescription_vi?: string | null;
    title_en?: string | null;
    description_en?: string | null;
    eyebrow_en?: string | null;
    highlights_en?: string[];
  };

  if (locale === "vi") {
    if (item.title_vi || item.description_vi || item.eyebrow_vi || item.highlights_vi) {
      return {
        ...entry,
        title: item.title_vi || entry.title,
        ...(item.description_vi ? { description: item.description_vi } : {}),
        ...(item.eyebrow_vi ? { eyebrow: item.eyebrow_vi } : {}),
        ...(item.highlights_vi?.length ? { highlights: item.highlights_vi } : {}),
        ...(item.seoTitle_vi ? { seoTitle: item.seoTitle_vi } : {}),
        ...(item.seoDescription_vi ? { seoDescription: item.seoDescription_vi } : {}),
      };
    }
    return entry;
  }

  // Locale is English
  if (item.title_en || item.description_en || item.eyebrow_en) {
    return {
      ...entry,
      title: item.title_en || entry.title,
      ...(item.description_en ? { description: item.description_en } : {}),
      ...(item.eyebrow_en ? { eyebrow: item.eyebrow_en } : {}),
      ...(item.highlights_en?.length ? { highlights: item.highlights_en } : {}),
    };
  }

  return englishContent(entry);
}

/**
 * Localizes an array of content items according to locale.
 */
export function localizeContentList<T extends { title: string }>(
  entries: T[],
  locale: Locale = "en",
): T[] {
  return entries.map((item) => localizeContent(item, locale));
}

