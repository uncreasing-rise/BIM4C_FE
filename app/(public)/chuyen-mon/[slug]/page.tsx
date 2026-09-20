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
    return getContentMetadata(entry, ROUTES.technicalDetail(slug));
  } catch {
    const locale = await getRequestLocale();
    return pageMetadata(
      locale === "vi" ? "Bài viết Chuyên môn BIM & Kỹ thuật Xây dựng Số | BIM4C" : "BIM Technical Article | BIM4C",
      locale === "vi"
        ? "Nghiên cứu chuyên sâu về công nghệ BIM, tiêu chuẩn ISO 19650 và chuyển đổi số xây dựng từ BIM4C."
        : "Expert research on BIM technology, ISO 19650 and digital construction from BIM4C.",
      ROUTES.technicalDetail(slug),
    );
  }
}

export default async function TechnicalDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let entry;
  let related;
  try {
    entry = await getPostBySlug(slug);
    if (!entry) notFound();
    const posts = await getPosts({ limit: 6, group: "technical" }).catch(() => []);
    related = selectRelatedContent(entry, posts.filter((post) => post.slug !== slug));
  } catch {
    const locale = await getRequestLocale();
    return (
      <PublicDataFallback
        title={locale === "vi" ? "Bài viết Chuyên môn BIM" : "BIM Technical Article"}
        description={locale === "vi" ? "Nội dung bài viết chuyên môn đang được cập nhật. Vui lòng thử lại sau." : "This technical article is being updated. Please try again later."}
      />
    );
  }
  return (
    <main>
      <BlogDetailView entry={entry} related={related} backHref={ROUTES.technical} />
    </main>
  );
}
