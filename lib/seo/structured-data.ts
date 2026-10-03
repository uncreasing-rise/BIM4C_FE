import type { ContentEntry } from "@/types/content";
import { absoluteUrl, SITE_NAME, DEFAULT_DESCRIPTION } from "./site";
import type { SiteSettingsData } from "@/features/settings/types";

type Schema = Record<string, unknown>;
const organizationId = absoluteUrl("/#organization");

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
  settings?: SiteSettingsData | null,
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
    description: settings?.defaultSeoDescription,
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

export const websiteSchema = (): Schema => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: SITE_NAME,
  alternateName: "BIM4C Digital Construction",
  url: absoluteUrl("/"),
  description: DEFAULT_DESCRIPTION,
  publisher: { "@id": organizationId },
  inLanguage: ["vi-VN", "en-US"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${absoluteUrl("/blog")}?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

export function breadcrumbSchema(
  items: { name: string; path: string }[],
): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
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

export function contentSchema(
  kind: "course" | "project" | "article" | "service",
  entry: ContentEntry,
  path: string,
): Schema {
  const base = {
    "@context": "https://schema.org",
    "@id": `${absoluteUrl(path)}#entity`,
    name: entry.title,
    description: entry.description,
    image: imageUrl(entry.seoImage || entry.image),
    url: absoluteUrl(path),
    inLanguage: "vi-VN",
  };

  if (kind === "article") {
    return compact({
      ...base,
      "@type": "BlogPosting",
      headline: entry.title,
      datePublished: validDate(entry.publishedAt),
      dateModified: validDate(entry.updatedAt || entry.publishedAt),
      author: {
        "@type": "Person",
        name: entry.authorName || "BIM4C Editorial Team",
      },
      publisher: { "@id": organizationId },
      mainEntityOfPage: absoluteUrl(path),
    });
  }

  if (kind === "course") {
    return compact({
      ...base,
      "@type": "Course",
      provider: { "@id": organizationId },
      educationalLevel: entry.level || "Chuyên sâu",
      timeRequired: entry.duration?.startsWith("P")
        ? entry.duration
        : undefined,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "blended",
        instructor: {
          "@type": "Person",
          name: entry.instructor || "BIM4C Senior BIM Manager",
        },
      },
      offers: {
        "@type": "Offer",
        category: "BIM Training",
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
      },
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
