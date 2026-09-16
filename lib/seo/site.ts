import { env } from "@/lib/config/env";

export const SITE_NAME = "BIM4C";
export const DEFAULT_TITLE =
  "BIM4C — Enterprise BIM Consulting, Digital Twin & Construction Technology";
export const DEFAULT_DESCRIPTION =
  "BIM4C provides BIM 3D–7D, laser scanning, design consulting and training for construction and asset management.";
export const DEFAULT_SOCIAL_IMAGE = "/images/news-project-coordination.webp";
export const canonicalOrigin = env.appUrl;

export function absoluteUrl(pathname = "/"): string {
  return new URL(pathname, `${canonicalOrigin}/`).toString();
}

export function canonicalPath(pathname: string, page = 1): string {
  return page > 1 ? `${pathname}?page=${page}` : pathname;
}
