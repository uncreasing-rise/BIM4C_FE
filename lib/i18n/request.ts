import { locale as localeParam } from "next/root-params";
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "./config";

/**
 * The language of the page being rendered: the /vi or /en segment of the URL
 * (app/[locale] is the public root layout). Unlike a cookie or header, a root
 * param keeps pages static, so they can be prerendered and cached.
 * Server Components only; outside app/[locale] (the admin) it is the default.
 */
export async function getRequestLocale(): Promise<Locale> {
  const value = (await localeParam()) as Locale | undefined;
  return value && SUPPORTED_LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}
