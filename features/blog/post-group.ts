import { ROUTES } from "@/constants/routes";

/**
 * Categories whose posts are news (/tin-tuc); every other post, with or
 * without a category, is technical (/chuyen-mon). Must match NEWS_SLUGS in
 * the backend's posts.service.ts, which filters the two listings.
 */
export const NEWS_SLUGS = ["tin-tuc", "su-kien", "tuyen-dung", "hop-tac", "news", "events", "thong-cao"];

export type PostGroup = "news" | "technical";

export const postGroup = (entry: { categorySlug?: string }): PostGroup =>
  entry.categorySlug && NEWS_SLUGS.includes(entry.categorySlug) ? "news" : "technical";

/** The one public URL of a post (unlocalized): its group's detail page. */
export const postPath = (entry: { slug: string; categorySlug?: string }) =>
  postGroup(entry) === "news" ? ROUTES.newsDetail(entry.slug) : ROUTES.technicalDetail(entry.slug);
