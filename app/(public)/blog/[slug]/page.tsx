import { notFound, permanentRedirect } from "next/navigation";
import { PublicDataFallback } from "@/components/shared/PublicDataFallback";
import { getPostBySlug } from "@/features/blog/api/queries";
import { postPath } from "@/features/blog/post-group";
import { getRequestLocale } from "@/lib/i18n/request";
import { localizedPath } from "@/lib/seo/site";

export function generateStaticParams() {
  return [];
}

/** Redirected here, before streaming, so it is a real 308 (see the news page). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let entry;
  try {
    entry = await getPostBySlug(slug);
  } catch {
    return {};
  }
  if (!entry) notFound();
  permanentRedirect(localizedPath(postPath(entry), await getRequestLocale()));
}

/**
 * An older address for posts. Each post has one public URL, under news or
 * technical by its category (see postGroup); this one moves there for good,
 * so links and search results that still use it keep working.
 */
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
  permanentRedirect(localizedPath(postPath(entry), await getRequestLocale()));
}
