import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/shared/DetailPage";
import { ROUTES } from "@/constants/routes";
import { getPostBySlug, getPosts } from "@/features/blog/api/queries";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";

export function generateStaticParams() {
  return [];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPostBySlug(slug);
  if (!entry) return {};
  return getContentMetadata(entry, ROUTES.blogDetail(slug));
}
export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [entry, posts] = await Promise.all([getPostBySlug(slug), getPosts()]);
  if (!entry) notFound();
  const candidates = posts.filter((post) => post.slug !== slug);
  const related = selectRelatedContent(entry, candidates);
  return (
    <main>
      <DetailPage
        entry={entry}
        kind="article"
        related={related}
        backHref={ROUTES.blog}
        backLabel="Tất cả bài viết"
      />
    </main>
  );
}
