import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./config";

export function isExternalOrSpecial(url: string): boolean {
  if (!url) return true;
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:") ||
    url.startsWith("#") ||
    url.startsWith("blob:") ||
    url.startsWith("javascript:") ||
    url.startsWith("/api/") ||
    url.startsWith("/images/") ||
    url.startsWith("/documents/") ||
    url.startsWith("/_next/") ||
    url.startsWith("/favicon")
  );
}

export function localePrefix(locale: Locale = DEFAULT_LOCALE, pathname: string): string {
  if (!pathname || isExternalOrSpecial(pathname)) return pathname;

  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = cleanPath.split("/");
  const firstSegment = segments[1];

  // If already prefixed with a supported locale, return as is
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    return cleanPath;
  }

  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}
