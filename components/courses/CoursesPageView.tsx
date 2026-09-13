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
      <section className="bg-muted/40 py-14 text-foreground lg:py-16 border-t border-border/70">
        <div className="site-container grid gap-9 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
          <header>
            <p className="eyebrow">
              {t.coursesPage.howWeTeachEyebrow}
            </p>
            <h2 className="section-title">
              {t.coursesPage.howWeTeachTitle}
            </h2>
          </header>
          <div className="border-t border-border">
            {t.coursesPage.learningValues.map(({ title, text }, index) => (
              <article
                className="grid gap-2 border-b border-border py-5 sm:grid-cols-[34px_180px_1fr] sm:gap-5"
                key={title}
              >
                <span className="text-xs font-semibold text-primary">
                  0{index + 1}
                </span>
                <h3 className="text-base font-bold text-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
