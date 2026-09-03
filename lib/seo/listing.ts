import type { Metadata } from "next";
import { canonicalPath } from "./site";

export type ListingSearchParams = Record<string, string | string[] | undefined>;
export function pageMetadata(title: string, description: string, pathname: string): Metadata {
  return { title, description, alternates: { canonical: pathname }, openGraph: { title, description, url: pathname }, twitter: { title, description } };
}
export function parsePage(value: string | string[] | null | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return 1;
  return Math.max(1, Number(raw));
}
export function listingMetadata(title: string, description: string, pathname: string, params: ListingSearchParams): Metadata {
  const page = parsePage(params.page);
  const utilityParams = Object.keys(params).some((key) => key !== "page");
  const canonical = canonicalPath(pathname, page);
  return { title: page > 1 ? `${title} – Trang ${page}` : title, description, alternates: { canonical }, robots: utilityParams ? { index: false, follow: true } : { index: true, follow: true }, openGraph: { title, description, url: canonical }, twitter: { title, description } };
}
export function normalizedPageRedirect(pathname: string, params: ListingSearchParams, itemCount: number, pageSize: number): string | null {
  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const pages = Math.max(1, Math.ceil(itemCount / pageSize));
  if (raw === undefined) return null;
  if (!/^\d+$/.test(raw) || Number(raw) <= 1) return pathname;
  if (Number(raw) > pages) return canonicalPath(pathname, pages);
  return null;
}
