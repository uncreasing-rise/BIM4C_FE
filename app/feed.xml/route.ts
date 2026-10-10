import { getAllPosts } from "@/features/blog/api/queries";
import { absoluteUrl, DEFAULT_DESCRIPTION, localizedPath, SITE_NAME } from "@/lib/seo/site";
import { postPath } from "@/features/blog/post-group";

// The CMS writes posts in Vietnamese first, so the feed links the /vi pages.
const postUrl = (post: Parameters<typeof postPath>[0]) => absoluteUrl(localizedPath(postPath(post), "vi"));

const xml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);

export async function GET() {
  try {
    const posts = (await getAllPosts({ strict: true })).filter((post) => post.publishedAt && !Number.isNaN(Date.parse(post.publishedAt))).sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!)).slice(0, 30);
    const items = posts.map((post) => `<item><title>${xml(post.title)}</title><link>${xml(postUrl(post))}</link><guid>${xml(postUrl(post))}</guid><description>${xml(post.description)}</description><pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate></item>`).join("");
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${absoluteUrl(localizedPath("/", "vi"))}</link><description>${xml(DEFAULT_DESCRIPTION)}</description><language>vi</language>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } });
  } catch {
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
