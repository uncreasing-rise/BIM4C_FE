"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import { PageHero } from "@/components/shared/PageHero";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import type { Project } from "@/features/projects/types/project";
import type { PageMeta } from "@/features/shared/types/pagination";
import type { ProjectFilters } from "@/features/projects/api/queries";
import { useLanguage } from "@/lib/i18n/context";

export function ProjectsPageView({
  projects,
  meta,
  filters,
}: {
  projects: Project[];
  meta: PageMeta;
  filters: ProjectFilters;
}) {
  usePublicMotion();
  const { t } = useLanguage();

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: t.navigation.projects }]}
        eyebrow={t.projectsPage.eyebrow}
        title={t.projectsPage.title}
        description={t.projectsPage.description}
        image="/images/news-project-coordination.webp"
      />
      <ProjectExplorer projects={projects} meta={meta} filters={filters} />
    </main>
  );
}
