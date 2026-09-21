import { englishContent } from "@/lib/content/english-content";
import { toEnglishLabel, toVietnameseLabel } from "@/lib/utils/public-labels";
import { legacyBlocks } from "@/lib/utils/legacy-blocks";
import type { Locale } from "./config";
import type { ContentEntry } from "@/types/content";

/**
 * Localizes any structured content entry based on the requested locale.
 * - 'vi': Uses explicit Vietnamese authored fields (e.g. title_vi, description_vi, sections_vi) if present,
 *         or returns translated Vietnamese content.
 * - 'en': Uses explicit English authored fields if present, or applies the dictionary/pattern translation.
 */
function extractHighlightsFromBlocks(blocks: unknown): string[] {
  if (!Array.isArray(blocks)) return [];
  for (const block of blocks) {
    if (block && typeof block === "object" && (block as { type?: string }).type === "feature-list") {
      const items = (block as { items?: unknown[] }).items;
      if (Array.isArray(items)) {
        const valid = items.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
        if (valid.length > 0) return valid.slice(0, 4);
      }
    }
  }
  return [];
}

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
    sections_vi?: ContentEntry["sections_vi"];
    contentBlocks_vi?: unknown;
    meta_vi?: string | null;
    duration_vi?: string | null;
    level_vi?: string | null;
    price_vi?: string | null;
    instructor_vi?: string | null;
    learningOutcomes_vi?: string[];
    curriculum_vi?: unknown[];
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
    sections_en?: ContentEntry["sections"];
    contentBlocks_en?: unknown;
    meta_en?: string | null;
    duration_en?: string | null;
    level_en?: string | null;
    price_en?: string | null;
    instructor_en?: string | null;
    learningOutcomes_en?: string[];
    curriculum_en?: unknown[];
    location_en?: string | null;
    category_en?: string | null;
  };

  if (locale === "vi") {
    const viSections = item.sections_vi ?? (item as unknown as { sections?: ContentEntry["sections"] }).sections;
    const viContentBlocks = item.contentBlocks_vi
      ? item.contentBlocks_vi
      : item.sections_vi
        ? legacyBlocks({ ...(entry as unknown as ContentEntry), sections: item.sections_vi })
        : (item as unknown as { contentBlocks?: unknown }).contentBlocks;

    const viHighlights = item.highlights_vi?.length
      ? item.highlights_vi
      : (item as unknown as { highlights?: string[] }).highlights?.length
        ? (item as unknown as { highlights: string[] }).highlights.map(toVietnameseLabel)
        : extractHighlightsFromBlocks(viContentBlocks);

    return {
      ...entry,
      title: item.title_vi || toVietnameseLabel(entry.title),
      ...(item.description_vi ? { description: item.description_vi } : {}),
      ...(item.eyebrow_vi
        ? { eyebrow: toVietnameseLabel(item.eyebrow_vi) }
        : (entry as unknown as { eyebrow?: string }).eyebrow
          ? { eyebrow: toVietnameseLabel((entry as unknown as { eyebrow: string }).eyebrow) }
          : {}),
      ...(item.meta_vi ? { meta: item.meta_vi } : {}),
      ...(viHighlights.length ? { highlights: viHighlights } : {}),
      ...(viSections ? { sections: viSections } : {}),
      ...(viContentBlocks ? { contentBlocks: viContentBlocks } : {}),
      ...(item.duration_vi
        ? { duration: toVietnameseLabel(item.duration_vi) }
        : (item as unknown as { duration?: string }).duration
          ? { duration: toVietnameseLabel((item as unknown as { duration: string }).duration) }
          : {}),
      ...(item.level_vi
        ? { level: toVietnameseLabel(item.level_vi) }
        : (item as unknown as { level?: string }).level
          ? { level: toVietnameseLabel((item as unknown as { level: string }).level) }
          : {}),
      ...(item.price_vi ? { price: item.price_vi } : {}),
      ...(item.instructor_vi ? { instructor: item.instructor_vi } : {}),
      ...(item.learningOutcomes_vi?.length ? { learningOutcomes: item.learningOutcomes_vi } : {}),
      ...(item.curriculum_vi?.length ? { curriculum: item.curriculum_vi } : {}),
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
  const enSections = item.sections_en ?? (item as unknown as { sections?: ContentEntry["sections"] }).sections;
  const enContentBlocks = item.contentBlocks_en
    ? item.contentBlocks_en
    : enSections?.length
      ? legacyBlocks({ ...(entry as unknown as ContentEntry), sections: enSections })
      : undefined;

  if (item.title_en || item.description_en || item.eyebrow_en || item.sections_en) {
    return {
      ...entry,
      title: item.title_en || toEnglishLabel(item.title_vi || entry.title),
      ...(item.description_en ? { description: item.description_en } : {}),
      ...(item.eyebrow_en
        ? { eyebrow: toEnglishLabel(item.eyebrow_en) }
        : (entry as unknown as { eyebrow?: string }).eyebrow
          ? { eyebrow: toEnglishLabel((entry as unknown as { eyebrow: string }).eyebrow) }
          : {}),
      ...((item.highlights_en?.length
        ? item.highlights_en
        : extractHighlightsFromBlocks(enContentBlocks)).length
        ? {
            highlights: item.highlights_en?.length
              ? item.highlights_en
              : extractHighlightsFromBlocks(enContentBlocks),
          }
        : {}),
      ...(enSections ? { sections: enSections } : {}),
      ...(enContentBlocks ? { contentBlocks: enContentBlocks } : {}),
      ...(item.duration_en
        ? { duration: toEnglishLabel(item.duration_en) }
        : (item as unknown as { duration?: string }).duration
          ? { duration: toEnglishLabel((item as unknown as { duration: string }).duration) }
          : {}),
      ...(item.level_en
        ? { level: toEnglishLabel(item.level_en) }
        : (item as unknown as { level?: string }).level
          ? { level: toEnglishLabel((item as unknown as { level: string }).level) }
          : {}),
      ...(item.price_en ? { price: item.price_en } : {}),
      ...(item.instructor_en ? { instructor: item.instructor_en } : {}),
      ...(item.learningOutcomes_en?.length ? { learningOutcomes: item.learningOutcomes_en } : {}),
      ...(item.curriculum_en?.length ? { curriculum: item.curriculum_en } : {}),
      ...(item.location ? { location: toEnglishLabel(item.location) } : {}),
      ...(item.status ? { status: toEnglishLabel(item.status) } : {}),
      ...(item.category ? { category: toEnglishLabel(item.category) } : {}),
    };
  }

  const enTransformed = englishContent(entry);
  const enObj = enTransformed as unknown as {
    eyebrow?: string;
    duration?: string;
    level?: string;
    location?: string;
    status?: string;
    category?: string;
  };
  const rawObj = entry as unknown as {
    eyebrow?: string;
    duration?: string;
    level?: string;
    location?: string;
    status?: string;
    category?: string;
  };

  return {
    ...enTransformed,
    title: toEnglishLabel(enTransformed.title || entry.title),
    ...(enObj.eyebrow
      ? { eyebrow: toEnglishLabel(enObj.eyebrow) }
      : rawObj.eyebrow
        ? { eyebrow: toEnglishLabel(rawObj.eyebrow) }
        : {}),
    ...(enObj.duration
      ? { duration: toEnglishLabel(enObj.duration) }
      : rawObj.duration
        ? { duration: toEnglishLabel(rawObj.duration) }
        : {}),
    ...(enObj.level
      ? { level: toEnglishLabel(enObj.level) }
      : rawObj.level
        ? { level: toEnglishLabel(rawObj.level) }
        : {}),
    ...(enObj.location
      ? { location: toEnglishLabel(enObj.location) }
      : rawObj.location
        ? { location: toEnglishLabel(rawObj.location) }
        : {}),
    ...(enObj.status
      ? { status: toEnglishLabel(enObj.status) }
      : rawObj.status
        ? { status: toEnglishLabel(rawObj.status) }
        : {}),
    ...(enObj.category
      ? { category: toEnglishLabel(enObj.category) }
      : rawObj.category
        ? { category: toEnglishLabel(rawObj.category) }
        : {}),
    ...(enContentBlocks ? { contentBlocks: enContentBlocks } : {}),
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

