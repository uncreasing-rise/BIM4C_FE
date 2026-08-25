"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ContentEntry } from "@/types/content";

const pageSize = 9;

export function BlogExplorer({ posts }: { posts: ContentEntry[] }) {
  const categories = useMemo(() => ["Tất cả", ...new Set(posts.map((item) => item.eyebrow))], [posts]);
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () => posts.filter((item) =>
      (category === "Tất cả" || item.eyebrow === category) &&
      (!query || `${item.title} ${item.description}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")))),
    [posts, category, query],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const featured = visible.slice(0, 3);
  const standard = visible.slice(3);
  const chooseCategory = (value: string) => { setCategory(value); setPage(1); };

  return <section className="blog-explorer"><div className="page-shell">
    <div className="blog-tools"><div role="tablist" aria-label="Chủ đề bài viết">{categories.map((item) => <button type="button" role="tab" aria-selected={category === item} className={category === item ? "active" : ""} onClick={() => chooseCategory(item)} key={item}>{item}</button>)}</div><label><span className="sr-only">Tìm bài viết</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm kiếm..." /></label></div>
    {visible.length ? <><div className="news-feature-layout">{featured.map((item, index) => <article className={`news-feature-card feature-${index + 1}`} key={item.slug}><Link className="card-link" href={ROUTES.blogDetail(item.slug)} aria-label={`Xem ${item.title}`} /><Image src={item.image} alt={item.title} fill preload={index === 0} sizes={index === 0 ? "(max-width: 767px) 100vw, 67vw" : "(max-width: 767px) 100vw, 33vw"} /><div className="news-feature-shade"/><div className="news-feature-copy"><h3>{item.title}</h3><p>{item.meta}</p></div></article>)}</div>{standard.length > 0 && <div className="news-list-grid">{standard.map((item) => <article className="news-list-card" key={item.slug}><Link className="card-link" href={ROUTES.blogDetail(item.slug)} aria-label={`Xem ${item.title}`} /><div className="news-list-image"><Image src={item.image} alt={item.title} fill sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw" /></div><div className="news-list-copy"><h3>{item.title}</h3><p className="news-list-date">{item.meta}</p></div></article>)}</div>}</> : <EmptyState title="Không tìm thấy bài viết" description="Hãy thử một từ khóa hoặc chủ đề khác."/>}
    {pages > 1 && <nav className="pagination" aria-label="Phân trang tin tức"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button type="button" className={page === number ? "active" : ""} aria-current={page === number ? "page" : undefined} onClick={() => setPage(number)} key={number}>{String(number).padStart(2, "0")}</button>)}<button type="button" disabled={page === pages} onClick={() => setPage((value) => value + 1)}>→</button></nav>}
  </div></section>;
}
