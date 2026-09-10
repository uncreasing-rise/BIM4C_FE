"use client";

import { ProjectRow } from "@/components/projects/ProjectRow";
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
import type { Project } from "@/features/projects/types/project";
import { toEnglishLabel } from "@/lib/utils/public-labels";
import type { PageMeta } from "@/features/shared/types/pagination";

export function ProjectExplorer({
  projects,
  meta,
}: {
  projects: Project[];
  meta: PageMeta;
}) {
  const { searchParams, query, setQuery, update, reset, pending } =
    useCatalogFilters();
  const category = searchParams.get("category") ?? ALL_PROJECT_FILTER;
  const location = searchParams.get("location") ?? ALL_PROJECT_FILTER;
  const year = searchParams.get("year") ?? ALL_PROJECT_FILTER;
  const status = searchParams.get("status") ?? ALL_PROJECT_FILTER;
  const pages = meta.totalPages;
  const page = meta.page;
  const visible = projects;
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
            {meta.total ? (
              <>
                Showing {(page - 1) * PROJECT_PAGE_SIZE + 1}–
                {Math.min(page * PROJECT_PAGE_SIZE, meta.total)} of{" "}
                <strong className="font-semibold text-foreground">
                  {meta.total}
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
        <div className="border-t">
          {visible.map((project, index) => (
            <ProjectRow
              key={project.slug}
              project={project}
              number={(page - 1) * PROJECT_PAGE_SIZE + index + 1}
            />
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
