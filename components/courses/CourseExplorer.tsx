"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import styles from "./CourseExplorer.module.css";

export function CourseExplorer({ courses }: { courses: ContentEntry[] }) {
  const categories = useMemo(() => ["Tất cả", ...new Set(courses.map((course) => course.eyebrow).filter(Boolean))], [courses]);
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => courses.filter((course) => (category === "Tất cả" || course.eyebrow === category) && (!query || `${course.title} ${course.description}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")))), [courses, category, query]);

  return <section className={`public-explorer course-explorer ${styles.page}`} aria-label="Các chương trình đào tạo"><div className={styles.section}>
    <header className={styles.heading}><p className={styles.headingKicker}>Chương trình đào tạo</p><h2 className={styles.headingTitle}>Năng lực có thể áp dụng ngay</h2><p className={styles.headingDescription}>Chọn chương trình phù hợp với công việc và mục tiêu phát triển của bạn.</p></header>
    <nav className="public-category-nav" aria-label="Danh mục đào tạo">{categories.map((item) => <button type="button" className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)} key={item}>{item}</button>)}</nav><div className="public-filter-bar mb-5"><label className="public-search-field"><span className="sr-only">Tìm khóa học</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm chương trình" /></label></div>
    <p className="mb-5 text-[12px] text-[#888]"><strong className="font-semibold text-[#333]">{filtered.length}</strong> chương trình phù hợp</p>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((course) => <article className={`group relative flex ${styles.card}`} id={course.slug} key={course.slug}><Link className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#ff5a36]" href={ROUTES.courseDetail(course.slug)} aria-label={`Xem ${course.title}`} /><div className={styles.cardImage}><Image className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" src={course.image} alt={course.title} fill sizes="(max-width:767px) 100vw, (max-width:1279px) 50vw, 33vw" /></div><div className={styles.cardBody}><p className={styles.cardKicker}>{course.eyebrow}</p><h3 className={styles.cardTitle}>{course.title}</h3><p className={styles.cardDescription}>{course.description}</p>{course.highlights.length > 0 && <ul className={styles.cardHighlights}>{course.highlights.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>}<span className={styles.cardLink}>Xem chương trình →</span></div></article>)}</div>{filtered.length === 0 && <p className="border-t border-[#e9e6e3] py-10 text-center text-[14px] text-[#777]">Không tìm thấy chương trình phù hợp.</p>}
  </div></section>;
}
