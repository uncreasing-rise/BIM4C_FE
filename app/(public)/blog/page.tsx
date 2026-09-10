import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  normalizedPageRedirect,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { PageHero } from "@/components/shared/PageHero";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { getPostsPage } from "@/features/blog/api/queries";
const description =
  "Project news, expert perspectives and digital construction insights from BIM4C.";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  return listingMetadata(
    "Insights",
    description,
    ROUTES.blog,
    await searchParams,
  );
}
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const postsPage = await getPostsPage({
    page: Number(params.page ?? 1),
    limit: 5,
    search: typeof params.q === "string" ? params.q : undefined,
    category:
      typeof params.category === "string" && params.category !== "All"
        ? params.category
        : undefined,
  });
  const destination = normalizedPageRedirect(
    ROUTES.blog,
    params,
    postsPage.meta.total,
    5,
  );
  if (destination) redirect(destination);
  return (
    <main>
      <PageHero
        eyebrow="BIM4C insights"
        title="Insights"
        description="Practical lessons, project stories and perspectives on the future of digital construction."
        image="/images/news-project-coordination.webp"
      />
      <BlogExplorer posts={postsPage.items} meta={postsPage.meta} />
    </main>
  );
}
