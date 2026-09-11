export const SUPPORTED_LOCALES = ["en", "vi"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<Locale, { label: string; code: string; flag: string }> = {
  en: { label: "English", code: "EN", flag: "🇬🇧" },
  vi: { label: "Tiếng Việt", code: "VI", flag: "🇻🇳" },
};
