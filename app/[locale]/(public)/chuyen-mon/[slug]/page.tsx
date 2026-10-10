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
          title: "Bài viết Chuyên môn BIM & Kỹ thuật Xây dựng Số",
          description: "Nghiên cứu chuyên sâu về công nghệ BIM, tiêu chuẩn ISO 19650 và chuyển đổi số xây dựng từ BIM4C.",
        },
        en: {
          title: "BIM Technical Article",
          description: "Expert research on BIM technology, ISO 19650 and digital construction from BIM4C.",
        },
      },
      ROUTES.technicalDetail(slug),
    );
  }
  // Public routes have no loading.tsx, so nothing streams before this runs:
  // notFound() is a real 404 and the redirect a real 308. A loading boundary
  // above this page would turn both back into 200s.
  if (!entry) notFound();
  if (postGroup(entry) !== "technical") permanentRedirect(localizedPath(postPath(entry), await getRequestLocale()));
  return getContentMetadata(entry, ROUTES.technicalDetail(slug));
}

export default async function TechnicalDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let entry;
  let related;
  try {
    entry = await getPostBySlug(slug);
    if (entry && postGroup(entry) === "technical") {
      const posts = await getPosts({ limit: 6, group: "technical" }).catch(() => []);
      related = selectRelatedContent(entry, posts.filter((post) => post.slug !== slug));
    }
  } catch {
    const locale = await getRequestLocale();
    return (
      <PublicDataFallback
        title={locale === "vi" ? "Bài viết Chuyên môn BIM" : "BIM Technical Article"}
        description={locale === "vi" ? "Nội dung bài viết chuyên môn đang được cập nhật. Vui lòng thử lại sau." : "This technical article is being updated. Please try again later."}
      />
    );
  }
  // notFound/redirect throw: outside the try, or the catch above swallowed
  // them and a missing post rendered the "being updated" page as 200.
  if (!entry) notFound();
  if (postGroup(entry) !== "technical") permanentRedirect(localizedPath(postPath(entry), await getRequestLocale()));
  return (
    <main>
      <BlogDetailView entry={entry} related={related} backHref={ROUTES.technical} />
    </main>
  );
}
