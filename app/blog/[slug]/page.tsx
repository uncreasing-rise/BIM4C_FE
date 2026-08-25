import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/shared/DetailPage";
import { ROUTES } from "@/constants/routes";
import { getPostBySlug, getPosts } from "@/features/blog/api/queries";

export function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = await getPostBySlug((await params).slug);
  return entry ? { title: `${entry.title} | Blog BIM4C`, description: entry.description } : {};
}
export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [entry, posts] = await Promise.all([getPostBySlug(slug), getPosts()]);
  if (!entry) notFound();
  return <DetailPage entry={entry} kind="article" related={posts.filter(post => post.slug !== slug)} backHref={ROUTES.blog} backLabel="Tất cả bài viết"/>;
}
