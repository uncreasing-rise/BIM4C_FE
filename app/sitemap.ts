import { legalDocuments } from "@/constants/legal-content";
import { getAllPosts } from "@/features/blog/api/queries";
import { getCourses } from "@/features/courses/api/queries";
import { getAllProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { absoluteUrl, localizedPath } from "@/lib/seo/site";
import type { Locale } from "@/lib/i18n/config";
import type { ContentEntry } from "@/types/content";
import type { MetadataRoute } from "next";

interface StaticConfig {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}

const staticConfigs: StaticConfig[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/gioi-thieu", changeFrequency: "monthly", priority: 0.8 },
  { path: "/dich-vu", changeFrequency: "weekly", priority: 0.9 },
  { path: "/du-an", changeFrequency: "weekly", priority: 0.9 },
  { path: "/khoa-hoc", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/bim-viewer", changeFrequency: "monthly", priority: 0.8 },
  { path: "/phap-ly", changeFrequency: "yearly", priority: 0.5 },
  { path: "/lien-he", changeFrequency: "monthly", priority: 0.7 },
];

const excludedStatuses = new Set([
  "draft",
  "deleted",
  "unpublished",
  "archived",
  "bản nháp",
  "đã lưu trữ",
]);

const published = (entry: ContentEntry) =>
  !entry.status ||
  !excludedStatuses.has(entry.status.toLocaleLowerCase("vi-VN"));

const lastModified = (entry: ContentEntry) => {
  const value = entry.updatedAt || entry.publishedAt;
  return value && !Number.isNaN(Date.parse(value))
    ? new Date(value)
    : undefined;
};

function localizedEntries(
  pathname: string,
  values: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  return (["vi", "en"] as Locale[]).map((locale) => ({
    ...values,
    url: absoluteUrl(localizedPath(pathname, locale)),
    alternates: {
      languages: {
        "vi-VN": absoluteUrl(localizedPath(pathname, "vi")),
        "en-US": absoluteUrl(localizedPath(pathname, "en")),
        "x-default": absoluteUrl(localizedPath(pathname, "vi")),
      },
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, courses, posts] = await Promise.all([
    getServices({ strict: false }).catch(() => []),
    getAllProjects().catch(() => []),
    getCourses({ strict: false }).catch(() => []),
    getAllPosts({ strict: false }).catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticConfigs.flatMap((cfg) => localizedEntries(cfg.path, {
    lastModified: new Date(),
    changeFrequency: cfg.changeFrequency,
    priority: cfg.priority,
  }));

  const dynamicServices: MetadataRoute.Sitemap = services
    .filter(published)
    .flatMap((entry) => localizedEntries(`/dich-vu/${entry.slug}`, {
      lastModified: lastModified(entry) || new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  const dynamicProjects: MetadataRoute.Sitemap = projects
    .filter(published)
    .flatMap((entry) => localizedEntries(`/du-an/${entry.slug}`, {
      lastModified: lastModified(entry) || new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  const dynamicCourses: MetadataRoute.Sitemap = courses
    .filter(published)
    .flatMap((entry) => localizedEntries(`/khoa-hoc/${entry.slug}`, {
      lastModified: lastModified(entry) || new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  const dynamicPosts: MetadataRoute.Sitemap = posts
    .filter(published)
    .flatMap((entry) => localizedEntries(`/blog/${entry.slug}`, {
      lastModified: lastModified(entry) || new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    }));

  const legalEntries: MetadataRoute.Sitemap = legalDocuments.flatMap((document) => {
    const [day, month, year] = document.updatedAt.split(".").map(Number);
    return localizedEntries(`/phap-ly/${document.slug}`, {
      lastModified:
        day && month && year
          ? new Date(Date.UTC(year, month - 1, day))
          : undefined,
      changeFrequency: "yearly",
      priority: 0.4,
    });
  });

  const allEntries = [
    ...staticEntries,
    ...dynamicServices,
    ...dynamicProjects,
    ...dynamicCourses,
    ...dynamicPosts,
    ...legalEntries,
  ];

  return Array.from(new Map(allEntries.map((item) => [item.url, item])).values());
}

