import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { PublicDataFallback } from "@/components/shared/PublicDataFallback";
import { ROUTES } from "@/constants/routes";
import { getPostBySlug, getPosts } from "@/features/blog/api/queries";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";
import { pageMetadata } from "@/lib/seo/listing";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let entry;
  try {
    entry = await getPostBySlug(slug);
  } catch {
    return await pageMetadata(
      "Tin tức & Sự kiện | BIM4C",
      "Thông tin sự kiện, hoạt động và thông cáo báo chí chính thức từ BIM4C.",
      ROUTES.newsDetail(slug),
    );
  }
  if (!entry) notFound();
  return await getContentMetadata(entry, ROUTES.newsDetail(slug));
}

export default async function NewsDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let entry;
  try {
    entry = await getPostBySlug(slug);
  } catch {
    return (
      <PublicDataFallback
        title="Tin tức & Sự kiện"
        description="Nội dung tin tức đang được cập nhật. Vui lòng thử lại sau."
      />
    );
  }
  if (!entry) notFound();
  const posts = await getPosts({ limit: 6, group: "news" }).catch(() => []);
  const candidates = posts.filter((post) => post.slug !== slug);
  const related = selectRelatedContent(entry, candidates);
  return (
    <main>
      <BlogDetailView
        entry={entry}
        related={related}
        backHref={ROUTES.news}
      />
    </main>
  );
}
