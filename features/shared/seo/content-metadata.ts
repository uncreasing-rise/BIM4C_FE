import type { Metadata } from "next";
import type { ContentEntry } from "@/types/content";
import {
  absoluteUrl,
  DEFAULT_KEYWORDS,
  getAlternateLanguages,
  SITE_NAME,
  localizedPath,
} from "@/lib/seo/site";
import { getRequestLocale } from "@/lib/i18n/request";
import { localizeContent } from "@/lib/i18n/localize";

export async function getContentMetadata(
  entry: ContentEntry,
  pathname: string,
): Promise<Metadata> {
  const locale = await getRequestLocale();
  const localized = localizeContent(entry, locale);
  const title = locale === "vi"
    ? entry.seoTitle_vi || localized.title
    : entry.seoTitle || localized.title;
  const description = locale === "vi"
    ? entry.seoDescription_vi || localized.description
    : entry.seoDescription || localized.description;
  const image = entry.seoImage || entry.image;
  const canonical = localizedPath(pathname, locale);

  return {
    title,
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: {
      canonical,
      languages: getAlternateLanguages(canonical),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: [locale === "vi" ? "en_US" : "vi_VN"],
      type: "article",
      images: [{ url: absoluteUrl(image), alt: entry.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}
