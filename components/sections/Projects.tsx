"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/features/projects/types/project";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { HomepageSectionHeader } from "./HomepageSectionHeader";
import { HomepageSectionToolbar } from "./HomepageSectionToolbar";

const desktopCardVisibility = ["hidden lg:block lg:h-[80%]", "hidden lg:block", "block", "hidden lg:block", "hidden lg:block lg:h-[80%]"];

export function Projects({ projects }: { projects: Project[] }) {
  const categories = ["Tất cả", ...Array.from(new Set(projects.map((project) => project.category).filter(Boolean)))];
  const [category, setCategory] = useState("Tất cả");
  const [offset, setOffset] = useState(0);
  const [motion, setMotion] = useState<-1 | 0 | 1>(0);
  const touchStart = useRef(0);
  const motionTimer = useRef<number | null>(null);
  const categoryProjects = category === "Tất cả" ? projects : projects.filter((project) => project.category === category);
  const visible = Array.from({ length: 5 }, (_, index) => categoryProjects[(offset + index) % categoryProjects.length]);
  const move = useCallback((step: number) => {
    if (categoryProjects.length < 2) return;
    setOffset((current) => (current + step + categoryProjects.length) % categoryProjects.length);
  }, [categoryProjects.length]);
  const navigate = (step: -1 | 1) => {
    if (motion || categoryProjects.length < 2) return;
    setMotion(step);
    move(step);
    if (motionTimer.current) window.clearTimeout(motionTimer.current);
    motionTimer.current = window.setTimeout(() => setMotion(0), 500);
  };

  useEffect(() => () => {
    if (motionTimer.current) window.clearTimeout(motionTimer.current);
  }, []);

  if (!projects.length) return null;

  return <section id="projects" aria-label="Dự án nổi bật" className="home-section relative flex min-h-[calc(100svh-68px)] flex-col overflow-hidden border-b border-[#dbe7e5] bg-white lg:min-h-[calc(100svh-84px)]">
    <div className="pointer-events-none absolute -right-24 top-0 h-[46%] w-[36%] skew-x-[-18deg] bg-[#eaf8f7]" aria-hidden="true" />
    <div className="pointer-events-none absolute bottom-0 left-[12%] h-px w-52 -rotate-[18deg] bg-[#09a7a5]/35" aria-hidden="true" />
    <div className="home-container relative z-10"><HomepageSectionHeader title="DỰ ÁN NỔI BẬT">
      <HomepageSectionToolbar categories={categories} selected={category} onSelect={(item) => { setCategory(item); setOffset(0); setMotion(0); }} ariaLabel="Danh mục dự án nổi bật" ctaHref={ROUTES.projects} ctaLabel="Xem tất cả dự án" />
    </HomepageSectionHeader></div>
    <div className="relative mx-4 h-[520px] flex-none lg:h-[620px] lg:mx-0 lg:grid lg:grid-cols-[minmax(84px,.155fr)_repeat(3,minmax(0,1fr))_minmax(84px,.17fr)] lg:items-center lg:gap-[21px]" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => { const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) navigate(distance < 0 ? 1 : -1); }}>
      {visible.map((project, index) => <article style={{ animationDelay: `${index * 24}ms` }} className={`group relative h-full min-w-0 transform-gpu overflow-hidden bg-[#667775] motion-reduce:animate-none ${motion === -1 ? "project-slide-previous" : motion === 1 ? "project-slide-next" : ""} ${desktopCardVisibility[index]} ${index > 0 && index < 4 ? "min-h-[420px] lg:min-h-[560px]" : ""}`} key={`${project.slug}-${index}-${offset}`}>
        <Link className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white" href={ROUTES.projectDetail(project.slug)} aria-label={`Xem dự án ${project.title}`}>
          <Image className="object-cover transition-transform duration-[1100ms] ease-out motion-reduce:transition-none group-hover:scale-[1.015]" src={project.image} alt={project.title} fill sizes={index === 0 || index === 4 ? "10vw" : "(max-width: 1023px) 100vw, 30vw"} />
          <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-colors duration-700 group-hover:from-[#063f46]/95 group-hover:via-[#063f46]/35" />
          {index > 0 && index < 4 && <div className="absolute inset-x-0 bottom-0 p-5 text-white lg:p-7">
            <h3 className="m-0 text-2xl font-bold leading-snug [text-shadow:0_1px_2px_rgb(0_0_0/.35)]">{project.title}</h3>
            <div className="max-h-0 translate-y-3 overflow-hidden opacity-0 transition-[max-height,opacity,transform,margin] duration-[1000ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:mt-4 group-hover:max-h-64 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:mt-4 group-focus-within:max-h-64 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <p className="mb-3 text-micro font-normal text-white/75">{project.category}</p>
              <dl className="grid gap-2 border-t border-white/25 pt-3 text-xs font-normal">
                <div className="flex items-center gap-2"><dt className="text-[#09a7a5]"><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg><span className="sr-only">Năm</span></dt><dd>{project.year}</dd></div>
                <div className="flex items-start gap-2"><dt className="mt-0.5 text-[#09a7a5]"><svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span className="sr-only">Vị trí</span></dt><dd className="line-clamp-2">{project.location}</dd></div>
              </dl>
              <span className="group/cta mt-5 inline-flex min-h-11 items-center gap-3 border border-white/65 bg-transparent px-5 text-[14px] font-semibold text-white transition-[background-color,border-color,color] duration-300 hover:border-[#09a7a5] hover:bg-[#09a7a5]">Xem dự án <ArrowIcon className="size-5 transition-transform group-hover/cta:translate-x-1" /></span>
            </div>
          </div>}
        </Link>
      </article>)}
      <button className="absolute left-0 top-1/2 z-20 grid h-[50px] w-[50px] -translate-y-1/2 place-items-center bg-transparent text-white transition-transform hover:-translate-x-1 hover:-translate-y-1/2 disabled:opacity-50 lg:h-[54px] lg:w-[84px]" type="button" disabled={motion !== 0} onClick={() => navigate(-1)} aria-label="Dự án trước"><ArrowIcon direction="left" className="size-7 drop-shadow-md" /></button>
      <button className="absolute right-0 top-1/2 z-20 grid h-[50px] w-[50px] -translate-y-1/2 place-items-center bg-transparent text-white transition-transform hover:translate-x-1 hover:-translate-y-1/2 disabled:opacity-50 lg:h-[54px] lg:w-[84px]" type="button" disabled={motion !== 0} onClick={() => navigate(1)} aria-label="Dự án tiếp theo"><ArrowIcon className="size-7 drop-shadow-md" /></button>
    </div>
  </section>;
}
