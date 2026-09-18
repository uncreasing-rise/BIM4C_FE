import type { Locale } from "./config";

export function localePrefix(locale: Locale, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${path === "/" ? "" : path}`;
}
