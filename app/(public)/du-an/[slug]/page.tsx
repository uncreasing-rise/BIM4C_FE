import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/shared/DetailPage";
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
    getProjects(),
  ]);
  if (!entry) notFound();
  return (
    <main>
      <DetailPage
        entry={entry}
        kind="project"
        related={selectRelatedContent(entry, projects)}
        backHref={ROUTES.projects}
        backLabel="Tất cả dự án"
      />
    </main>
  );
}
