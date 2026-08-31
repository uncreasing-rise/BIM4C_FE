"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import { HomepageSectionHeader } from "./HomepageSectionHeader";
import { HomepageSectionToolbar } from "./HomepageSectionToolbar";

function OverlayCard({ post, className = "", compact = false }: { post: ContentEntry; className?: string; compact?: boolean }) {
  return <article className={`group relative min-h-0 overflow-hidden bg-[#063f46] ${className}`}>
    <Link className="absolute inset-0 z-20 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white" href={ROUTES.blogDetail(post.slug)} aria-label={`Xem ${post.title}`} />
    <Image className="object-cover transition-transform group-hover:scale-[1.025]" src={post.image} alt="" fill sizes="(max-width: 1023px) 100vw, 34vw" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#063f46]/95 via-[#063f46]/10 to-transparent" />
    <div className={`absolute inset-x-0 bottom-0 z-10 text-white ${compact ? "p-4" : "p-6"}`}>
      <h3 className={`${compact ? "line-clamp-2 text-[16px]" : "line-clamp-3 text-[20px]"} font-bold uppercase leading-[1.3]`}>{post.title}</h3>
      {!compact && post.meta ? <time className="mt-3 block text-xs font-medium">{post.meta}</time> : null}
    </div>
  </article>;
}

function ListCard({ post }: { post: ContentEntry }) {
  return <article className="group relative grid min-h-0 grid-cols-[96px_1fr] gap-3 overflow-hidden border-b border-[#dbe7e5] py-1.5 last:border-0">
    <Link className="absolute inset-0 z-20 focus-visible:outline-2 focus-visible:outline-[#09a7a5]" href={ROUTES.blogDetail(post.slug)} aria-label={`Xem ${post.title}`} />
    <div className="relative min-h-0 overflow-hidden"><Image className="object-cover transition-transform group-hover:scale-[1.025]" src={post.image} alt="" fill sizes="96px" /></div>
    <div className="min-w-0"><h3 className="line-clamp-2 text-[14px] font-bold uppercase leading-[1.3] text-[#063f46] group-hover:text-[#09a7a5]">{post.title}</h3>{post.meta ? <time className="mt-1 block text-[11px] text-[#667775]">{post.meta}</time> : null}</div>
  </article>;
}

export function News({ posts }: { posts: ContentEntry[] }) {
  const categories = ["Tất cả", ...Array.from(new Set(posts.map((post) => post.eyebrow).filter(Boolean)))];
  const [category, setCategory] = useState("Tất cả");
  const visible = (category === "Tất cả" ? posts : posts.filter((post) => post.eyebrow === category)).slice(0, 7);

  if (!posts.length) return null;

  return <section className="home-section relative overflow-hidden bg-white" id="news">
    <div className="home-container relative z-10">
      <HomepageSectionHeader title="TIN TỨC - SỰ KIỆN">
        <HomepageSectionToolbar categories={categories} selected={category} onSelect={setCategory} ariaLabel="Danh mục tin tức" ctaHref={ROUTES.blog} ctaLabel="Xem tất cả tin tức" />
      </HomepageSectionHeader>
      {visible.length ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[276px_128px] lg:gap-x-5 lg:gap-y-3">
        {visible[0] ? <OverlayCard post={visible[0]} className="h-[420px] md:col-span-2 lg:col-span-4 lg:row-span-2 lg:h-auto" /> : null}
        {visible[1] ? <OverlayCard post={visible[1]} className="h-[240px] lg:col-span-4 lg:h-auto" /> : null}
        {visible[2] ? <OverlayCard post={visible[2]} compact className="h-[240px] lg:col-span-2 lg:col-start-5 lg:row-start-2 lg:h-auto" /> : null}
        {visible[3] ? <OverlayCard post={visible[3]} compact className="h-[240px] lg:col-span-2 lg:col-start-7 lg:row-start-2 lg:h-auto" /> : null}
        {visible[4] ? <OverlayCard post={visible[4]} compact className="h-[240px] lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:h-auto" /> : null}
        {(visible[5] || visible[6]) ? <div className="grid h-[200px] min-h-0 grid-rows-2 overflow-hidden md:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:h-auto">{visible.slice(5, 7).map((post) => <ListCard post={post} key={post.slug} />)}</div> : null}
      </div> : <p className="py-16 text-center text-[#667775]">Chưa có bài viết trong danh mục này.</p>}
    </div>
  </section>;
}
