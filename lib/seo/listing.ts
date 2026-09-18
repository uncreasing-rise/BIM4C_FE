import type { Metadata } from "next";
import {
  absoluteUrl,
  canonicalPath,
  DEFAULT_KEYWORDS,
  DEFAULT_SOCIAL_IMAGE,
  getAlternateLanguages,
  SITE_NAME,
  localizedPath,
} from "./site";
import { getRequestLocale } from "@/lib/i18n/request";

export type ListingSearchParams = Record<string, string | string[] | undefined>;

export async function pageMetadata(
  title: string,
  description: string,
  pathname: string,
  image = DEFAULT_SOCIAL_IMAGE,
  keywords = DEFAULT_KEYWORDS,
): Promise<Metadata> {
  const locale = await getRequestLocale();
  const localizedCanonical = localizedPath(pathname, locale);
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: localizedCanonical,
      languages: getAlternateLanguages(pathname),
    },
    openGraph: {
      title,
      description,
      url: localizedCanonical,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: [locale === "vi" ? "en_US" : "vi_VN"],
      images: [{ url: absoluteUrl(image), alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

export function parsePage(value: string | string[] | null | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return 1;
  return Math.max(1, Number(raw));
}

export async function listingMetadata(
  title: string,
  description: string,
  pathname: string,
  params: ListingSearchParams,
  image = DEFAULT_SOCIAL_IMAGE,
): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = parsePage(params.page);
  const utilityParams = Object.keys(params).some((key) => key !== "page");
  const canonical = canonicalPath(localizedPath(pathname, locale), page);
  const fullTitle = page > 1 ? `${title} – Trang ${page}` : title;

  return {
    title: fullTitle,
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: {
      canonical,
      languages: getAlternateLanguages(canonical),
    },
    robots: utilityParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: [locale === "vi" ? "en_US" : "vi_VN"],
      images: [{ url: absoluteUrl(image), alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

export function normalizedPageRedirect(
  pathname: string,
  params: ListingSearchParams,
  itemCount: number,
  pageSize: number,
): string | null {
  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const pages = Math.max(1, Math.ceil(itemCount / pageSize));
  if (raw === undefined) return null;
  const normalized =
    !/^\d+$/.test(raw) || Number(raw) <= 1 ? 1 : Math.min(Number(raw), pages);
  if (String(normalized) !== raw || normalized === 1) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (key !== "page" && value !== undefined) {
        (Array.isArray(value) ? value : [value]).forEach((item) =>
          query.append(key, item),
        );
      }
    });
    if (normalized > 1) query.set("page", String(normalized));
    return `${pathname}${query.size ? `?${query}` : ""}`;
  }
  return null;
}
