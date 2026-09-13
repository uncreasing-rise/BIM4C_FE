import type { ContentEntry } from "@/types/content";
import { absoluteUrl, SITE_NAME } from "./site";

type Schema = Record<string, unknown>;
const organizationId = absoluteUrl("/#organization");

const validDate = (value?: string) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : undefined;
const compact = (value: Schema): Schema => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""));
const imageUrl = (value?: string) => value ? absoluteUrl(value) : undefined;

export const organizationSchema = (): Schema => ({
  "@context": "https://schema.org",
  "@type": "Corporation",
  "@id": organizationId,
  name: SITE_NAME,
  legalName: "CÔNG TY CỔ PHẦN XÂY DỰNG CÔNG NGHỆ BIM4C",
  alternateName: [
    "BIM4C JSC",
    "BIM4C TECHNOLOGY & CONSTRUCTION JOINT STOCK COMPANY",
    "BIM4C",
  ],
  taxID: "0402225839",
  url: absoluteUrl("/"),
  logo: absoluteUrl("/images/logo.png"),
  founder: {
    "@type": "Person",
    name: "TRẦN NGỌC HIẾU",
    jobTitle: "Tổng Giám Đốc / CEO",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "20 Bắc Sơn, Phường Hoà An",
    addressLocality: "Quận Cẩm Lệ",
    addressRegion: "Thành phố Đà Nẵng",
    postalCode: "550000",
    addressCountry: "VN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+84-28-7300-4068",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["vi", "en"],
    },
  ],
  sameAs: [
    "https://masothue.com/0402225839-cong-ty-co-phan-xay-dung-cong-nghe-bim4c",
  ],
});
export const websiteSchema = (): Schema => ({ "@context": "https://schema.org", "@type": "WebSite", "@id": absoluteUrl("/#website"), name: SITE_NAME, url: absoluteUrl("/") });

export function breadcrumbSchema(items: { name: string; path: string }[]): Schema {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}

export function contentSchema(kind: "course" | "project" | "article" | "service", entry: ContentEntry, path: string): Schema {
  const base = { "@context": "https://schema.org", "@id": `${absoluteUrl(path)}#entity`, name: entry.title, description: entry.description, image: imageUrl(entry.seoImage || entry.image), url: absoluteUrl(path) };
  if (kind === "article") return compact({ ...base, "@type": "BlogPosting", headline: entry.title, datePublished: validDate(entry.publishedAt), dateModified: validDate(entry.updatedAt), author: entry.authorName ? { "@type": "Person", name: entry.authorName } : undefined, publisher: { "@id": organizationId }, mainEntityOfPage: absoluteUrl(path) });
  if (kind === "course") return compact({ ...base, "@type": "Course", provider: { "@id": organizationId }, educationalLevel: entry.level, timeRequired: entry.duration?.startsWith("P") ? entry.duration : undefined });
  if (kind === "service") return { ...base, "@type": "Service", provider: { "@id": organizationId } };
  return compact({ ...base, "@type": "CreativeWork", dateCreated: validDate(entry.publishedAt), dateModified: validDate(entry.updatedAt) });
}
