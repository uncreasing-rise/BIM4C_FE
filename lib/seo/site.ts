import { env } from "@/lib/config/env";

export const SITE_NAME = "BIM4C";
export const DEFAULT_TITLE = "BIM4C Construction | Chuyển đổi số xây dựng";
export const DEFAULT_DESCRIPTION = "BIM4C tiên phong ứng dụng BIM trong thiết kế, thi công và quản lý dự án xây dựng tại Việt Nam.";
export const DEFAULT_SOCIAL_IMAGE = "/images/hero.jpg";
export const canonicalOrigin = env.appUrl;

export function absoluteUrl(pathname = "/"): string {
  return new URL(pathname, `${canonicalOrigin}/`).toString();
}

export function canonicalPath(pathname: string, page = 1): string {
  return page > 1 ? `${pathname}?page=${page}` : pathname;
}
