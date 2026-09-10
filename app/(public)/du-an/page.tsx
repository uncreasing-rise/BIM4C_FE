import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  listingMetadata,
  normalizedPageRedirect,
  type ListingSearchParams,
} from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { PROJECT_PAGE_SIZE } from "@/features/projects/constants";
import { PageHero } from "@/components/shared/PageHero";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { getProjectsPage } from "@/features/projects/api/queries";
const description = "Explore BIM4C construction and digital delivery projects.";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  return listingMetadata(
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
  const projectsPage = await getProjectsPage({
    page: Number(params.page ?? 1),
    limit: PROJECT_PAGE_SIZE,
    search: typeof params.q === "string" ? params.q : undefined,
    category:
      typeof params.category === "string" && params.category !== "All"
        ? params.category
        : undefined,
    location:
      typeof params.location === "string" && params.location !== "All"
        ? params.location
        : undefined,
    year:
      typeof params.year === "string" && params.year !== "All"
        ? params.year
        : undefined,
    status:
      typeof params.status === "string" && params.status !== "All"
        ? params.status
        : undefined,
  });
  const destination = normalizedPageRedirect(
    ROUTES.projects,
    params,
    projectsPage.meta.total,
    PROJECT_PAGE_SIZE,
  );
  if (destination) redirect(destination);
  return (
    <main>
      <PageHero
        eyebrow="BIM4C portfolio"
        title="Projects"
        description="Selected projects that demonstrate how BIM4C turns coordination into delivery confidence."
        image="/images/news-project-coordination.webp"
      />
      <ProjectExplorer projects={projectsPage.items} meta={projectsPage.meta} />
    </main>
  );
}
