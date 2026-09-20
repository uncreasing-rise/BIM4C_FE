import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { PublicDataFallback } from "@/components/shared/PublicDataFallback";
import { ROUTES } from "@/constants/routes";
import { getPosts, getPostBySlug } from "@/features/blog/api/queries";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";
import { getRequestLocale } from "@/lib/i18n/request";
import { pageMetadata } from "@/lib/seo/listing";

export function generateStaticParams() { return []; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const entry = await getPostBySlug(slug);
    if (!entry) notFound();
    return getContentMetadata(entry, ROUTES.newsDetail(slug));
  } catch {
    const locale = await getRequestLocale();
    return pageMetadata(
      locale === "vi" ? "Tin tức & Sự kiện | BIM4C" : "News & Events | BIM4C",
      locale === "vi"
        ? "Thông tin sự kiện, hoạt động và thông cáo báo chí chính thức từ BIM4C."
        : "Official BIM4C news, events, activities and press releases.",
      ROUTES.newsDetail(slug),
    );
  }
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let entry;
  let related;
  try {
    entry = await getPostBySlug(slug);
    if (!entry) notFound();
    const posts = await getPosts({ limit: 6, group: "news" }).catch(() => []);
    related = selectRelatedContent(entry, posts.filter((post) => post.slug !== slug));
  } catch {
    const locale = await getRequestLocale();
    return (
      <PublicDataFallback
        title={locale === "vi" ? "Tin tức & Sự kiện" : "News & Events"}
        description={locale === "vi" ? "Nội dung tin tức đang được cập nhật. Vui lòng thử lại sau." : "This news article is being updated. Please try again later."}
      />
    );
  }
  return (
    <main>
      <BlogDetailView entry={entry} related={related} backHref={ROUTES.news} />
    </main>
  );
}
