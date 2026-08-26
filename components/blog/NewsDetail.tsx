import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import styles from "./NewsDetail.module.css";

function isoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : undefined;
}

function SidebarCard({ item, video = false }: { item: ContentEntry; video?: boolean }) {
  return <article className={styles.sidebarCard}>
    <Link href={ROUTES.blogDetail(item.slug)} aria-label={`Xem ${item.title}`} />
    <div className={styles.sidebarThumb}><Image src={item.image} alt="" fill sizes="150px" />{video && <span aria-hidden="true">▶</span>}</div>
    <div><h3>{item.title}</h3>{item.meta && <time dateTime={isoDate(item.meta)}>{item.meta}</time>}</div>
  </article>;
}

function SidebarSection({ title, items, video = false }: { title: string; items: ContentEntry[]; video?: boolean }) {
  if (!items.length) return null;
  return <section className={styles.sidebarSection}><h2>{title}</h2><div>{items.map(item => <SidebarCard item={item} video={video} key={item.slug} />)}</div></section>;
}

function ArticleContent({ entry }: { entry: ContentEntry }) {
  return <div className={styles.articleContent}>
    <p className={styles.standfirst}>{entry.description}</p>
    <figure className={styles.articleFigure}>
      <Image src={entry.image} alt={entry.title} width={1200} height={800} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1100px) 68vw, 820px" />
    </figure>
    {entry.sections.map((section, index) => <section className={styles.articleSection} key={`${section.title}-${index}`}>
      <h2>{section.title}</h2>
      {section.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
      {section.unorderedList?.length ? <ul>{section.unorderedList.map(item => <li key={item}>{item}</li>)}</ul> : null}
      {section.orderedList?.length ? <ol>{section.orderedList.map(item => <li key={item}>{item}</li>)}</ol> : null}
      {section.quote && <blockquote className={styles.articleQuote}>{section.quote}</blockquote>}
      {section.images?.length ? <div className={section.imageLayout === "grid" ? styles.imageGrid : styles.imageStack}>{section.images.map((image, imageIndex) => <figure className={styles.inlineFigure} key={`${image.url}-${imageIndex}`}><Image src={image.url} alt={image.alt} width={image.width ?? 1200} height={image.height ?? 800} sizes={section.imageLayout === "grid" ? "(max-width: 767px) 100vw, 410px" : "(max-width: 767px) 100vw, 820px"}/>{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}</div> : null}
      {section.videoUrl && <div className={styles.videoEmbed}><a href={section.videoUrl} target="_blank" rel="noreferrer"><span>▶</span>Xem video liên quan</a></div>}
    </section>)}
    {entry.highlights.length > 0 && <blockquote className={styles.takeaway}><p>Những điểm chính</p><ul>{entry.highlights.map(item => <li key={item}>{item}</li>)}</ul></blockquote>}
  </div>;
}

export function NewsDetail({ entry, related, videos }: { entry: ContentEntry; related: ContentEntry[]; videos: ContentEntry[] }) {
  return <div className={styles.page}>
    <div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href={ROUTES.home}>Trang chủ</Link><span>/</span><Link href={ROUTES.blog}>Tin tức</Link><span>/</span><strong>{entry.title}</strong>
      </nav>
      <div className={styles.layout}>
        <article className={styles.article}>
          <header className={styles.articleHeader}><p>{entry.eyebrow}</p><h1>{entry.title}</h1>{entry.meta && <time dateTime={isoDate(entry.meta)}>{entry.meta}</time>}</header>
          <ArticleContent entry={entry} />
        </article>
        <aside className={styles.sidebar} aria-label="Nội dung liên quan">
          <SidebarSection title="Có thể bạn quan tâm" items={related.slice(0, 4)} />
          <SidebarSection title="Video" items={videos.slice(0, 3)} video />
        </aside>
      </div>
      {related.length > 0 && <section className={styles.moreNews}><header><div><p>TIN TỨC BIM4C</p><h2>Bài viết liên quan</h2></div><Link href={ROUTES.blog}>Xem tất cả →</Link></header><div>{related.slice(0, 3).map(item => <article key={item.slug}><Link href={ROUTES.blogDetail(item.slug)} aria-label={`Xem ${item.title}`} /><div><Image src={item.image} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" /></div><p>{item.eyebrow}</p><h3>{item.title}</h3><time dateTime={isoDate(item.meta)}>{item.meta}</time></article>)}</div></section>}
    </div>
  </div>;
}
