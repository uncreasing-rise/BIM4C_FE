import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listingMetadata, normalizedPageRedirect, type ListingSearchParams } from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { PageHero } from "@/components/shared/PageHero";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { getAllPosts } from "@/features/blog/api/queries";
const description = "Tin tức, dự án và kiến thức chuyên môn từ BIM4C.";
export async function generateMetadata({ searchParams }: { searchParams: Promise<ListingSearchParams> }): Promise<Metadata> { return listingMetadata("Blog", description, ROUTES.blog, await searchParams); }
export default async function BlogPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  const posts = await getAllPosts();
  const destination = normalizedPageRedirect(ROUTES.blog, await searchParams, posts.length, 5); if (destination) redirect(destination);
  return (
    <main>
      <PageHero
        eyebrow="BIM4C"
        title="Tin tức"
        description="Tin mới, sự kiện và góc nhìn chuyên môn từ BIM4C."
        image="/images/news-project-coordination.webp"
      />
      <BlogExplorer posts={posts} />
    </main>
  );
}
