import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  filterParam,
  normalizedPageRedirect,
  parsePage,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { pageMeta } from "@/lib/seo/page-meta";
import { getRequestLocale } from "@/lib/i18n/request";
import { ROUTES } from "@/constants/routes";
import { getPostsPage, getPostCategories } from "@/features/blog/api/queries";
import { BlogPageView } from "@/components/blog/BlogPageView";
import { PAGE_SIZE } from "@/lib/seo/page-param";
import { localizedPath } from "@/lib/seo/site";


export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  const { title, description } = pageMeta("blog", await getRequestLocale());
  return {
    ...(await listingMetadata(
      title,
      description,
      ROUTES.blog,
      await searchParams,
    )),
    // Every post here is also listed, and indexed, under /chuyen-mon or
    // /tin-tuc; this combined listing stays out of the index (and the sitemap).
    robots: { index: false, follow: true },
  };
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
      // One featured story plus four in the side column (BlogExplorer).
      limit: PAGE_SIZE.posts,
      search: filterParam(params.q),
      category:
        filterParam(params.category),
    }),
    getPostCategories().catch(() => []),
  ]);

  const destination = normalizedPageRedirect(
    localizedPath(ROUTES.blog, await getRequestLocale()),
    params,
    postsPage.meta.total,
    PAGE_SIZE.posts,
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

