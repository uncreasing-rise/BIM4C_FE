import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetailView } from "@/components/courses/CourseDetailView";
import { PublicDataFallback } from "@/components/shared/PublicDataFallback";
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
  let entry;
  try {
    entry = await getCourseBySlug(slug);
  } catch {
    return <PublicDataFallback title="Khóa học BIM" description="Nội dung khóa học đang được cập nhật. Vui lòng thử lại sau." />;
  }
  if (!entry) notFound();
  const courses = await getCourses({ limit: 6 }).catch(() => []);
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
