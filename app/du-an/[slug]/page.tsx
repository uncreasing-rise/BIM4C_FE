import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/shared/DetailPage";
import { ROUTES } from "@/constants/routes";
import { getProjectBySlug, getProjects } from "@/features/projects/api/queries";

export function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = await getProjectBySlug((await params).slug);
  return entry ? { title: `${entry.title} | Dự án BIM4C`, description: entry.description } : {};
}
export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [entry, projects] = await Promise.all([getProjectBySlug(slug), getProjects()]);
  if (!entry) notFound();
  return <DetailPage entry={entry} kind="project" related={projects.filter(project => project.slug !== slug)} backHref={ROUTES.projects} backLabel="Tất cả dự án"/>;
}
