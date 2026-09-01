import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsDetail } from "@/components/blog/NewsDetail";
import { ROUTES } from "@/constants/routes";
import { getPostBySlug, getPosts } from "@/features/blog/api/queries";
import { env } from "@/lib/config/env";

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
  const canonical = env.appUrl
    ? `${env.appUrl}${ROUTES.blogDetail(slug)}`
    : ROUTES.blogDetail(slug);
  return {
    title: `${entry.title} | BIM4C`,
    description: entry.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.description,
      url: canonical,
      images: [{ url: entry.image, alt: entry.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [entry.image],
    },
  };
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
  const videos = candidates.filter(
    (post) => post.eyebrow.trim().toUpperCase() === "VIDEO",
  );
  const related = [
    ...candidates.filter((post) => post.eyebrow === entry.eyebrow),
    ...candidates.filter(
      (post) =>
        post.eyebrow !== entry.eyebrow &&
        post.eyebrow.trim().toUpperCase() !== "VIDEO",
    ),
  ].filter(
    (post, index, all) =>
      all.findIndex((item) => item.slug === post.slug) === index,
  );
  return (
    <div className="public-news-detail">
      <NewsDetail entry={entry} related={related} videos={videos} />
    </div>
  );
}
