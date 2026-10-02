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
import { CoursesPageView } from "@/components/courses/CoursesPageView";
import { getCoursesPage } from "@/features/courses/api/queries";


export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  const { title, description } = pageMeta("courses", await getRequestLocale());
  return await listingMetadata(
    title,
    description,
    ROUTES.courses,
    await searchParams,
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const coursesPage = await getCoursesPage({
    page: parsePage(params.page),
    limit: 6,
    search: filterParam(params.q),
    category:
      filterParam(params.category),
  });

  const destination = normalizedPageRedirect(
    ROUTES.courses,
    params,
    coursesPage.meta.total,
    6,
  );
  if (destination) redirect(destination);

  return (
    <CoursesPageView
      courses={coursesPage.items}
      meta={coursesPage.meta}
    />
  );
}
