"use client";

import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ArrowUpRight, Clock3 } from "lucide-react";
import {
  CatalogCategories,
  CatalogFilterBar,
  CatalogPagination,
  CatalogSearch,
} from "@/components/shared/CatalogControls";
import { useCatalogFilters } from "@/components/shared/useCatalogFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import type { PageMeta } from "@/features/shared/types/pagination";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContentList } from "@/lib/i18n/localize";
import { resolveCoverImage } from "@/lib/content/cover-images";

const COURSE_BASE_CATEGORIES = [
  "Nền tảng",
  "Chuyên sâu",
  "Quản lý",
  "Chuyên ngành",
  "Thực chiến",
  "Quản trị thông tin",
];

export function CourseExplorer({
  courses: rawCourses,
  meta,
}: {
  courses: ContentEntry[];
  meta: PageMeta;
}) {
  const { t, locale } = useLanguage();
  const courses = localizeContentList(rawCourses, locale);

  const courseCategory = (course: ContentEntry) =>
    toLocalizedLabel(
      course.category?.trim() || course.eyebrow.split("·")[0].trim(),
      locale,
    );

  const { searchParams, query, setQuery, update, reset, pending } =
    useCatalogFilters();
  const categoryParam = searchParams.get("category") ?? "All";
  const category =
    categoryParam === "All" || categoryParam === "Tất cả"
      ? t.common.all
      : toLocalizedLabel(categoryParam, locale);

  const allLabel = t.common.all;
  const categories = [
    allLabel,
    ...COURSE_BASE_CATEGORIES.map((cat) => toLocalizedLabel(cat, locale)),
  ];

  const pages = meta.totalPages;
  const page = meta.page;
  const visible = courses;

  return (
    <section
      className="bg-background py-12 lg:py-16"
      aria-label={t.coursesPage.catalogueTitle}
      aria-busy={pending}
    >
      <div className="site-container">
        <header className="mb-6 flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t.coursesPage.eyebrow}</p>
            <h2 className="section-title">{t.coursesPage.catalogueTitle}</h2>
          </div>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            {t.coursesPage.catalogueDesc}
          </p>
        </header>
        <CatalogCategories
          ariaLabel={t.coursesPage.catalogueTitle}
          items={categories}
          value={category}
          onChange={(value) =>
            update("category", value === allLabel ? "All" : value)
          }
        />
        <CatalogFilterBar>
          <CatalogSearch
            label={t.coursesPage.searchLabel}
            placeholder={t.coursesPage.searchPlaceholder}
            value={query}
            onChange={setQuery}
          />
        </CatalogFilterBar>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p role="status" className="text-sm text-muted-foreground">
            {t.coursesPage.programmesCount(meta.total)}
          </p>
          {(query ||
            (categoryParam !== "All" && categoryParam !== allLabel)) && (
            <Button variant="ghost" onClick={reset}>
              {t.common.clearFilters}
            </Button>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => {
            const duration =
              course.duration || course.eyebrow.split("·")[1]?.trim();
            const detailUrl = ROUTES.courseDetail(course.slug);
            return (
              <article
                key={course.slug}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl focus-within:ring-2 focus-within:ring-primary cursor-pointer"
                data-motion="tile"
              >
                {/* Full-card overlay link for 100% reliable clickability */}
                <Link
                  href={detailUrl}
                  className="absolute inset-0 z-20 rounded-2xl focus:outline-none"
                  aria-label={`${course.title} - ${t.coursesPage.exploreProgramme}`}
                />

                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  <Image
                    src={resolveCoverImage({
                      slug: course.slug,
                      category: course.category,
                      currentImage: course.image,
                      type: "course",
                    })}
                    alt={course.title}
                    fill
                    sizes="(max-width:767px) 100vw, (max-width:1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white border border-white/10 uppercase tracking-wider">
                      {courseCategory(course)}
                    </span>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {courseCategory(course)}
                    </p>
                    {course.level && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        {toLocalizedLabel(course.level, locale)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors md:mt-3 md:text-2xl">
                    {course.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground md:line-clamp-none md:leading-7">
                    {course.description}
                  </p>
                  <dl className="mt-5 grid gap-2 border-t pt-4 text-sm">
                    {duration && (
                      <div className="flex items-center gap-2">
                        <dt className="flex items-center gap-2 text-muted-foreground">
                          <Clock3 className="size-4 text-primary" />
                          {t.coursesPage.durationLabel}
                        </dt>
                        <dd className="ml-auto font-medium text-foreground">
                          {toLocalizedLabel(duration, locale)}
                        </dd>
                      </div>
                    )}
                    {course.price && (
                      <div className="flex justify-between gap-3 font-semibold">
                        <dt className="text-muted-foreground">
                          {t.coursesPage.tuitionLabel}
                        </dt>
                        <dd className="text-primary">{course.price}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-5 flex min-h-11 items-center justify-between text-sm font-bold text-primary border-t pt-3">
                    <span>{t.coursesPage.exploreProgramme}</span>
                    <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!visible.length && (
          <EmptyState
            title={t.coursesPage.emptyTitle}
            description={t.coursesPage.emptyDesc}
          />
        )}
        <CatalogPagination
          ariaLabel={t.coursesPage.catalogueTitle}
          page={page}
          pages={pages}
          pathname={ROUTES.courses}
        />
      </div>
    </section>
  );
}
