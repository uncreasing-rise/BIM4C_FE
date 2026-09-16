import translations from "./english-translations.json";
import { toEnglishLabel } from "../utils/public-labels";

const dictionary: Record<string, string> = translations;
const technicalFields = new Set([
  "id",
  "slug",
  "url",
  "image",
  "videoUrl",
  "canonicalUrl",
  "seoImage",
  "publishedAt",
  "createdAt",
  "updatedAt",
  "authorName",
  "instructor",
  "relatedIds",
  "type",
  "imageLayout",
]);

/** Translate the existing editorial catalogue without changing IDs, links or authored English.
 * Exact source matching deliberately leaves newly edited content intact.
 * New CMS content should be authored in English; add reviewed translations here for legacy copy.
 */
export function englishContent<T extends { title: string }>(entry: T): T {
  const title = toEnglishLabel(entry.title);
  const translate = (value: unknown, key = ""): unknown => {
    if (technicalFields.has(key)) return value;
    if (typeof value === "string") {
      const direct = toEnglishLabel(value);
      if (direct !== value) return direct;
      const exact = dictionary[value];
      if (exact) return exact.replaceAll("{{title}}", title);
      const template = value
        .split(entry.title)
        .join("{{title}}")
        .split(entry.title.toLowerCase())
        .join("{{title}}");
      const translated = dictionary[template];
      if (translated) return translated.replaceAll("{{title}}", title);
      return value;
    }
    if (Array.isArray(value)) return value.map((item) => translate(item, key));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([field, item]) => [
          field,
          translate(item, field),
        ]),
      );
    }
    return value;
  };
  const result = translate(entry) as T;
  return result;
}
