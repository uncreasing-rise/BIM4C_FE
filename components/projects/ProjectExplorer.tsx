"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";
import {
  ALL_PROJECT_FILTER,
  PROJECT_CATEGORIES,
  PROJECT_PAGE_SIZE,
} from "@/features/projects/constants";
import { filterProjects } from "@/features/projects/selectors/filter-projects";
import type { Project } from "@/features/projects/types/project";

const selectClass =
  "h-11 w-full border-0 bg-white px-3 text-[13px] text-[#444] outline-none transition focus:shadow-[inset_0_-2px_#ff5a36]";

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
    <section
      className="public-explorer project-explorer bg-white py-14 lg:py-16"
      id="project-list"
    >
      <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1200px] md:w-[calc(100%_-_48px)]">
        <header className="mb-8 max-w-[680px]">
          <p className="mb-[9px] text-[10px] font-semibold uppercase leading-[1.35] tracking-[.14em] text-[#ff5a36]">
            Danh mục dự án
          </p>
          <h2 className="text-[30px] font-semibold leading-[1.16] tracking-[-.025em] text-[#171717] md:text-[40px]">
            Năng lực qua từng công trình
          </h2>
        </header>
        <nav
          className="flex gap-6 overflow-x-auto border-y border-[#e9e6e3]"
          aria-label="Loại dự án"
        >
          {PROJECT_CATEGORIES.map((item) => (
            <button
              type="button"
              aria-pressed={category === item}
              className={`min-h-[50px] flex-none border-b-2 px-0 text-[13px] font-medium transition ${category === item ? "border-[#ff5a36] text-[#171717]" : "border-transparent text-[#777] hover:text-[#ff5a36]"}`}
              onClick={() => update(setCategory, item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="public-filter-bar mb-5 grid gap-px sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <label>
            <span className="sr-only">Tên dự án</span>
            <input
              className={selectClass}
              value={query}
              onChange={(event) => update(setQuery, event.target.value)}
              type="search"
              placeholder="Tìm tên dự án"
            />
          </label>
          <FilterSelect
            label="Vị trí"
            value={location}
            values={[...new Set(projects.map((item) => item.location))]}
            onChange={(value) => update(setLocation, value)}
          />
          <FilterSelect
            label="Thời gian"
            value={year}
            values={[...new Set(projects.map((item) => item.year))]}
            onChange={(value) => update(setYear, value)}
          />
          <FilterSelect
            label="Tiến độ"
            value={status}
            values={[...new Set(projects.map((item) => item.status))]}
            onChange={(value) => update(setStatus, value)}
          />
        </div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="m-0 text-[12px] text-[#888]">
            <strong className="font-semibold text-[#333]">
              {filtered.length}
            </strong>{" "}
            dự án phù hợp
          </p>
          <button
            className="text-[12px] font-semibold text-[#ff5a36]"
            type="button"
            onClick={reset}
          >
            Đặt lại
          </button>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <article
              className="group relative overflow-hidden rounded-[14px] border border-[#e9e6e3] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgb(28_20_16/10%)]"
              key={project.slug}
            >
              <Link
                className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#ff5a36]"
                href={ROUTES.projectDetail(project.slug)}
                aria-label={`Xem ${project.title}`}
              />
              <div className="relative aspect-[16/10] overflow-hidden bg-[#eee]">
                <Image
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width:767px) 100vw, (max-width:1279px) 50vw, 33vw"
                />
              </div>
              <div className="flex min-h-[196px] flex-col p-5 lg:p-6">
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[.1em] text-[#ff5a36]">
                  {project.category}
                </p>
                <h3 className="text-[21px] font-semibold leading-[1.3] tracking-[-.015em] text-[#171717]">
                  {project.title}
                </h3>
                <dl className="mt-4 grid gap-2 border-t border-[#e9e6e3] pt-4 text-[13px] text-[#666]">
                  <div className="flex justify-between gap-4">
                    <dt>Năm</dt>
                    <dd className="font-medium text-[#333]">{project.year}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Vị trí</dt>
                    <dd className="line-clamp-1 text-right font-medium text-[#333]">
                      {project.location}
                    </dd>
                  </div>
                </dl>
                <span className="mt-auto pt-5 text-[13px] font-semibold text-[#ff5a36]">
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
        {pages > 1 && (
          <Pagination page={page} pages={pages} onChange={setPage} />
        )}
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        className={selectClass}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option>Tất cả</option>
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav className="mt-9 flex justify-center gap-2" aria-label="Phân trang">
      <button
        className="size-10 rounded-full border border-[#e9e6e3] text-[#555] disabled:opacity-35"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ←
      </button>
      {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
        <button
          className={`size-10 rounded-full text-[13px] font-medium ${page === number ? "bg-[#ff5a36] text-white" : "border border-[#e9e6e3] text-[#555]"}`}
          aria-current={page === number ? "page" : undefined}
          onClick={() => onChange(number)}
          key={number}
        >
          {number}
        </button>
      ))}
      <button
        className="size-10 rounded-full border border-[#e9e6e3] text-[#555] disabled:opacity-35"
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
      >
        →
      </button>
    </nav>
  );
}
