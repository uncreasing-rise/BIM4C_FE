import type { MetadataRoute } from "next";
import { legalDocuments } from "@/constants/legal-content";
import { getAllPosts } from "@/features/blog/api/queries";
import { getCourses } from "@/features/courses/api/queries";
import { getAllProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { absoluteUrl } from "@/lib/seo/site";
import type { ContentEntry } from "@/types/content";

const staticPaths = ["/", "/gioi-thieu", "/dich-vu", "/du-an", "/khoa-hoc", "/blog", "/phap-ly", "/lien-he"];
const excludedStatuses = new Set(["draft", "deleted", "unpublished", "archived", "bản nháp", "đã lưu trữ"]);
const published = (entry: ContentEntry) => !entry.status || !excludedStatuses.has(entry.status.toLocaleLowerCase("vi-VN"));
const lastModified = (entry: ContentEntry) => {
  const value = entry.updatedAt || entry.publishedAt;
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value) : undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, courses, posts] = await Promise.all([getServices({ strict: true }), getAllProjects(), getCourses({ strict: true }), getAllPosts({ strict: true })]);
  const dynamic = [
    ...services.filter(published).map((entry) => ["/dich-vu", entry] as const),
    ...projects.filter(published).map((entry) => ["/du-an", entry] as const),
    ...courses.filter(published).map((entry) => ["/khoa-hoc", entry] as const),
    ...posts.filter(published).map((entry) => ["/blog", entry] as const),
  ].map(([base, entry]) => ({ url: absoluteUrl(`${base}/${entry.slug}`), lastModified: lastModified(entry) }));
  const legal = legalDocuments.map((document) => {
    const [day, month, year] = document.updatedAt.split(".").map(Number);
    return { url: absoluteUrl(`/phap-ly/${document.slug}`), lastModified: day && month && year ? new Date(Date.UTC(year, month - 1, day)) : undefined };
  });
  return [...new Map([...staticPaths.map((path) => ({ url: absoluteUrl(path) })), ...dynamic, ...legal].map((item) => [item.url, item])).values()];
}
