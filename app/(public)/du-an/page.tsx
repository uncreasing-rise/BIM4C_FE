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
import { PROJECT_PAGE_SIZE } from "@/features/projects/constants";
import { ProjectsPageView } from "@/components/projects/ProjectsPageView";
import { getProjectFilters, getProjectsPage } from "@/features/projects/api/queries";

const description = "Explore BIM4C construction and digital delivery projects.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  return await listingMetadata(
    "Projects",
    description,
    ROUTES.projects,
    await searchParams,
  );
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const [projectsPage, filters] = await Promise.all([
    getProjectsPage({
    page: parsePage(params.page),
    limit: PROJECT_PAGE_SIZE,
    search: filterParam(params.q),
    category:
      filterParam(params.category),
    location:
      filterParam(params.location),
    year:
      filterParam(params.year),
    status:
      filterParam(params.status),
    }),
    getProjectFilters(),
  ]);

  const destination = normalizedPageRedirect(
    ROUTES.projects,
    params,
    projectsPage.meta.total,
    PROJECT_PAGE_SIZE,
  );
  if (destination) redirect(destination);

  return (
    <ProjectsPageView
      projects={projectsPage.items}
      meta={projectsPage.meta}
      filters={filters}
    />
  );
}
