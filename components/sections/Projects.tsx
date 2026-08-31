"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/features/projects/types/project";


export function Projects({ projects }: { projects: Project[] }) {
  const all = "Tất cả";
  const categories = [all, ...Array.from(new Set(projects.map(project => project.category).filter(Boolean)))];
  const [category, setCategory] = useState(all), [active, setActive] = useState(0), [previous, setPrevious] = useState<number | null>(null);
  const touchStart = useRef(0), wheelDistance = useRef(0), wheelLocked = useRef(false);
  const filtered = category === all ? projects : projects.filter(project => project.category === category), items = filtered.slice(0, 3);
  useEffect(() => { if (previous === null) return; const timer = window.setTimeout(() => setPrevious(null), 820); return () => window.clearTimeout(timer); }, [previous]);
  if (!items.length) return null;
  const move = (step: number) => setActive(value => { const next = (value + step + items.length) % items.length; setPrevious(value); return next; });
  const renderTrack = (trackActive: number, layer: "old" | "current") => { const slots = items.length === 3 ? [items[(trackActive + 2) % 3], items[trackActive], items[(trackActive + 1) % 3]] : items; return <div className={`apple-project-trio-grid ${layer}`}>{slots.map((project, index) => <article className={index === 1 || items.length < 3 ? "main" : "side"} key={`${project.slug}-${index}-${trackActive}`}><Link href={ROUTES.projectDetail(project.slug)}><div><Image src={project.image} alt={project.title} fill sizes={index === 1 ? "(max-width:833px) 86vw,64vw" : "18vw"} className="object-cover" /><section><b>Xem dự án <span>›</span></b><p>{project.category}</p><h3>{project.title}</h3><small>{project.location}{project.year ? ` · ${project.year}` : ""}</small></section></div></Link></article>)}</div>; };
  return <section className="apple-project-gallery apple-project-trio" id="projects" aria-label="Dự án nổi bật"><header className="apple-project-heading"><p className="apple-kicker">Dự án nổi bật</p><h2>Những công trình tạo dấu ấn.</h2><p>Năng lực BIM được kiểm chứng qua những dự án thực tế.</p><Link className="apple-link" href={ROUTES.projects}>Xem tất cả dự án <span>›</span></Link></header><nav className="apple-project-filters" aria-label="Danh mục dự án">{categories.map(item => <button type="button" className={item === category ? "active" : ""} aria-pressed={item === category} onClick={() => { setCategory(item); setActive(0); setPrevious(null); }} key={item}>{item}</button>)}</nav><div className="apple-project-crossfade" onWheel={event => { if (items.length < 2 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return; event.preventDefault(); if (wheelLocked.current) return; wheelDistance.current += event.deltaX; if (Math.abs(wheelDistance.current) < 40) return; move(wheelDistance.current > 0 ? 1 : -1); wheelDistance.current = 0; wheelLocked.current = true; window.setTimeout(() => { wheelLocked.current = false; }, 420); }} onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => { const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1); }}>{previous !== null && renderTrack(previous, "old")}{renderTrack(active, "current")}</div>{items.length > 1 ? <div className="apple-project-dots" aria-label={`Dự án ${active + 1} trên ${items.length}`}>{items.map((project, index) => <button type="button" className={index === active ? "active" : ""} onClick={() => { setPrevious(active); setActive(index); }} aria-label={`Hiển thị dự án ${index + 1}`} aria-current={index === active} key={project.slug} />)}</div> : null}</section>;
}
