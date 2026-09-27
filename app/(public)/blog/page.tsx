import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  filterParam,
  normalizedPageRedirect,
  parsePage,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { getPostsPage, getPostCategories } from "@/features/blog/api/queries";
import { BlogPageView } from "@/components/blog/BlogPageView";

const description =
  "Project news, expert perspectives and digital construction insights from BIM4C.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  return await listingMetadata(
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
  const [postsPage, categories] = await Promise.all([
    getPostsPage({
      page: parsePage(params.page),
      limit: 6,
      search: filterParam(params.q),
      category:
        filterParam(params.category),
    }),
    getPostCategories().catch(() => []),
  ]);

  const destination = normalizedPageRedirect(
    ROUTES.blog,
    params,
    postsPage.meta.total,
    6,
  );
  if (destination) redirect(destination);

  return (
    <BlogPageView
      posts={postsPage.items}
      meta={postsPage.meta}
      categories={categories}
    />
  );
}

