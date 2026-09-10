"use client";

import Image from "next/image";
import Link from "next/link";
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
import { toEnglishLabel } from "@/lib/utils/public-labels";
import type { PageMeta } from "@/features/shared/types/pagination";

const pageSize = 6;
const courseCategory = (course: ContentEntry) =>
  toEnglishLabel(
    course.category?.trim() || course.eyebrow.split("·")[0].trim(),
  );

export function CourseExplorer({
  courses,
  meta,
}: {
  courses: ContentEntry[];
  meta: PageMeta;
}) {
  const { searchParams, query, setQuery, update, reset, pending } =
    useCatalogFilters();
  const category = toEnglishLabel(searchParams.get("category") ?? "All");
  const categories = [
    "All",
    ...new Set(courses.map(courseCategory).filter(Boolean)),
  ];
  const pages = meta.totalPages;
  const page = meta.page;
  const visible = courses;

  return (
    <section
      className="bg-background py-12 lg:py-16"
      aria-label="Training programmes"
      aria-busy={pending}
    >
      <div className="site-container">
        <header className="mb-6 flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">BIM4C Academy</p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Find your next skill
            </h2>
          </div>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            Compare programmes, explore the learning outcomes and find the right
            level for your role.
          </p>
        </header>
        <CatalogCategories
          ariaLabel="Programme categories"
          items={categories}
          value={category}
          onChange={(value) => update("category", value)}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label="Search programmes"
            placeholder="Search by skill, tool or programme"
            value={query}
            onChange={setQuery}
          />
        </CatalogFilterBar>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p role="status" className="text-sm text-muted-foreground">
            <strong className="text-foreground">{meta.total}</strong>{" "}
            {meta.total === 1 ? "programme" : "programmes"}
          </p>
          {(query || category !== "All") && (
            <Button variant="ghost" onClick={reset}>
              Clear filters
            </Button>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => {
            const duration =
              course.duration || course.eyebrow.split("·")[1]?.trim();
            return (
              <article
                key={course.slug}
                className="group relative grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-primary md:flex md:flex-col"
              >
                <div className="relative ml-4 mt-5 aspect-square self-start overflow-hidden rounded-lg bg-muted md:ml-0 md:mt-0 md:aspect-[16/9] md:w-full md:rounded-none">
                  <Image
                    src={course.image}
                    alt=""
                    fill
                    sizes="(max-width:767px) 88px, (max-width:1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-4 md:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {courseCategory(course)}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-tight tracking-tight md:mt-3 md:text-2xl">
                    <Link
                      className="after:absolute after:inset-0 after:content-['']"
                      href={ROUTES.courseDetail(course.slug)}
                    >
                      {course.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground md:line-clamp-none md:leading-7">
                    {course.description}
                  </p>
                  <dl className="mt-5 grid gap-2 border-t pt-4 text-sm">
                    {duration && (
                      <div className="flex items-center gap-2">
                        <dt className="flex items-center gap-2 text-muted-foreground">
                          <Clock3 className="size-4" />
                          Duration
                        </dt>
                        <dd className="ml-auto font-medium">{duration}</dd>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Level</dt>
                        <dd>{course.level}</dd>
                      </div>
                    )}
                    {course.price && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Tuition</dt>
                        <dd>{course.price}</dd>
                      </div>
                    )}
                  </dl>
                  <span className="mt-5 flex min-h-11 items-center justify-between text-sm font-semibold text-primary">
                    Explore programme <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
        {!visible.length && (
          <EmptyState
            title={
              meta.total
                ? "No programmes match your search"
                : "New programmes are being prepared"
            }
            description={
              meta.total
                ? "Try another skill or clear the filters."
                : "Contact our team to discuss training for your organization."
            }
          />
        )}
        <CatalogPagination
          ariaLabel="Programme pagination"
          page={page}
          pages={pages}
          pathname={ROUTES.courses}
        />
      </div>
    </section>
  );
}
