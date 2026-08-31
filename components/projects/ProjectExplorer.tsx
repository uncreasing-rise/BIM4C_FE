"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";
import { ALL_PROJECT_FILTER, PROJECT_CATEGORIES, PROJECT_PAGE_SIZE } from "@/features/projects/constants";
import { filterProjects } from "@/features/projects/selectors/filter-projects";
import type { Project } from "@/features/projects/types/project";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

const fieldClass = "min-w-0 bg-white px-3.5 py-2.5 text-[15px]";
const controlClass = "h-8 w-full border-0 bg-white p-0 text-[15px] text-[#163b3a] outline-none focus:shadow-[inset_0_-2px_#09a7a5]";

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState(ALL_PROJECT_FILTER), [query, setQuery] = useState(""), [location, setLocation] = useState(ALL_PROJECT_FILTER), [year, setYear] = useState(ALL_PROJECT_FILTER), [status, setStatus] = useState(ALL_PROJECT_FILTER), [page, setPage] = useState(1);
  const update = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const filtered = useMemo(() => filterProjects(projects, { category, search: query, location, year, status }), [projects, category, query, location, year, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PROJECT_PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PROJECT_PAGE_SIZE, page * PROJECT_PAGE_SIZE);
  const reset = () => { setCategory(ALL_PROJECT_FILTER); setQuery(""); setLocation(ALL_PROJECT_FILTER); setYear(ALL_PROJECT_FILTER); setStatus(ALL_PROJECT_FILTER); setPage(1); };

  return <section className="w-full bg-[#f5fafa] py-12 lg:py-16" id="project-list"><div className="mx-auto w-[calc(100%_-_32px)] max-w-[1440px] md:w-[calc(100%_-_48px)] lg:w-[calc(100%_-_80px)]">
    <div className="mb-[26px] flex overflow-x-auto border-b border-[#dbe7e5] md:mb-9" role="tablist" aria-label="Loại dự án">{PROJECT_CATEGORIES.map((item) => <button type="button" role="tab" aria-selected={category === item} className={`min-h-[52px] flex-none border-b-[3px] px-[15px] text-[17px] font-semibold md:px-[22px] ${category === item ? "border-[#09a7a5] text-[#09a7a5]" : "border-transparent text-[#667775]"}`} onClick={() => update(setCategory, item)} key={item}>{item}</button>)}</div>
    <div className="mb-5 grid grid-cols-1 gap-px border border-[#dbe7e5] bg-[#dbe7e5] md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]"><label className={fieldClass}><span className="mb-1 block text-xs font-semibold uppercase tracking-[.06em] text-[#063f46]">Tên dự án</span><input className={controlClass} value={query} onChange={(event) => update(setQuery, event.target.value)} type="search" placeholder="Tìm kiếm..." /></label><FilterSelect label="Vị trí" value={location} values={[...new Set(projects.map((item) => item.location))]} onChange={(value) => update(setLocation, value)} /><FilterSelect label="Thời gian" value={year} values={[...new Set(projects.map((item) => item.year))]} onChange={(value) => update(setYear, value)} /><FilterSelect label="Tiến độ" value={status} values={[...new Set(projects.map((item) => item.status))]} onChange={(value) => update(setStatus, value)} /></div>
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><p className="m-0 text-label text-[#667775]"><strong className="text-xl text-[#063f46]">{filtered.length}</strong> dự án phù hợp</p><button className="self-start whitespace-nowrap text-xs font-semibold uppercase text-[#09a7a5] sm:self-auto" type="button" onClick={reset}>Đặt lại bộ lọc</button></div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{visible.map((project) => <article className="group relative aspect-[16/10] overflow-hidden bg-[#063f46] shadow-sm" key={project.slug}>
      <Link className="absolute inset-0 z-10 block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white" href={ROUTES.projectDetail(project.slug)} aria-label={`Xem ${project.title}`}>
      <Image className="object-cover transition-transform ease-out group-hover:scale-[1.015] group-focus-within:scale-[1.015]" src={project.image} alt={project.title} fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#063f46]/95 via-[#063f46]/10 to-transparent transition-colors group-hover:via-[#063f46]/40 group-focus-within:via-[#063f46]/40" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white lg:p-6">
        <h2 className="text-[20px] font-bold leading-tight">{project.title}</h2>
        <div className="max-h-0 translate-y-3 overflow-hidden opacity-0 transition-[max-height,opacity,transform,margin] ease-[cubic-bezier(.22,1,.36,1)] group-hover:mt-4 group-hover:max-h-56 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:mt-4 group-focus-within:max-h-56 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <p className="mb-3 text-[15px] font-normal text-white">{project.category}</p>
          <dl className="grid gap-2 border-t border-white/40 pt-3 text-[15px] font-normal text-white">
            <div className="flex items-center gap-2"><dt className="text-white"><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg><span className="sr-only">Năm</span></dt><dd>{project.year}</dd></div>
            <div className="flex items-start gap-2"><dt className="mt-0.5 text-white"><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span className="sr-only">Vị trí</span></dt><dd className="line-clamp-1">{project.location}</dd></div>
          </dl>
          <span className="mt-4 inline-flex min-h-11 items-center gap-3 border border-white/45 bg-white/10 px-5 text-[15px] font-normal text-white backdrop-blur-sm transition-colors hover:border-[#09a7a5] hover:bg-[#09a7a5]">Xem dự án <ArrowIcon className="size-5" /></span>
        </div>
      </div>
      </Link>
    </article>)}{visible.length === 0 && <EmptyState title="Không tìm thấy dự án" description="Hãy thử thay đổi hoặc đặt lại bộ lọc." />}</div>
    {pages > 1 && <Pagination page={page} pages={pages} onChange={setPage} />}
  </div></section>;
}

function FilterSelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) { return <label className={fieldClass}><span className="mb-1 block text-xs font-semibold text-[#063f46]">{label}</span><select className={controlClass} value={value} onChange={(event) => onChange(event.target.value)}><option>Tất cả</option>{values.map((item) => <option key={item}>{item}</option>)}</select></label>; }

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) { const button = "h-10 min-w-10 border-b-2 bg-transparent px-2 text-[15px] text-[#667775] transition-colors hover:text-[#09a7a5]"; return <nav className="mt-[42px] flex justify-center gap-2" aria-label="Phân trang"><button className={`${button} border-transparent font-normal disabled:cursor-not-allowed disabled:opacity-35`} type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>←</button>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button type="button" className={`${button} ${page === number ? "text-[#09a7a5]" : ""}`} style={{ borderBottomColor: page === number ? "#09a7a5" : "transparent", fontWeight: page === number ? 700 : 400 }} aria-current={page === number ? "page" : undefined} onClick={() => onChange(number)} key={number}>{String(number).padStart(2, "0")}</button>)}<button className={`${button} border-transparent font-normal disabled:cursor-not-allowed disabled:opacity-35`} type="button" disabled={page === pages} onClick={() => onChange(page + 1)}>→</button></nav>; }
