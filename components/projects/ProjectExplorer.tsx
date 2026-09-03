"use client";

import Image from "next/image";
import Link from "next/link";
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

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState(ALL_PROJECT_FILTER);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(ALL_PROJECT_FILTER);
  const [year, setYear] = useState(ALL_PROJECT_FILTER);
  const [status, setStatus] = useState(ALL_PROJECT_FILTER);
  const [page, setPage] = useState(1);
  const update = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
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
  const reset = () => {
    setCategory(ALL_PROJECT_FILTER);
    setQuery("");
    setLocation(ALL_PROJECT_FILTER);
    setYear(ALL_PROJECT_FILTER);
    setStatus(ALL_PROJECT_FILTER);
    setPage(1);
  };

  return (
    <section className="bg-background py-20 lg:py-24" id="project-list">
      <div className="site-container">
        <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">Danh mục dự án</p>
            <h2 className="text-3xl font-semibold tracking-[-.04em] md:text-5xl">
              Năng lực qua từng công trình
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end">
            Tìm kiếm dự án theo loại hình, vị trí, thời gian và trạng thái triển
            khai.
          </p>
        </header>
        <CatalogCategories
          ariaLabel="Loại dự án"
          items={PROJECT_CATEGORIES}
          value={category}
          onChange={(value) => update(setCategory, value)}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label="Tên dự án"
            placeholder="Tìm tên dự án"
            value={query}
            onChange={(value) => update(setQuery, value)}
          />
          <CatalogSelect
            label="Vị trí"
            value={location}
            values={[...new Set(projects.map((item) => item.location))]}
            onChange={(value) => update(setLocation, value)}
          />
          <CatalogSelect
            label="Thời gian"
            value={year}
            values={[...new Set(projects.map((item) => item.year))]}
            onChange={(value) => update(setYear, value)}
          />
          <CatalogSelect
            label="Tiến độ"
            value={status}
            values={[...new Set(projects.map((item) => item.status))]}
            onChange={(value) => update(setStatus, value)}
          />
        </CatalogFilterBar>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="m-0 text-[12px] text-muted-foreground">
            <strong className="font-semibold text-foreground">
              {filtered.length}
            </strong>{" "}
            dự án phù hợp
          </p>
          <button
            className="text-[12px] font-semibold text-primary"
            type="button"
            onClick={reset}
          >
            Đặt lại
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
                aria-label={`Xem ${project.title}`}
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
                  {project.category}
                </p>
                <h3 className="text-3xl font-semibold leading-tight tracking-[-.04em] md:text-4xl">
                  {project.title}
                </h3>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {project.description}
                </p>
                <dl className="mt-5 grid gap-2 border-t pt-4 text-[13px] text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>Năm</dt>
                    <dd className="font-medium text-foreground">
                      {project.year}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Vị trí</dt>
                    <dd className="line-clamp-1 text-right font-medium text-foreground">
                      {project.location}
                    </dd>
                  </div>
                </dl>
                <span className="mt-auto pt-5 text-[13px] font-semibold text-primary">
                  Khám phá dự án →
                </span>
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <EmptyState
              title="Không tìm thấy dự án"
              description="Hãy thử thay đổi hoặc đặt lại bộ lọc."
            />
          )}
        </div>
        <CatalogPagination
          ariaLabel="Phân trang dự án"
          page={page}
          pages={pages}
          onChange={setPage}
        />
      </div>
    </section>
  );
}
