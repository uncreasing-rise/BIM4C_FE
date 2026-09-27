"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import { PageHero } from "@/components/shared/PageHero";
import { CourseExplorer } from "@/components/courses/CourseExplorer";
import type { ContentEntry } from "@/types/content";
import type { PageMeta } from "@/features/shared/types/pagination";
import { useLanguage } from "@/lib/i18n/context";
import { usePageContent } from "@/features/page-content/context";
import { filled } from "@/lib/utils/contact";

export function CoursesPageView({
  courses,
  meta,
}: {
  courses: ContentEntry[];
  meta: PageMeta;
}) {
  usePublicMotion();
  const { t } = useLanguage();
  const learning = usePageContent("courses.learning");
  const learningItems = filled(learning?.items).filter(
    (item) => item.title || item.text,
  );

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: t.navigation.courses }]}
        eyebrow={t.coursesPage.eyebrow}
        title={t.coursesPage.title}
        description={t.coursesPage.description}
        image="/images/news-bim-training.webp"
      />
      <CourseExplorer courses={courses} meta={meta} />
      {learningItems.length > 0 && (
        <section className="bg-muted/40 py-14 text-foreground lg:py-16 border-t border-border/70">
          <div className="site-container grid gap-9 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
            <header>
              {learning?.eyebrow && (
                <p className="eyebrow">{learning.eyebrow}</p>
              )}
              {learning?.title && (
                <h2 className="section-title">{learning.title}</h2>
              )}
            </header>
            <div className="border-t border-border">
              {learningItems.map(({ title, text }, index) => (
                <article
                  className="grid gap-2 border-b border-border py-5 sm:grid-cols-[34px_180px_1fr] sm:gap-5"
                  key={title ?? index}
                >
                  <span className="text-xs font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
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
      )}
    </main>
  );
}
