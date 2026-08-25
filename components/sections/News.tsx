import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
export function News({ posts }: { posts: ContentEntry[] }) { return <section className="news section" id="news"><div className="container"><div className="title-row"><h2>TIN TỨC MỚI NHẤT</h2><Link href={ROUTES.blog}>XEM TẤT CẢ →</Link></div><div className="news-grid">{posts.slice(0,3).map((article) => <article key={article.title}><div className="news-image"><Image src={article.image} alt={article.title} fill sizes="(max-width: 767px) 100vw, 33vw"/></div><time>{article.meta}</time><h3>{article.title}</h3><Link href={ROUTES.blogDetail(article.slug)} aria-label={`Xem ${article.title}`}>XEM THÊM →</Link></article>)}</div></div></section>; }
