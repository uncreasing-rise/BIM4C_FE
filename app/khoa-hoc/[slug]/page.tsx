import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/shared/DetailPage";
import { ROUTES } from "@/constants/routes";
import { getCourseBySlug, getCourses } from "@/features/courses/api/queries";

export function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = await getCourseBySlug((await params).slug);
  return entry ? { title: `${entry.title} | BIM4C Academy`, description: entry.description } : {};
}
export default async function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [entry, courses] = await Promise.all([getCourseBySlug(slug), getCourses()]);
  if (!entry) notFound();
  return <DetailPage entry={entry} kind="course" related={courses.filter(course => course.slug !== slug)} backHref={ROUTES.courses} backLabel="Tất cả khóa học"/>;
}
