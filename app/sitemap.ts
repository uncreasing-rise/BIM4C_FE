import { legalDocuments } from "@/constants/legal-content";
import { getAllPosts } from "@/features/blog/api/queries";
import { getCourses } from "@/features/courses/api/queries";
import { getAllProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import {
  absoluteUrl,
  getAlternateLanguages,
  localizedPath,
} from "@/lib/seo/site";
import type { Locale } from "@/lib/i18n/config";
import type { ContentEntry } from "@/types/content";
import type { MetadataRoute } from "next";
import { postGroup } from "@/features/blog/post-group";

type Source = "services" | "projects" | "courses" | "technical" | "news";

interface StaticConfig {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  /** Content whose newest entry dates the page; without one, no lastmod. */
  source?: Source | "all";
}

const staticConfigs: StaticConfig[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0, source: "all" },
  { path: "/gioi-thieu", changeFrequency: "monthly", priority: 0.8 },
  {
    path: "/dich-vu",
    changeFrequency: "weekly",
    priority: 0.9,
    source: "services",
  },
  {
    path: "/du-an",
    changeFrequency: "weekly",
    priority: 0.9,
    source: "projects",
  },
  {
    path: "/khoa-hoc",
    changeFrequency: "weekly",
    priority: 0.9,
    source: "courses",
  },
  {
    path: "/chuyen-mon",
    changeFrequency: "daily",
    priority: 0.9,
    source: "technical",
  },
  {
    path: "/tin-tuc",
    changeFrequency: "daily",
    priority: 0.85,
    source: "news",
  },
  // No /blog: it lists the posts of /chuyen-mon and /tin-tuc again and is
  // noindex (see app/(public)/blog/page.tsx).
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

/** The newest date among the entries; a constant "now" would make lastmod meaningless. */
const newest = (entries: ContentEntry[]) =>
  entries
    .map(lastModified)
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** The English legal documents' date ("28 September 2026"), as a UTC day. */
function legalDate(value: string): Date | undefined {
  const [, day, month, year] =
    /^(\d{1,2}) ([a-z]+) (\d{4})$/i.exec(value.trim()) ?? [];
  const index = MONTHS.indexOf(month?.toLowerCase() ?? "");
  return index < 0
    ? undefined
    : new Date(Date.UTC(Number(year), index, Number(day)));
}

function localizedEntries(
  pathname: string,
  values: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  return (["vi", "en"] as Locale[]).map((locale) => ({
    ...values,
    url: absoluteUrl(localizedPath(pathname, locale)),
    // The same set as the pages' own hreflang tags, x-default included.
    alternates: { languages: getAlternateLanguages(pathname) },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, courses, posts] = await Promise.all([
    getServices({ strict: false }).catch(() => []),
    getAllProjects().catch(() => []),
    getCourses({ strict: false }).catch(() => []),
    getAllPosts({ strict: false }).catch(() => []),
  ]);

  // Each post once, at its own group's URL (see postGroup).
  const live: Record<Source, ContentEntry[]> = {
    services: services.filter(published),
    projects: projects.filter(published),
    courses: courses.filter(published),
    technical: posts.filter(
      (entry) => published(entry) && postGroup(entry) === "technical",
    ),
    news: posts.filter(
      (entry) => published(entry) && postGroup(entry) === "news",
    ),
  };

  const staticEntries: MetadataRoute.Sitemap = staticConfigs
    // An empty news listing is a thin page; it joins with its first post.
    .filter((cfg) => cfg.source !== "news" || live.news.length > 0)
    .flatMap((cfg) =>
      localizedEntries(cfg.path, {
        lastModified:
          cfg.source === "all"
            ? newest(Object.values(live).flat())
            : cfg.source && newest(live[cfg.source]),
        changeFrequency: cfg.changeFrequency,
        priority: cfg.priority,
      }),
    );

  const detailEntries = (
    source: Source,
    base: string,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: number,
  ): MetadataRoute.Sitemap =>
    live[source].flatMap((entry) =>
      localizedEntries(`${base}/${entry.slug}`, {
        lastModified: lastModified(entry),
        changeFrequency,
        priority,
      }),
    );

  const legalEntries: MetadataRoute.Sitemap = legalDocuments.flatMap(
    (document) =>
      localizedEntries(`/phap-ly/${document.slug}`, {
        lastModified: legalDate(document.updatedAt),
        changeFrequency: "yearly",
        priority: 0.4,
      }),
  );

  const allEntries = [
    ...staticEntries,
    ...detailEntries("services", "/dich-vu", "weekly", 0.85),
    ...detailEntries("projects", "/du-an", "monthly", 0.8),
    ...detailEntries("courses", "/khoa-hoc", "weekly", 0.85),
    ...detailEntries("technical", "/chuyen-mon", "monthly", 0.85),
    ...detailEntries("news", "/tin-tuc", "monthly", 0.75),
    ...legalEntries,
  ];

  return Array.from(
    new Map(allEntries.map((item) => [item.url, item])).values(),
  );
}
