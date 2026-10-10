import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { PublicDataFallback } from "@/components/shared/PublicDataFallback";
import { ROUTES } from "@/constants/routes";
import { getPosts, getPostBySlug } from "@/features/blog/api/queries";
import { postGroup, postPath } from "@/features/blog/post-group";
import { localizedPath } from "@/lib/seo/site";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";
import { getRequestLocale } from "@/lib/i18n/request";
import { unavailableMetadata } from "@/lib/seo/listing";

export function generateStaticParams() { return []; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let entry;
  try {
    entry = await getPostBySlug(slug);
  } catch {
    return unavailableMetadata(
      {
        vi: {
          title: "Tin tức & Sự kiện",
          description: "Thông tin sự kiện, hoạt động và thông cáo báo chí chính thức từ BIM4C.",
        },
        en: {
          title: "News & Events",
          description: "Official BIM4C news, events, activities and press releases.",
        },
      },
      ROUTES.newsDetail(slug),
    );
  }
  // Public routes have no loading.tsx, so nothing streams before this runs:
  // notFound() is a real 404 and the redirect a real 308. A loading boundary
  // above this page would turn both back into 200s.
  if (!entry) notFound();
  if (postGroup(entry) !== "news") permanentRedirect(localizedPath(postPath(entry), await getRequestLocale()));
  return getContentMetadata(entry, ROUTES.newsDetail(slug));
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let entry;
  let related;
  try {
    entry = await getPostBySlug(slug);
    if (entry && postGroup(entry) === "news") {
      const posts = await getPosts({ limit: 6, group: "news" }).catch(() => []);
      related = selectRelatedContent(entry, posts.filter((post) => post.slug !== slug));
    }
  } catch {
    const locale = await getRequestLocale();
    return (
      <PublicDataFallback
        title={locale === "vi" ? "Tin tức & Sự kiện" : "News & Events"}
        description={locale === "vi" ? "Nội dung tin tức đang được cập nhật. Vui lòng thử lại sau." : "This news article is being updated. Please try again later."}
      />
    );
  }
  // notFound/redirect throw: outside the try, or the catch above swallowed
  // them and a missing post rendered the "being updated" page as 200.
  if (!entry) notFound();
  if (postGroup(entry) !== "news") permanentRedirect(localizedPath(postPath(entry), await getRequestLocale()));
  return (
    <main>
      <BlogDetailView entry={entry} related={related} backHref={ROUTES.news} />
    </main>
  );
}
