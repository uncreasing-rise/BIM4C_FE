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
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import type { PageMeta } from "@/features/shared/types/pagination";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContentList } from "@/lib/i18n/localize";

export function ProjectExplorer({
  projects: rawProjects,
  meta,
}: {
  projects: Project[];
  meta: PageMeta;
}) {
  const { t, locale } = useLanguage();
  const projects = localizeContentList(rawProjects, locale);

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

  const formatFilterLabel = (val: string) => toLocalizedLabel(val, locale);

  return (
    <section
      className="bg-background py-12 lg:py-16"
      id="project-list"
      aria-busy={pending}
    >
      <div className="site-container">
        <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">{t.projectsPage.eyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-[-.035em] md:text-4xl">
              {t.projectsPage.catalogueTitle}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end">
            {t.projectsPage.catalogueDesc}
          </p>
        </header>
        <CatalogCategories
          ariaLabel={t.projectsPage.catalogueTitle}
          items={PROJECT_CATEGORIES}
          value={category}
          formatLabel={formatFilterLabel}
          onChange={(value) => update("category", value)}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label={t.projectsPage.searchLabel}
            placeholder={t.projectsPage.searchPlaceholder}
            value={query}
            onChange={setQuery}
          />
          <CatalogSelect
            label={t.projectsPage.locationFilter}
            value={location}
            values={[...new Set(projects.map((item) => item.location))]}
            onChange={(value) => update("location", value)}
            formatLabel={formatFilterLabel}
          />
          <CatalogSelect
            label={t.projectsPage.yearFilter}
            value={year}
            values={[...new Set(projects.map((item) => item.year))]
              .sort()
              .reverse()}
            onChange={(value) => update("year", value)}
            formatLabel={formatFilterLabel}
          />
          <CatalogSelect
            label={t.projectsPage.statusFilter}
            value={status}
            values={[...new Set(projects.map((item) => item.status))]}
            onChange={(value) => update("status", value)}
            formatLabel={formatFilterLabel}
          />
        </CatalogFilterBar>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p
            className="m-0 text-[12px] text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {meta.total ? (
              t.projectsPage.showingText(
                Math.min(page * PROJECT_PAGE_SIZE, meta.total),
                meta.total,
              )
            ) : (
              t.projectsPage.matchingCount(0)
            )}
          </p>
          <button
            className="min-h-11 rounded-md px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-40"
            type="button"
            onClick={reset}
            disabled={!hasFilters}
            aria-label={t.projectsPage.resetFilters}
          >
            {t.projectsPage.resetFilters}
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
                    ? t.projectsPage.emptyTitleFilters
                    : t.projectsPage.emptyTitleGeneral
                }
                description={
                  hasFilters
                    ? t.projectsPage.emptyDescFilters
                    : t.projectsPage.emptyDescGeneral
                }
              />
            </div>
          )}
        </div>
        <CatalogPagination
          ariaLabel={t.projectsPage.catalogueTitle}
          page={page}
          pages={pages}
          pathname={ROUTES.projects}
        />
      </div>
    </section>
  );
}
