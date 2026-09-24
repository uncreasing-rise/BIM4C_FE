import { env } from "@/lib/config/env";
import { localePrefix } from "@/lib/i18n/path";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

export const SITE_NAME = "BIM4C";
export const DEFAULT_TITLE =
  "BIM4C — Tư vấn BIM, Chuyển đổi số & Công nghệ Xây dựng";
export const DEFAULT_DESCRIPTION =
  "BIM4C cung cấp giải pháp tư vấn BIM 3D–7D, Scan-to-BIM, Laser Scanning, đào tạo chuyên sâu và quản trị dữ liệu CDE cho dự án xây dựng và quản lý tài sản.";

export const DEFAULT_KEYWORDS = [
  "BIM4C",
  "Tư vấn BIM",
  "BIM Consulting",
  "BIM 3D",
  "BIM 4D",
  "BIM 5D",
  "BIM 6D",
  "BIM 7D",
  "Scan-to-BIM",
  "Laser Scanning",
  "LiDAR",
  "Digital Twin",
  "Common Data Environment",
  "CDE ISO 19650",
  "Đào tạo BIM",
  "BIM Training",
  "Phối hợp BIM",
  "BIM Coordination",
  "Quản lý dự án xây dựng",
  "Công nghệ xây dựng số",
  "BIM Đà Nẵng",
  "BIM Việt Nam",
  "Mô hình thông tin công trình",
];

export const DEFAULT_SOCIAL_IMAGE = "/images/news-project-coordination.webp";
export const canonicalOrigin = env.appUrl;

export function absoluteUrl(pathname = "/"): string {
  try {
    const parsed = new URL(pathname, `${canonicalOrigin}/`);
    // Content may contain an old absolute URL from a deployment/preview. Keep
    // external media untouched, but never expose a Vercel deployment origin
    // through production SEO metadata or structured data.
    if (
      parsed.hostname.endsWith(".vercel.app") &&
      parsed.hostname !== new URL(canonicalOrigin).hostname
    ) {
      return new URL(
        `${parsed.pathname}${parsed.search}${parsed.hash}`,
        `${canonicalOrigin}/`,
      ).toString();
    }
    return parsed.toString();
  } catch {
    const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return new URL(cleanPath, `${canonicalOrigin}/`).toString();
  }
}

export function canonicalPath(pathname: string, page = 1): string {
  return page > 1 ? `${pathname}?page=${page}` : pathname;
}

export function localizedPath(pathname: string, locale: Locale): string {
  const clean = pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
  return localePrefix(locale, clean);
}

export function getAlternateLanguages(pathname: string) {
  return {
    "vi-VN": absoluteUrl(localizedPath(pathname, "vi")),
    "en-US": absoluteUrl(localizedPath(pathname, "en")),
    "x-default": absoluteUrl(localizedPath(pathname, DEFAULT_LOCALE)),
  };
}
