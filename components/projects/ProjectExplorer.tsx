"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCatalogFilters } from "@/components/shared/useCatalogFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CatalogCategories,
  CatalogFilterBar,
  CatalogPagination,
  CatalogSearch,
  CatalogSelect,
} from "@/components/shared/CatalogControls";
import { ROUTES } from "@/constants/routes";
import {
  ALL_PROJECT_FILTER,
  PROJECT_CATEGORIES,
  PROJECT_PAGE_SIZE,
} from "@/features/projects/constants";
import { filterProjects } from "@/features/projects/selectors/filter-projects";
import type { Project } from "@/features/projects/types/project";
import { parsePage } from "@/lib/seo/listing";
import { toEnglishLabel } from "@/lib/utils/public-labels";

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const { searchParams, query, setQuery, update, reset, pending } =
    useCatalogFilters();
  const category = searchParams.get("category") ?? ALL_PROJECT_FILTER;
  const location = searchParams.get("location") ?? ALL_PROJECT_FILTER;
  const year = searchParams.get("year") ?? ALL_PROJECT_FILTER;
  const status = searchParams.get("status") ?? ALL_PROJECT_FILTER;
  const filtered = useMemo(
    () =>
      filterProjects(projects, {
        category,
        search: query,
        location,
        year,
        status,
      }),
    [projects, category, query, location, year, status],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PROJECT_PAGE_SIZE));
  const page = Math.min(parsePage(searchParams.get("page")), pages);
  const visible = filtered.slice(
    (page - 1) * PROJECT_PAGE_SIZE,
    page * PROJECT_PAGE_SIZE,
  );
  const hasFilters = Boolean(
    query ||
    category !== ALL_PROJECT_FILTER ||
    location !== ALL_PROJECT_FILTER ||
    year !== ALL_PROJECT_FILTER ||
    status !== ALL_PROJECT_FILTER,
  );

  return (
    <section
      className="bg-background py-12 lg:py-16"
      id="project-list"
      aria-busy={pending}
    >
      <div className="site-container">
        <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">Project catalogue</p>
            <h2 className="text-3xl font-semibold tracking-[-.035em] md:text-4xl">
              Find a project like yours
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end">
            Browse projects by type, location, year and delivery status.
          </p>
        </header>
        <CatalogCategories
          ariaLabel="Project type"
          items={PROJECT_CATEGORIES}
          value={category}
          formatLabel={toEnglishLabel}
          onChange={(value) => update("category", value)}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label="Project name"
            placeholder="Search projects"
            value={query}
            onChange={setQuery}
          />
          <CatalogSelect
            label="Location"
            value={location}
            values={[...new Set(projects.map((item) => item.location))]}
            onChange={(value) => update("location", value)}
            formatLabel={toEnglishLabel}
          />
          <CatalogSelect
            label="Year"
            value={year}
            values={[...new Set(projects.map((item) => item.year))]
              .sort()
              .reverse()}
            onChange={(value) => update("year", value)}
            formatLabel={toEnglishLabel}
          />
          <CatalogSelect
            label="Delivery status"
            value={status}
            values={[...new Set(projects.map((item) => item.status))]}
            onChange={(value) => update("status", value)}
            formatLabel={toEnglishLabel}
          />
        </CatalogFilterBar>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p
            className="m-0 text-[12px] text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {filtered.length ? (
              <>
                Showing {(page - 1) * PROJECT_PAGE_SIZE + 1}–
                {Math.min(page * PROJECT_PAGE_SIZE, filtered.length)} of{" "}
                <strong className="font-semibold text-foreground">
                  {filtered.length}
                </strong>{" "}
                projects
              </>
            ) : (
              "0 matching projects"
            )}
          </p>
          <button
            className="min-h-11 rounded-md px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-40"
            type="button"
            onClick={reset}
            disabled={!hasFilters}
            aria-label="Clear all project filters"
          >
            Reset filters
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {visible.map((project) => (
            <article
              className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
              key={project.slug}
            >
              <Link
                className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
                href={ROUTES.projectDetail(project.slug)}
                aria-label={`View ${project.title}`}
              />
              <div className="relative aspect-[16/8] overflow-hidden bg-muted">
                <Image
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width:767px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  {toEnglishLabel(project.category)}
                </p>
                <h3 className="text-2xl font-semibold leading-tight tracking-tight">
                  {project.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">
                  {project.description}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-y py-4 text-sm text-muted-foreground">
                  <div>
                    <dt>Year</dt>
                    <dd className="font-medium text-foreground">
                      {project.year}
                    </dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd className="line-clamp-1 font-medium text-foreground">
                      {project.location}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {project.status}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    Explore project →
                  </span>
                </div>
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <div className="md:col-span-2">
              <EmptyState
                title={
                  hasFilters
                    ? "No projects match your filters"
                    : "Projects are being prepared"
                }
                description={
                  hasFilters
                    ? "Try a broader search or clear the filters to see all projects."
                    : "Contact our team to discuss relevant experience for your project."
                }
              />
            </div>
          )}
        </div>
        <CatalogPagination
          ariaLabel="Project pagination"
          page={page}
          pages={pages}
          pathname={ROUTES.projects}
        />
      </div>
    </section>
  );
}
