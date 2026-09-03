import { getAllPosts } from "@/features/blog/api/queries";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

const xml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);

export async function GET() {
  try {
    const posts = (await getAllPosts({ strict: true })).filter((post) => post.publishedAt && !Number.isNaN(Date.parse(post.publishedAt))).sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!)).slice(0, 30);
    const items = posts.map((post) => `<item><title>${xml(post.title)}</title><link>${xml(absoluteUrl(`/blog/${post.slug}`))}</link><guid>${xml(absoluteUrl(`/blog/${post.slug}`))}</guid><description>${xml(post.description)}</description><pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate></item>`).join("");
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${absoluteUrl("/blog")}</link><description>${xml(DEFAULT_DESCRIPTION)}</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } });
  } catch {
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
