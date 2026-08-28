"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/features/projects/types/project";
import { HomepageSectionHeader } from "./HomepageSectionHeader";

const desktopCardVisibility = ["hidden lg:block lg:h-[80%]", "hidden lg:block", "block", "hidden lg:block", "hidden lg:block lg:h-[80%]"];

export function Projects({ projects }: { projects: Project[] }) {
  const [offset, setOffset] = useState(0);
  const [motion, setMotion] = useState<-1 | 0 | 1>(0);
  const touchStart = useRef(0);
  const categoryProjects = projects;
  const visible = Array.from({ length: 5 }, (_, index) => categoryProjects[(offset + index) % categoryProjects.length]);
  const move = useCallback((step: number) => {
    if (categoryProjects.length < 2) return;
    setOffset((current) => (current + step + categoryProjects.length) % categoryProjects.length);
  }, [categoryProjects.length]);
  const navigate = (step: -1 | 1) => {
    if (motion || categoryProjects.length < 2) return;
    setMotion(step);
    window.setTimeout(() => move(step), 220);
    window.setTimeout(() => setMotion(0), 520);
  };

  if (!projects.length) return null;

  return <section id="projects" aria-label="Dự án nổi bật" className="relative flex min-h-[calc(100svh-68px)] flex-col overflow-hidden border-b border-[#dbe7e5] bg-white py-16 lg:min-h-[calc(100svh-84px)] lg:py-24">
    <div className="pointer-events-none absolute -right-24 top-0 h-[46%] w-[36%] skew-x-[-18deg] bg-[#eaf8f7]" aria-hidden="true" />
    <div className="pointer-events-none absolute bottom-0 left-[12%] h-px w-52 -rotate-[18deg] bg-[#09a7a5]/35" aria-hidden="true" />
    <div className="relative z-10 mx-auto w-[calc(100%_-_32px)] max-w-[1400px] md:w-[calc(100%_-_64px)]"><HomepageSectionHeader title="DỰ ÁN NỔI BẬT" action="XEM TẤT CẢ DỰ ÁN" href={ROUTES.projects}/></div>
    <div className="relative mx-4 h-[520px] flex-none lg:h-[620px] lg:mx-0 lg:grid lg:grid-cols-[minmax(84px,.155fr)_repeat(3,minmax(0,1fr))_minmax(84px,.17fr)] lg:items-center lg:gap-[21px]" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => { const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) navigate(distance < 0 ? 1 : -1); }}>
      {visible.map((project, index) => <article style={{ transitionDelay: `${index * 35}ms` }} className={`group relative h-full min-w-0 transform-gpu overflow-hidden bg-[#667775] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${motion === -1 ? "translate-x-1.5 opacity-90" : motion === 1 ? "-translate-x-1.5 opacity-90" : "translate-x-0 opacity-100"} ${desktopCardVisibility[index]} ${index > 0 && index < 4 ? "min-h-[420px] lg:min-h-[560px]" : ""}`} key={`${project.slug}-${index}`}>
        <Link className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white" href={ROUTES.projectDetail(project.slug)} aria-label={`Xem dự án ${project.title}`}>
          <Image className="object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-[1.025]" src={project.image} alt={project.title} fill sizes={index === 0 || index === 4 ? "10vw" : "(max-width: 1023px) 100vw, 30vw"} />
          <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-colors duration-500 group-hover:from-[#063f46]/95 group-hover:via-[#063f46]/35" />
          <div className={`absolute inset-x-0 bottom-0 text-white ${index === 0 || index === 4 ? "p-4" : "p-5 lg:p-7"}`}>
            <p className="mb-2 text-micro font-semibold uppercase tracking-[.12em] text-[#ffffff]">{project.category}</p>
            <h3 className={`m-0 font-semibold uppercase leading-snug [text-shadow:0_1px_2px_rgb(0_0_0/.35)] ${index === 0 || index === 4 ? "whitespace-nowrap text-sm" : "text-lg lg:text-xl"}`}>{project.title}</h3>
            <dl className={`grid overflow-hidden text-xs transition-[max-height,opacity,margin] duration-500 group-hover:mt-4 group-hover:max-h-52 group-hover:opacity-100 group-focus-within:mt-4 group-focus-within:max-h-52 group-focus-within:opacity-100 ${index === 0 || index === 4 ? "hidden" : "mt-4 max-h-52 opacity-100 lg:mt-0 lg:max-h-0 lg:opacity-0"}`}>
              <div className="grid grid-cols-[62px_1fr] gap-2 border-t border-white/25 py-2"><dt className="font-semibold uppercase text-white/60">Năm</dt><dd>{project.year}</dd></div>
              <div className="grid grid-cols-[62px_1fr] gap-2 border-t border-white/25 py-2"><dt className="font-semibold uppercase text-white/60">Vị trí</dt><dd className="line-clamp-2">{project.location}</dd></div>
              <div className="grid grid-cols-[62px_1fr] gap-2 border-t border-white/25 py-2"><dt className="font-semibold uppercase text-white/60">Quy mô</dt><dd className="line-clamp-2">{project.scale ?? "Đang cập nhật"}</dd></div>
              <div className="grid grid-cols-[62px_1fr] gap-2 border-t border-white/25 py-2"><dt className="font-semibold uppercase text-white/60">Tiến độ</dt><dd>{project.status}</dd></div>
            </dl>
            <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-[.06em] text-white">XEM DỰ ÁN <b className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</b></span>
          </div>
        </Link>
      </article>)}
      <button className="absolute left-0 top-1/2 z-20 h-[50px] w-[50px] -translate-y-1/2 bg-transparent transition-transform hover:-translate-x-1 hover:-translate-y-1/2 disabled:opacity-50 lg:h-[54px] lg:w-[84px]" type="button" disabled={motion !== 0} onClick={() => navigate(-1)} aria-label="Dự án trước"><span aria-hidden="true" className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-[-135deg] border-r-4 border-t-4 border-white drop-shadow-md lg:left-9" /></button>
      <button className="absolute right-0 top-1/2 z-20 h-[50px] w-[50px] -translate-y-1/2 bg-transparent transition-transform hover:translate-x-1 hover:-translate-y-1/2 disabled:opacity-50 lg:h-[54px] lg:w-[84px]" type="button" disabled={motion !== 0} onClick={() => navigate(1)} aria-label="Dự án tiếp theo"><span aria-hidden="true" className="absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-r-4 border-t-4 border-white drop-shadow-md lg:right-9" /></button>
    </div>
  </section>;
}
