import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  normalizedPageRedirect,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { CoursesPageView } from "@/components/courses/CoursesPageView";
import { getCoursesPage } from "@/features/courses/api/queries";

const description =
  "Practical BIM training for engineers, project teams and organizations.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  return listingMetadata(
    "Academy",
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
    page: Number(params.page ?? 1),
    limit: 6,
    search: typeof params.q === "string" ? params.q : undefined,
    category:
      typeof params.category === "string" && params.category !== "All"
        ? params.category
        : undefined,
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
