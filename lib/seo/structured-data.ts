import type { ContentEntry } from "@/types/content";
import type { Locale } from "@/lib/i18n/config";
import {
  absoluteUrl,
  localizedPath,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_DESCRIPTION_EN,
} from "./site";
import type { SiteSettingsData } from "@/features/settings/types";

type Schema = Record<string, unknown>;
const organizationId = absoluteUrl("/#organization");

const languageTag = (locale: Locale) => (locale === "vi" ? "vi-VN" : "en-US");

/** The page's own URL: the language-prefixed address its canonical tag names. */
const pageUrl = (path: string, locale: Locale) =>
  absoluteUrl(localizedPath(path, locale));

const validDate = (value?: string) =>
  value && !Number.isNaN(Date.parse(value))
    ? new Date(value).toISOString()
    : undefined;

const compact = (value: Schema): Schema =>
  Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== null && item !== "",
    ),
  );

const imageUrl = (value?: string) => (value ? absoluteUrl(value) : undefined);

/**
 * Built from admin settings; empty fields are omitted. Legal-entity details
 * (registered name, legal representative) are intentionally left out.
 */
export const organizationSchema = (
  settings: SiteSettingsData | null | undefined,
  locale: Locale,
): Schema => {
  const sameAs = Object.values(settings?.socialLinks ?? {}).filter((url) =>
    url?.trim(),
  );
  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/logo.png"),
    image: imageUrl(settings?.defaultOgImage),
    description:
      locale === "vi"
        ? settings?.defaultSeoDescription_vi || DEFAULT_DESCRIPTION
        : settings?.defaultSeoDescription || DEFAULT_DESCRIPTION_EN,
    address: settings?.address
      ? { "@type": "PostalAddress", streetAddress: settings.address }
      : undefined,
    contactPoint: settings?.phone
      ? [
          {
            "@type": "ContactPoint",
            telephone: settings.phone,
            contactType: "customer service",
            availableLanguage: ["vi", "en"],
          },
        ]
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    email: settings?.email,
  });
};

// No SearchAction: Google retired the sitelinks search box, and its target
// (/blog?q=) is a noindex utility URL.
export const websiteSchema = (locale: Locale): Schema => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: SITE_NAME,
  alternateName: "BIM4C Digital Construction",
  url: absoluteUrl("/"),
  description: locale === "vi" ? DEFAULT_DESCRIPTION : DEFAULT_DESCRIPTION_EN,
  publisher: { "@id": organizationId },
  inLanguage: ["vi-VN", "en-US"],
});

/** Paths are site paths (/du-an/x); each item gets the page's language prefix. */
export function breadcrumbSchema(
  items: { name: string; path: string }[],
  locale: Locale,
): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path, locale),
    })),
  };
}

/** A free, browser-based tool published by the organisation (e.g. the IFC viewer). */
export function webApplicationSchema(input: {
  name: string;
  description: string;
  path: string;
  language: string;
  features: string[];
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${absoluteUrl(input.path)}#app`,
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: input.language,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any (modern web browser with WebGL)",
    browserRequirements: "Requires JavaScript, WebGL and WebAssembly",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
    featureList: input.features,
    publisher: { "@id": organizationId },
  };
}

export function faqPageSchema(
  faqs: { question: string; answer: string }[],
): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** `entry` is already localized; `path` is the site path without a language prefix. */
export function contentSchema(
  kind: "course" | "project" | "article" | "service",
  entry: ContentEntry,
  path: string,
  locale: Locale,
): Schema {
  const url = pageUrl(path, locale);
  const base = {
    "@context": "https://schema.org",
    "@id": `${url}#entity`,
    name: entry.title,
    description: entry.description,
    image: imageUrl(entry.seoImage || entry.image),
    url,
    inLanguage: languageTag(locale),
  };

  if (kind === "article") {
    return compact({
      ...base,
      "@type": "BlogPosting",
      headline: entry.title,
      datePublished: validDate(entry.publishedAt),
      dateModified: validDate(entry.updatedAt || entry.publishedAt),
      author: entry.authorName
        ? { "@type": "Person", name: entry.authorName }
        : { "@id": organizationId },
      publisher: { "@id": organizationId },
      mainEntityOfPage: url,
    });
  }

  if (kind === "course") {
    // Only what the CMS actually states: no invented level, instructor or
    // price-less offer.
    return compact({
      ...base,
      "@type": "Course",
      provider: { "@id": organizationId },
      educationalLevel: entry.level,
      timeRequired: entry.duration?.startsWith("P")
        ? entry.duration
        : undefined,
      hasCourseInstance: compact({
        "@type": "CourseInstance",
        courseMode: "blended",
        instructor: entry.instructor
          ? { "@type": "Person", name: entry.instructor }
          : undefined,
      }),
    });
  }

  if (kind === "service") {
    return compact({
      ...base,
      "@type": "Service",
      serviceType: entry.eyebrow || "BIM & Construction Technology Consulting",
      provider: { "@id": organizationId },
      areaServed: {
        "@type": "Country",
        name: "Vietnam",
      },
    });
  }

  // Project / Case study
  return compact({
    ...base,
    "@type": "CreativeWork",
    genre: "BIM Case Study / Project Delivery",
    creator: { "@id": organizationId },
    dateCreated: validDate(entry.publishedAt),
    dateModified: validDate(entry.updatedAt || entry.publishedAt),
  });
}
