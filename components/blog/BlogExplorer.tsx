"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";

const pageSize = 9;
const pageButton = "size-[42px] border border-[#dbe7e5] text-xs font-semibold md:size-[46px]";
const naturalCase = (value: string) => value.toLocaleLowerCase("vi-VN").replace(/^./u, (character) => character.toLocaleUpperCase("vi-VN"));
const publishedAt = (meta?: string) => {
  if (!meta) return 0;
  const vietnameseDate = meta.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (vietnameseDate) return Date.UTC(Number(vietnameseDate[3]), Number(vietnameseDate[2]) - 1, Number(vietnameseDate[1]));
  const parsed = Date.parse(meta);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function BlogExplorer({ posts }: { posts: ContentEntry[] }) {
  const sortedPosts = useMemo(() => [...posts].sort((a, b) => publishedAt(b.meta) - publishedAt(a.meta)), [posts]);
  const categories = useMemo(() => ["Tất cả", ...new Set(sortedPosts.map((item) => item.eyebrow))], [sortedPosts]);
  const [category, setCategory] = useState("Tất cả"), [query, setQuery] = useState(""), [page, setPage] = useState(1);
  const filtered = useMemo(() => sortedPosts.filter((item) => (category === "Tất cả" || item.eyebrow === category) && (!query || `${item.title} ${item.description}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")))), [sortedPosts, category, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const featured = category === "Tất cả" ? visible.slice(0, 3) : [];
  const standard = category === "Tất cả" ? visible.slice(3) : visible;
  const chooseCategory = (value: string) => { setCategory(value); setPage(1); };

  return <section className="w-full bg-[#f5fafa] py-14 lg:py-24"><div className="mx-auto w-[calc(100%_-_32px)] max-w-[1440px] md:w-[calc(100%_-_48px)] lg:w-[calc(100%_-_80px)]">
    <div className="mb-9 flex flex-col gap-4 border-b border-[#dbe7e5] pb-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex overflow-x-auto" role="tablist" aria-label="Chủ đề bài viết">{categories.map((item) => <button type="button" role="tab" aria-selected={category === item} className={`min-h-11 flex-none border-b-[3px] px-4 text-label font-semibold normal-case ${category === item ? "border-[#09a7a5] text-[#087f7d]" : "border-transparent text-[#667775]"}`} onClick={() => chooseCategory(item)} key={item}>{naturalCase(item)}</button>)}</div><label className="shrink-0"><span className="sr-only">Tìm bài viết</span><input className="h-11 w-full min-w-0 border border-[#dbe7e5] bg-white px-4 text-sm outline-none focus:border-[#09a7a5] lg:w-72" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm kiếm..." /></label></div>
    {visible.length ? <>{featured.length > 0 && <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{featured.map((item, index) => <article className={`group relative overflow-hidden ${index === 0 ? "min-h-[420px] md:col-span-2 lg:row-span-2 lg:min-h-[620px]" : "min-h-[300px]"}`} key={item.slug}><Link className="absolute inset-0 z-10" href={ROUTES.blogDetail(item.slug)} aria-label={`Xem ${item.title}`} /><Image className="object-cover transition-transform duration-500 group-hover:scale-105" src={item.image} alt={item.title} fill preload={index === 0} sizes={index === 0 ? "(max-width: 767px) 100vw, 67vw" : "(max-width: 767px) 100vw, 33vw"} /><div className="absolute inset-0 bg-gradient-to-t from-[#063f46]/90 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><h3 className={`${index === 0 ? "text-subtitle" : "text-xl"} font-semibold leading-tight`}>{item.title}</h3><p className="mt-3 text-xs text-white/70">{item.meta}</p></div></article>)}</div>}{standard.length > 0 && <div className={`${featured.length ? "mt-8" : ""} grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3`}>{standard.map((item) => <article className="group relative bg-white" key={item.slug}><Link className="absolute inset-0 z-10" href={ROUTES.blogDetail(item.slug)} aria-label={`Xem ${item.title}`} /><div className="relative aspect-[16/10] overflow-hidden"><Image className="object-cover transition-transform duration-500 group-hover:scale-105" src={item.image} alt={item.title} fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" /></div><div className="p-5"><h3 className="text-lg font-semibold leading-snug text-[#063f46]">{item.title}</h3><p className="mt-2 text-xs text-[#667775]">{item.meta}</p></div></article>)}</div>}</> : <EmptyState title="Không tìm thấy bài viết" description="Hãy thử một từ khóa hoặc chủ đề khác." />}
    {pages > 1 && <nav className="mt-[42px] flex justify-center gap-2" aria-label="Phân trang tin tức"><button className={`${pageButton} disabled:opacity-35`} type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button type="button" className={`${pageButton} ${page === number ? "border-[#087f7d] bg-[#087f7d] text-white" : "bg-white text-[#087f7d]"}`} aria-current={page === number ? "page" : undefined} onClick={() => setPage(number)} key={number}>{String(number).padStart(2, "0")}</button>)}<button className={`${pageButton} disabled:opacity-35`} type="button" disabled={page === pages} onClick={() => setPage((value) => value + 1)}>→</button></nav>}
  </div></section>;
}
