import type { ContentEntry } from "@/types/content";
import { absoluteUrl, SITE_NAME, DEFAULT_DESCRIPTION } from "./site";

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

export const organizationSchema = (): Schema => ({
  "@context": "https://schema.org",
  "@type": "Corporation",
  "@id": organizationId,
  name: SITE_NAME,
  legalName: "CÔNG TY CỔ PHẦN XÂY DỰNG & CÔNG NGHỆ BIM4C",
  alternateName: [
    "BIM4C JSC",
    "BIM4C TECHNOLOGY & CONSTRUCTION JOINT STOCK COMPANY",
    "BIM4C Digital Construction",
    "BIM4C",
  ],
  url: absoluteUrl("/"),
  logo: absoluteUrl("/images/logo.png"),
  image: absoluteUrl("/images/news-project-coordination.webp"),
  description: DEFAULT_DESCRIPTION,
  founder: {
    "@type": "Person",
    name: "TRẦN NGỌC HIẾU",
    jobTitle: "Tổng Giám Đốc / CEO",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "20 Bắc Sơn, Phường Hòa An, Quận Cẩm Lệ",
    addressLocality: "Đà Nẵng",
    addressRegion: "Thành phố Đà Nẵng",
    postalCode: "550000",
    addressCountry: "VN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+84-93-2468-099",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["vi", "en"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+84-93-2468-099",
      contactType: "sales",
      areaServed: "VN",
      availableLanguage: ["vi", "en"],
    },
  ],
  sameAs: [
    "https://www.facebook.com/bim4c",
    "https://www.linkedin.com/company/bim4c",
    "https://zalo.me/0932468099",
  ],
  knowsAbout: [
    "Building Information Modeling (BIM)",
    "Scan-to-BIM",
    "Laser Scanning 3D & LiDAR",
    "Digital Twin",
    "Common Data Environment (CDE ISO 19650)",
    "BIM Coordination & Clash Detection",
    "Construction Project Management",
    "BIM Training & Certification",
  ],
  email: "Bim4c.lab@gmail.com",
});

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

