"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECT_CATEGORIES } from "@/features/projects/constants";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/features/projects/types/project";

export function Projects({ projects }: { projects: Project[] }) {
  const [offset, setOffset] = useState(0);
  const [motion, setMotion] = useState<"idle" | "leaving" | "entering">("idle");
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const touchStart = useRef(0);
  const paused = useRef(false);
  const locked = useRef(false);
  const timers = useRef<number[]>([]);
  const visible = Array.from({ length: 5 }, (_, index) => projects[(offset + index) % projects.length]);
  const move = useCallback((step: number) => {
    if (locked.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOffset((value) => (value + step + projects.length) % projects.length); return; }
    locked.current = true;
    setDirection(step > 0 ? "next" : "previous");
    setOffset((value) => (value + step + projects.length) % projects.length);
    setMotion("entering");
    timers.current.push(window.setTimeout(() => {
      setMotion("idle");
      locked.current = false;
    }, 1000));
  }, [projects.length]);
  const selectProject = (index: number) => {
    if (index === offset || locked.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOffset(index); return; }
    locked.current = true;
    setDirection(index > offset ? "next" : "previous");
    setOffset(index);
    setMotion("entering");
    timers.current.push(window.setTimeout(() => {
      setMotion("idle");
      locked.current = false;
    }, 1000));
  };
  useEffect(() => { if (!projects.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const activeTimers = timers.current; const timer = window.setInterval(() => { if (!paused.current) move(1); }, 10000); return () => { window.clearInterval(timer); activeTimers.forEach(window.clearTimeout); }; }, [move, projects.length]);

  if (!projects.length) return null;

  return <section className="projects-carousel" id="projects">
    <header className="projects-carousel-head">
      <h2>DỰ ÁN NỔI BẬT</h2>
      <div role="tablist" aria-label="Danh mục dự án">{PROJECT_CATEGORIES.slice(1).map((category, index) => <button type="button" role="tab" aria-selected={index === offset} className={index === offset ? "active" : ""} onClick={() => selectProject(index)} disabled={motion !== "idle"} key={category}>{category}</button>)}</div>
    </header>
    <div className={`five-slide-stage is-${motion} move-${direction}`} onMouseEnter={() => paused.current = true} onMouseLeave={() => paused.current = false} onFocus={() => paused.current = true} onBlur={() => paused.current = false} onTouchStart={(event) => { paused.current = true; touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => { paused.current = false; const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1); }}>
      {visible.map((project, index) => <article className={`five-slide slide-${index}`} key={project.slug}>
        {index > 0 && index < 4 && <Link className="featured-project-link" href={ROUTES.projectDetail(project.slug)} aria-label={`Xem chi tiết dự án ${project.title}`}/>} 
        <Image src={project.image} alt={project.title} fill sizes={index === 0 || index === 4 ? "12vw" : "26vw"}/><div className="slide-shade"/>
        <div className="slide-content"><span>0{(offset + index) % projects.length + 1}</span><h3>{project.title}</h3>{index === 2 && <p className="slide-meta">{[project.category, project.location, project.year].filter(Boolean).join(" · ")}</p>}{index > 0 && index < 4 && <span className="slide-explore">KHÁM PHÁ <b>→</b></span>}</div>
      </article>)}
      <div className="featured-project-controls" aria-label="Điều khiển dự án nổi bật">
        <button className="five-arrow previous" type="button" onClick={() => move(-1)} disabled={motion !== "idle"} aria-label="Dự án trước">‹</button>
        <button className="five-arrow next" type="button" onClick={() => move(1)} disabled={motion !== "idle"} aria-label="Dự án tiếp theo">›</button>
      </div>
    </div>
    <div className="carousel-progress"><span>{String(offset + 1).padStart(2,"0")}</span><i><b style={{ width: `${((offset + 1) / projects.length) * 100}%` }}/></i><span>{String(projects.length).padStart(2,"0")}</span></div>
  </section>;
}
