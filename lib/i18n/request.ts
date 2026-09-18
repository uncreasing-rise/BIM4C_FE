import { headers } from "next/headers";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale, SUPPORTED_LOCALES } from "./config";
export const LOCALE_HEADER = "x-bim4c-locale";

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get(LOCALE_HEADER) as Locale | null;
  if (headerLocale && SUPPORTED_LOCALES.includes(headerLocale)) return headerLocale;

  const cookieLocale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value as Locale | undefined;
  return cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
    ? cookieLocale
    : DEFAULT_LOCALE;
}
