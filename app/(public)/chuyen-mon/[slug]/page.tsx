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
      "Bài viết Chuyên môn BIM & Kỹ thuật Xây dựng Số | BIM4C",
      "Nghiên cứu chuyên sâu về công nghệ BIM, tiêu chuẩn ISO 19650 và chuyển đổi số xây dựng từ BIM4C.",
      ROUTES.technicalDetail(slug),
    );
  }
  if (!entry) notFound();
  return await getContentMetadata(entry, ROUTES.technicalDetail(slug));
}

export default async function TechnicalDetail({
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
        title="Bài viết Chuyên môn BIM"
        description="Nội dung bài viết chuyên môn đang được cập nhật. Vui lòng thử lại sau."
      />
    );
  }
  if (!entry) notFound();
  const posts = await getPosts({ limit: 6, group: "technical" }).catch(() => []);
  const candidates = posts.filter((post) => post.slug !== slug);
  const related = selectRelatedContent(entry, candidates);
  return (
    <main>
      <BlogDetailView
        entry={entry}
        related={related}
        backHref={ROUTES.technical}
      />
    </main>
  );
}
