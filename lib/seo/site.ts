import { env } from "@/lib/config/env";

export const SITE_NAME = "BIM4C";
export const DEFAULT_TITLE =
  "BIM4C Construction | Digital delivery with clarity";
export const DEFAULT_DESCRIPTION =
  "BIM4C helps construction teams coordinate design, delivery and asset data with confidence.";
export const DEFAULT_SOCIAL_IMAGE = "/images/news-project-coordination.webp";
export const canonicalOrigin = env.appUrl;

export function absoluteUrl(pathname = "/"): string {
  return new URL(pathname, `${canonicalOrigin}/`).toString();
}

export function canonicalPath(pathname: string, page = 1): string {
  return page > 1 ? `${pathname}?page=${page}` : pathname;
}
