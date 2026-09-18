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
    return pageMetadata(
      "Bài viết BIM & công nghệ xây dựng | BIM4C",
      "Góc nhìn chuyên môn về BIM, dữ liệu xây dựng và chuyển đổi số từ BIM4C.",
      ROUTES.blogDetail(slug),
    );
  }
  if (!entry) notFound();
  return getContentMetadata(entry, ROUTES.blogDetail(slug));
}
export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let entry;
  try {
    entry = await getPostBySlug(slug);
  } catch {
    return <PublicDataFallback title="Bài viết BIM & công nghệ xây dựng" description="Nội dung bài viết đang được cập nhật. Vui lòng thử lại sau." />;
  }
  if (!entry) notFound();
  const posts = await getPosts({ limit: 6 }).catch(() => []);
  const candidates = posts.filter((post) => post.slug !== slug);
  const related = selectRelatedContent(entry, candidates);
  return (
    <main>
      <BlogDetailView
        entry={entry}
        related={related}
        backHref={ROUTES.blog}
      />
    </main>
  );
}
