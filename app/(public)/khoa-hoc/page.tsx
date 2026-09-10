import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listingMetadata, normalizedPageRedirect, type ListingSearchParams } from "@/lib/seo/listing";
import { ROUTES } from "@/constants/routes";
import { PageHero } from "@/components/shared/PageHero";
import { CourseExplorer } from "@/components/courses/CourseExplorer";
import { getCourses } from "@/features/courses/api/queries";

const description = "Practical BIM training for engineers, project teams and organizations.";
export async function generateMetadata({ searchParams }: { searchParams: Promise<ListingSearchParams> }): Promise<Metadata> { return listingMetadata("Academy", description, ROUTES.courses, await searchParams); }
const learningValues = [
  [
    "Project-based practice",
    "Exercises, data and models selected from real delivery situations.",
  ],
  [
    "Expert mentorship",
    "Direct feedback helps learners identify issues and improve after every exercise.",
  ],
  [
    "Work-ready outcomes",
    "Completed work can be applied to your role or used in a professional portfolio.",
  ],
] as const;

export default async function CoursesPage({ searchParams }: { searchParams: Promise<ListingSearchParams> }) {
  const courses = await getCourses();
  const destination = normalizedPageRedirect(ROUTES.courses, await searchParams, courses.length, 6); if (destination) redirect(destination);
  return (
    <main>
      <PageHero
        eyebrow="BIM4C Academy"
        title="Learn to deliver better"
        description="Practical BIM programmes shaped by real project delivery experience."
        image="/images/news-bim-training.webp"
      />
      <CourseExplorer courses={courses} />
      <section className="bg-muted py-14 text-foreground lg:py-16">
        <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1200px] gap-9 md:w-[calc(100%_-_48px)] lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <header>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-primary">
              How we teach
            </p>
            <h2 className="text-[30px] font-semibold leading-[1.16] tracking-[-.025em] md:text-[40px]">
              Learn by doing.
            </h2>
          </header>
          <div className="border-t border-border">
            {learningValues.map(([title, text], index) => (
              <article
                className="grid gap-2 border-b border-border py-5 sm:grid-cols-[34px_180px_1fr] sm:gap-5"
                key={title}
              >
                <span className="text-[10px] font-semibold text-primary">
                  0{index + 1}
                </span>
                <h3 className="text-[17px] font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-[14px] leading-[1.65] text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
