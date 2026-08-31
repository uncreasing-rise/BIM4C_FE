"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";

export function News({ posts }: { posts: ContentEntry[] }) {
  const all = "Tất cả";
  const categories = [all, ...Array.from(new Set(posts.map(post => post.eyebrow).filter(Boolean)))];
  const [category, setCategory] = useState(all);
  const visible = (category === all ? posts : posts.filter(post => post.eyebrow === category)).slice(0, 4);
  const featured = visible[0];
  if (!posts.length) return null;

  return <section className="apple-news-editorial" id="news"><header><p className="apple-kicker">Tin tức &amp; sự kiện</p><h2>Những câu chuyện đang định hình xây dựng số.</h2><Link className="apple-link" href={ROUTES.blog}>Xem tất cả tin tức <span>›</span></Link></header><nav aria-label="Danh mục tin tức">{categories.map(item => <button type="button" className={item === category ? "active" : ""} aria-pressed={item === category} onClick={() => setCategory(item)} key={item}>{item}</button>)}</nav>{featured ? <div className="apple-news-editorial-grid"><article className="featured"><Link href={ROUTES.blogDetail(featured.slug)}><div><Image src={featured.image} alt={featured.title} fill sizes="(max-width:833px) 100vw,65vw" className="object-cover" /></div><p>{featured.eyebrow}</p><h3>{featured.title}</h3><span>{featured.description}</span>{featured.meta ? <time>{featured.meta}</time> : null}</Link></article><div className="side">{visible.slice(1).map(post => <article key={post.slug}><Link href={ROUTES.blogDetail(post.slug)}><div><Image src={post.image} alt="" fill sizes="160px" className="object-cover" /></div><section><p>{post.eyebrow}</p><h3>{post.title}</h3>{post.meta ? <time>{post.meta}</time> : null}</section></Link></article>)}</div></div> : <p className="apple-empty">Chưa có bài viết trong danh mục này.</p>}</section>;
}
