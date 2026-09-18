import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { PublicDataFallback } from "@/components/shared/PublicDataFallback";
import { ROUTES } from "@/constants/routes";
import { getProjectBySlug, getProjects } from "@/features/projects/api/queries";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";
import { pageMetadata } from "@/lib/seo/listing";

export function generateStaticParams() {
  return [];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  let entry;
  try {
    entry = await getProjectBySlug(slug);
  } catch {
    return await pageMetadata(
      "Dự án BIM & công nghệ xây dựng | BIM4C",
      "Các dự án BIM, tư vấn kỹ thuật và chuyển đổi số tiêu biểu của BIM4C.",
      ROUTES.projectDetail(slug),
    );
  }
  if (!entry) notFound();
  return await getContentMetadata(entry, ROUTES.projectDetail(entry.slug));
}
export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let entry;
  try {
    entry = await getProjectBySlug(slug);
  } catch {
    return <PublicDataFallback title="Dự án BIM & công nghệ xây dựng" description="Nội dung dự án đang được cập nhật. Vui lòng thử lại sau." />;
  }
  if (!entry) notFound();
  const projects = await getProjects({ limit: 6 }).catch(() => []);
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
