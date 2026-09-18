import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetailView } from "@/components/courses/CourseDetailView";
import { ROUTES } from "@/constants/routes";
import { getCourseBySlug, getCourses } from "@/features/courses/api/queries";
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
    entry = await getCourseBySlug(slug);
  } catch {
    return pageMetadata(
      "Khóa học BIM | BIM4C",
      "Chương trình đào tạo BIM và công nghệ xây dựng thực tiễn từ BIM4C.",
      ROUTES.courseDetail(slug),
    );
  }
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
    getCourses({ limit: 6 }),
  ]);
  if (!entry) notFound();
  return (
    <main>
      <CourseDetailView
        entry={entry}
        related={selectRelatedContent(entry, courses)}
        backHref={ROUTES.courses}
      />
    </main>
  );
}
