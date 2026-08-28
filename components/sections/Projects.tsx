"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECT_CATEGORIES } from "@/features/projects/constants";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/features/projects/types/project";
import styles from "./FeaturedProjects.module.css";

export function Projects({ projects }: { projects: Project[] }) {
  const [offset, setOffset] = useState(0);
  const [motion, setMotion] = useState<"idle" | "entering">("idle");
  const [direction, setDirection] = useState<"left" | "right">("left");
  const touchStart = useRef(0);
  const paused = useRef(false);
  const locked = useRef(false);
  const timers = useRef<number[]>([]);
  const visible = Array.from({ length: 5 }, (_, index) => projects[(offset + index) % projects.length]);
  const move = useCallback((step: number, visualDirection: "left" | "right" = step < 0 ? "left" : "right") => {
    if (locked.current || projects.length < 2) return;
    locked.current = true;
    setDirection(visualDirection);
    setOffset((value) => (value - step + projects.length) % projects.length);
    setMotion("entering");
    timers.current.push(window.setTimeout(() => { setMotion("idle"); locked.current = false; }, 1200));
  }, [projects.length]);
  useEffect(() => { if (!projects.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const activeTimers = timers.current; const timer = window.setInterval(() => { if (!paused.current) move(1); }, 14000); return () => { window.clearInterval(timer); activeTimers.forEach(window.clearTimeout); }; }, [move, projects.length]);
  if (!projects.length) return null;
  return <section className={styles.section} id="projects">
    <header className={styles.header}>
      <div className={styles.eyebrow}>01 // PROJECTS</div>
      <div className={styles.headingRow}><h2>DỰ ÁN NỔI BẬT</h2><Link className={styles.sectionLink} href={ROUTES.projects}>XEM TẤT CẢ <span>↗</span></Link></div>
      <div className={styles.tabs} role="tablist" aria-label="Danh mục dự án">{PROJECT_CATEGORIES.slice(1).map((category, index) => <button type="button" role="tab" aria-selected={index === offset} className={index === offset ? styles.active : undefined} onClick={() => { if (index !== offset) move(index - offset); }} disabled={motion !== "idle"} key={category}>{category}</button>)}</div>
    </header>
    <div className={`${styles.stage} ${motion === "entering" ? styles.entering : ""} ${direction === "left" ? styles.directionLeft : styles.directionRight}`} onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }} onFocus={() => { paused.current = true; }} onBlur={() => { paused.current = false; }} onTouchStart={(event) => { paused.current = true; touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => { paused.current = false; const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1, distance < 0 ? "left" : "right"); }}>
      {visible.map((project, index) => <article className={`${styles.card} ${styles[`card${index}`]}`} key={project.slug}>
        {index > 0 && index < 4 && <Link className={styles.cardLink} href={ROUTES.projectDetail(project.slug)} aria-label={`Xem chi tiết dự án ${project.title}`} />}
        <Image className={styles.image} src={project.image} alt={project.title} fill sizes={index === 2 ? "34vw" : "18vw"} />
        <div className={styles.shade} />
        <div className={styles.content}><h3>{project.title}</h3>{index > 0 && index < 4 && <div className={styles.meta}>{project.location && <span><b aria-hidden="true">⌖</b>{project.location}</span>}{project.year && <span><b aria-hidden="true">◷</b>{project.year}</span>}{project.category && <span><b aria-hidden="true">▦</b>{project.category}</span>}</div>}{index > 0 && index < 4 && <span className={styles.explore}>XEM CHI TIẾT <b>→</b></span>}</div>
      </article>)}
      <div className={styles.controls}><button className={styles.arrow} type="button" onClick={() => move(-1)} disabled={motion !== "idle"} aria-label="Dự án trước">‹</button><button className={styles.arrow} type="button" onClick={() => move(1)} disabled={motion !== "idle"} aria-label="Dự án tiếp theo">›</button></div>
    </div>
    <div className={styles.progress}><span>{String(offset + 1).padStart(2, "0")}</span><i><b style={{ width: `${((offset + 1) / projects.length) * 100}%` }} /></i><span>{String(projects.length).padStart(2, "0")}</span></div>
  </section>;
}
