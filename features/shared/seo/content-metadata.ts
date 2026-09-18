import type { Metadata } from "next";
import type { ContentEntry } from "@/types/content";
import {
  absoluteUrl,
  DEFAULT_KEYWORDS,
  getAlternateLanguages,
  SITE_NAME,
} from "@/lib/seo/site";

export function getContentMetadata(
  entry: ContentEntry,
  pathname: string,
): Metadata {
  const title = entry.seoTitle || entry.title;
  const description = entry.seoDescription || entry.description;
  const image = entry.seoImage || entry.image;
  const canonical = pathname;

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
      locale: "vi_VN",
      alternateLocale: ["en_US"],
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
