export const SUPPORTED_LOCALES = ["en", "vi"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<Locale, { label: string; code: string; flag: string }> = {
  en: { label: "English", code: "EN", flag: "🇬🇧" },
  vi: { label: "Tiếng Việt", code: "VI", flag: "🇻🇳" },
};

/**
 * Picks the site locale from an Accept-Language header (RFC 9110 weighted
 * list). Any Vietnamese variant maps to "vi"; everything else, including a
 * missing or malformed header, falls back to the default locale.
 */
export function negotiateLocale(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((entry) => entry.tag && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  for (const { tag } of ranked) {
    const base = tag.split("-")[0] as Locale;
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }
  return DEFAULT_LOCALE;
}
