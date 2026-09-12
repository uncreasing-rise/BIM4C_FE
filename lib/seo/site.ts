import { env } from "@/lib/config/env";

export const SITE_NAME = "BIM4C";
export const DEFAULT_TITLE =
  "BIM4C — Enterprise BIM Consulting, Digital Twin & Construction Technology";
export const DEFAULT_DESCRIPTION =
  "BIM4C delivers ISO 19650 compliant BIM consulting, LOD 300-500 coordination, Scan-to-BIM, 4D/5D simulation, and enterprise Academy training for mega infrastructure and construction projects.";
export const DEFAULT_SOCIAL_IMAGE = "/images/news-project-coordination.webp";
export const canonicalOrigin = env.appUrl;

export function absoluteUrl(pathname = "/"): string {
  return new URL(pathname, `${canonicalOrigin}/`).toString();
}

export function canonicalPath(pathname: string, page = 1): string {
  return page > 1 ? `${pathname}?page=${page}` : pathname;
}
