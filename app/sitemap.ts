import { legalDocuments } from "@/constants/legal-content";
import { getAllPosts } from "@/features/blog/api/queries";
import { getCourses } from "@/features/courses/api/queries";
import { getAllProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { absoluteUrl } from "@/lib/seo/site";
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, courses, posts] = await Promise.all([
    getServices({ strict: false }).catch(() => []),
    getAllProjects().catch(() => []),
    getCourses({ strict: false }).catch(() => []),
    getAllPosts({ strict: false }).catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticConfigs.map((cfg) => ({
    url: absoluteUrl(cfg.path),
    lastModified: new Date(),
    changeFrequency: cfg.changeFrequency,
    priority: cfg.priority,
    alternates: {
      languages: {
        "vi-VN": absoluteUrl(cfg.path),
        "en-US": absoluteUrl(cfg.path),
      },
    },
  }));

  const dynamicServices: MetadataRoute.Sitemap = services
    .filter(published)
    .map((entry) => ({
      url: absoluteUrl(`/dich-vu/${entry.slug}`),
      lastModified: lastModified(entry) || new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: {
          "vi-VN": absoluteUrl(`/dich-vu/${entry.slug}`),
          "en-US": absoluteUrl(`/dich-vu/${entry.slug}`),
        },
      },
    }));

  const dynamicProjects: MetadataRoute.Sitemap = projects
    .filter(published)
    .map((entry) => ({
      url: absoluteUrl(`/du-an/${entry.slug}`),
      lastModified: lastModified(entry) || new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          "vi-VN": absoluteUrl(`/du-an/${entry.slug}`),
          "en-US": absoluteUrl(`/du-an/${entry.slug}`),
        },
      },
    }));

  const dynamicCourses: MetadataRoute.Sitemap = courses
    .filter(published)
    .map((entry) => ({
      url: absoluteUrl(`/khoa-hoc/${entry.slug}`),
      lastModified: lastModified(entry) || new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: {
          "vi-VN": absoluteUrl(`/khoa-hoc/${entry.slug}`),
          "en-US": absoluteUrl(`/khoa-hoc/${entry.slug}`),
        },
      },
    }));

  const dynamicPosts: MetadataRoute.Sitemap = posts
    .filter(published)
    .map((entry) => ({
      url: absoluteUrl(`/blog/${entry.slug}`),
      lastModified: lastModified(entry) || new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
      alternates: {
        languages: {
          "vi-VN": absoluteUrl(`/blog/${entry.slug}`),
          "en-US": absoluteUrl(`/blog/${entry.slug}`),
        },
      },
    }));

  const legalEntries: MetadataRoute.Sitemap = legalDocuments.map((document) => {
    const [day, month, year] = document.updatedAt.split(".").map(Number);
    return {
      url: absoluteUrl(`/phap-ly/${document.slug}`),
      lastModified:
        day && month && year
          ? new Date(Date.UTC(year, month - 1, day))
          : undefined,
      changeFrequency: "yearly",
      priority: 0.4,
      alternates: {
        languages: {
          "vi-VN": absoluteUrl(`/phap-ly/${document.slug}`),
          "en-US": absoluteUrl(`/phap-ly/${document.slug}`),
        },
      },
    };
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

