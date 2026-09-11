"use client";

import { PageHero } from "@/components/shared/PageHero";
import { CourseExplorer } from "@/components/courses/CourseExplorer";
import type { ContentEntry } from "@/types/content";
import type { PageMeta } from "@/features/shared/types/pagination";
import { useLanguage } from "@/lib/i18n/context";

export function CoursesPageView({
  courses,
  meta,
}: {
  courses: ContentEntry[];
  meta: PageMeta;
}) {
  const { t } = useLanguage();

  return (
    <main>
      <PageHero
        eyebrow={t.coursesPage.eyebrow}
        title={t.coursesPage.title}
        description={t.coursesPage.description}
        image="/images/news-bim-training.webp"
      />
      <CourseExplorer courses={courses} meta={meta} />
      <section className="bg-muted py-14 text-foreground lg:py-16">
        <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1200px] gap-9 md:w-[calc(100%_-_48px)] lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <header>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-primary">
              {t.coursesPage.howWeTeachEyebrow}
            </p>
            <h2 className="text-[30px] font-semibold leading-[1.16] tracking-[-.025em] md:text-[40px]">
              {t.coursesPage.howWeTeachTitle}
            </h2>
          </header>
          <div className="border-t border-border">
            {t.coursesPage.learningValues.map(({ title, text }, index) => (
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
                <p className="text-[14px] leading-[1.65] text-muted-foreground">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
