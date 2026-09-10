import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listingMetadata, normalizedPageRedirect, type ListingSearchParams } from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { PROJECT_PAGE_SIZE } from "@/features/projects/constants";
import { PageHero } from "@/components/shared/PageHero";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { getAllProjects } from "@/features/projects/api/queries";
const description = "Explore BIM4C construction and digital delivery projects.";
export async function generateMetadata({ searchParams }: { searchParams: Promise<ListingSearchParams> }): Promise<Metadata> { return listingMetadata("Projects", description, ROUTES.projects, await searchParams); }
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  const projects = await getAllProjects();
  const destination = normalizedPageRedirect(ROUTES.projects, await searchParams, projects.length, PROJECT_PAGE_SIZE); if (destination) redirect(destination);
  return (
    <main>
      <PageHero
        eyebrow="BIM4C portfolio"
        title="Projects"
        description="Selected projects that demonstrate how BIM4C turns coordination into delivery confidence."
        image="/images/project-lumi.jpg"
      />
      <ProjectExplorer projects={projects} />
    </main>
  );
}
