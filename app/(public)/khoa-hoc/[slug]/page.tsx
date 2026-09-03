import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/shared/DetailPage";
import { ROUTES } from "@/constants/routes";
import { getCourseBySlug, getCourses } from "@/features/courses/api/queries";
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
  const entry = await getCourseBySlug((await params).slug);
  if (!entry) notFound();
  return getContentMetadata(entry, ROUTES.courseDetail(entry.slug));
}
export default async function CourseDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [entry, courses] = await Promise.all([
    getCourseBySlug(slug),
    getCourses(),
  ]);
  if (!entry) notFound();
  return (
    <main>
      <DetailPage
        entry={entry}
        kind="course"
        related={selectRelatedContent(entry, courses)}
        backHref={ROUTES.courses}
        backLabel="Tất cả khóa học"
      />
    </main>
  );
}
