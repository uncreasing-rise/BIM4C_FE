import type { ContentEntry } from "@/types/content";
import { absoluteUrl, SITE_NAME } from "./site";

type Schema = Record<string, unknown>;
const organizationId = absoluteUrl("/#organization");

const validDate = (value?: string) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : undefined;
const compact = (value: Schema): Schema => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""));
const imageUrl = (value?: string) => value ? absoluteUrl(value) : undefined;

export const organizationSchema = (): Schema => ({ "@context": "https://schema.org", "@type": "Organization", "@id": organizationId, name: SITE_NAME, url: absoluteUrl("/") });
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
