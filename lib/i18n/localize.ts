import { englishContent } from "@/lib/content/english-content";
import { toEnglishLabel, toVietnameseLabel } from "@/lib/utils/public-labels";
import type { Locale } from "./config";

/**
 * Localizes any structured content entry based on the requested locale.
 * - 'vi': Uses explicit Vietnamese authored fields (e.g. title_vi, description_vi) if present,
 *         or returns Vietnamese content.
 * - 'en': Uses explicit English authored fields if present, or applies the dictionary translation.
 */
export function localizeContent<T extends { title: string }>(
  entry: T,
  locale: Locale = "vi",
): T {
  if (!entry) return entry;

  const item = entry as T & {
    category?: string | null;
    status?: string | null;
    location?: string | null;
    title_vi?: string | null;
    description_vi?: string | null;
    eyebrow_vi?: string | null;
    highlights_vi?: string[];
    sections_vi?: T extends { sections?: infer S } ? S : never;
    contentBlocks_vi?: unknown;
    meta_vi?: string | null;
    duration_vi?: string | null;
    level_vi?: string | null;
    price_vi?: string | null;
    instructor_vi?: string | null;
    learningOutcomes_vi?: string[];
    location_vi?: string | null;
    investor_vi?: string | null;
    expectedCompletion_vi?: string | null;
    scale_vi?: string | null;
    contractPackage_vi?: string | null;
    seoTitle_vi?: string | null;
    seoDescription_vi?: string | null;
    title_en?: string | null;
    description_en?: string | null;
    eyebrow_en?: string | null;
    highlights_en?: string[];
    location_en?: string | null;
    category_en?: string | null;
  };

  if (locale === "vi") {
    return {
      ...entry,
      title: item.title_vi || toVietnameseLabel(entry.title),
      ...(item.description_vi ? { description: item.description_vi } : {}),
      ...(item.eyebrow_vi ? { eyebrow: item.eyebrow_vi } : {}),
      ...(item.meta_vi ? { meta: item.meta_vi } : {}),
      ...(item.highlights_vi?.length ? { highlights: item.highlights_vi } : {}),
      ...(item.sections_vi ? { sections: item.sections_vi } : {}),
      ...(item.contentBlocks_vi ? { contentBlocks: item.contentBlocks_vi } : {}),
      ...(item.duration_vi ? { duration: item.duration_vi } : {}),
      ...(item.level_vi ? { level: toVietnameseLabel(item.level_vi) } : {}),
      ...(item.price_vi ? { price: item.price_vi } : {}),
      ...(item.instructor_vi ? { instructor: item.instructor_vi } : {}),
      ...(item.learningOutcomes_vi?.length ? { learningOutcomes: item.learningOutcomes_vi } : {}),
      ...(item.location_vi
        ? { location: item.location_vi }
        : item.location
          ? { location: toVietnameseLabel(item.location) }
          : {}),
      ...(item.investor_vi ? { investor: item.investor_vi } : {}),
      ...(item.expectedCompletion_vi ? { expectedCompletion: item.expectedCompletion_vi } : {}),
      ...(item.scale_vi ? { scale: item.scale_vi } : {}),
      ...(item.contractPackage_vi ? { contractPackage: item.contractPackage_vi } : {}),
      ...(item.status ? { status: toVietnameseLabel(item.status) } : {}),
      ...(item.category ? { category: toVietnameseLabel(item.category) } : {}),
      ...(item.seoTitle_vi ? { seoTitle: item.seoTitle_vi } : {}),
      ...(item.seoDescription_vi ? { seoDescription: item.seoDescription_vi } : {}),
    };
  }

  // Locale is English
  if (item.title_en || item.description_en || item.eyebrow_en) {
    return {
      ...entry,
      title: item.title_en || toEnglishLabel(entry.title),
      ...(item.description_en ? { description: item.description_en } : {}),
      ...(item.eyebrow_en ? { eyebrow: toEnglishLabel(item.eyebrow_en) } : {}),
      ...(item.highlights_en?.length ? { highlights: item.highlights_en } : {}),
      ...(item.location ? { location: toEnglishLabel(item.location) } : {}),
      ...(item.status ? { status: toEnglishLabel(item.status) } : {}),
      ...(item.category ? { category: toEnglishLabel(item.category) } : {}),
    };
  }

  const enTransformed = englishContent(entry);
  return {
    ...enTransformed,
    ...(item.location ? { location: toEnglishLabel(item.location) } : {}),
    ...(item.status ? { status: toEnglishLabel(item.status) } : {}),
    ...(item.category ? { category: toEnglishLabel(item.category) } : {}),
  };
}

/**
 * Localizes an array of content items according to locale.
 */
export function localizeContentList<T extends { title: string }>(
  entries: T[],
  locale: Locale = "vi",
): T[] {
  if (!Array.isArray(entries)) return [];
  return entries.map((item) => localizeContent(item, locale));
}
