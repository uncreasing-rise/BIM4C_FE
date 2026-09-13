import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { ROUTES } from "@/constants/routes";
import { getProjectBySlug, getProjects } from "@/features/projects/api/queries";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";

export function generateStaticParams() {
  return [];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const entry = await getProjectBySlug((await params).slug);
  if (!entry) notFound();
  return getContentMetadata(entry, ROUTES.projectDetail(entry.slug));
}
export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [entry, projects] = await Promise.all([
    getProjectBySlug(slug),
    getProjects({ limit: 6 }),
  ]);
  if (!entry) notFound();
  return (
    <main>
      <ProjectDetailView
        entry={entry}
        related={selectRelatedContent(entry, projects)}
        backHref={ROUTES.projects}
      />
    </main>
  );
}
