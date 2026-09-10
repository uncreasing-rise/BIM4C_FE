"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
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
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(
    searchParams.get("category") ?? ALL_PROJECT_FILTER,
  );
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(
    searchParams.get("location") ?? ALL_PROJECT_FILTER,
  );
  const [year, setYear] = useState(
    searchParams.get("year") ?? ALL_PROJECT_FILTER,
  );
  const [status, setStatus] = useState(
    searchParams.get("status") ?? ALL_PROJECT_FILTER,
  );
  const router = useRouter();
  const page = parsePage(searchParams.get("page"));
  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (!value || value === ALL_PROJECT_FILTER) params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.replace(`${ROUTES.projects}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  };
  const update = (
    setter: (value: string) => void,
    key: string,
    value: string,
  ) => {
    setter(value);
    updateUrl(key, value);
  };
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
  const reset = () => {
    setCategory(ALL_PROJECT_FILTER);
    setQuery("");
    setLocation(ALL_PROJECT_FILTER);
    setYear(ALL_PROJECT_FILTER);
    setStatus(ALL_PROJECT_FILTER);
    router.replace(ROUTES.projects, { scroll: false });
  };

  return (
    <section className="bg-background py-20 lg:py-24" id="project-list">
      <div className="site-container">
        <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">Project catalogue</p>
            <h2 className="text-3xl font-semibold tracking-[-.04em] md:text-5xl">
              Capability, proven in every project
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
          onChange={(value) => update(setCategory, "category", value)}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label="Project name"
            placeholder="Search projects"
            value={query}
            onChange={(value) => update(setQuery, "q", value)}
          />
          <CatalogSelect
            label="Location"
            value={location}
            values={[...new Set(projects.map((item) => item.location))]}
            onChange={(value) => update(setLocation, "location", value)}
            formatLabel={toEnglishLabel}
          />
          <CatalogSelect
            label="Year"
            value={year}
            values={[...new Set(projects.map((item) => item.year))]}
            onChange={(value) => update(setYear, "year", value)}
            formatLabel={toEnglishLabel}
          />
          <CatalogSelect
            label="Delivery status"
            value={status}
            values={[...new Set(projects.map((item) => item.status))]}
            onChange={(value) => update(setStatus, "status", value)}
            formatLabel={toEnglishLabel}
          />
        </CatalogFilterBar>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p
            className="m-0 text-[12px] text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <strong className="font-semibold text-foreground">
              {filtered.length}
            </strong>{" "}
            matching projects
          </p>
          <button
            className="rounded-md px-2 py-1 text-[12px] font-semibold text-primary transition hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-40"
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
            <article
              className="group relative grid gap-7 border-b py-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-14 lg:py-12"
              key={project.slug}
            >
              <Link
                className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
                href={ROUTES.projectDetail(project.slug)}
                aria-label={`View ${project.title}`}
              />
              <div
                className={`relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted ${index % 2 ? "lg:order-2" : ""}`}
              >
                <Image
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width:767px) 100vw, (max-width:1279px) 50vw, 33vw"
                />
              </div>
              <div className={index % 2 ? "lg:order-1" : ""}>
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[.1em] text-primary">
                  {toEnglishLabel(project.category)}
                </p>
                <h3 className="text-3xl font-semibold leading-tight tracking-[-.04em] md:text-4xl">
                  {project.title}
                </h3>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {project.description}
                </p>
                <dl className="mt-5 grid gap-2 border-t pt-4 text-[13px] text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>Year</dt>
                    <dd className="font-medium text-foreground">
                      {project.year}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Location</dt>
                    <dd className="line-clamp-1 text-right font-medium text-foreground">
                      {project.location}
                    </dd>
                  </div>
                </dl>
                <span className="mt-auto pt-5 text-[13px] font-semibold text-primary">
                  Explore project →
                </span>
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <EmptyState
              title="No projects found"
              description="Try a different search or reset the filters."
            />
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
