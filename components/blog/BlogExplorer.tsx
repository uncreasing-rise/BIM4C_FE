"use client";

import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { useCatalogFilters } from "@/components/shared/useCatalogFilters";
import {
  CatalogCategories,
  CatalogFilterBar,
  CatalogPagination,
  CatalogSearch,
} from "@/components/shared/CatalogControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import type { PageMeta } from "@/features/shared/types/pagination";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContentList } from "@/lib/i18n/localize";
import { resolveCoverImage } from "@/lib/content/cover-images";
import { cn } from "@/lib/utils";

const BLOG_BASE_CATEGORIES = [
  "Dự án",
  "Công nghệ",
  "Đào tạo",
  "An toàn",
  "Chuyên môn",
  "Con người",
];

export function BlogExplorer({
  posts: rawPosts,
  meta,
}: {
  posts: ContentEntry[];
  meta: PageMeta;
}) {
  const { t, locale } = useLanguage();
  const posts = localizeContentList(rawPosts, locale);

  const allLabel = t.common.all;
  const categories = [
    allLabel,
    ...BLOG_BASE_CATEGORIES.map((cat) => toLocalizedLabel(cat, locale)),
  ];

  const { searchParams, query, setQuery, update, reset, pending } =
    useCatalogFilters();
  const categoryParam = searchParams.get("category") ?? "All";
  const category =
    categoryParam === "All" || categoryParam === "Tất cả"
      ? allLabel
      : toLocalizedLabel(categoryParam, locale);

  const pages = meta.totalPages;
  const page = meta.page;
  const visible = posts;

  const formatFilterLabel = (val: string) => toLocalizedLabel(val, locale);

  return (
    <section className="bg-background py-12 lg:py-16" aria-busy={pending}>
      <div className="site-container">
        <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">{t.blogPage.catalogueEyebrow}</p>
            <h2 className="section-title">{t.blogPage.catalogueTitle}</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end">
            {t.blogPage.catalogueDesc}
          </p>
        </header>
        <CatalogCategories
          ariaLabel={t.blogPage.catalogueEyebrow}
          items={categories}
          value={category === "All" ? allLabel : category}
          formatLabel={formatFilterLabel}
          onChange={(value) => {
            update("category", value === allLabel ? "All" : value);
          }}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label={t.blogPage.searchLabel}
            placeholder={t.blogPage.searchPlaceholder}
            value={query}
            onChange={setQuery}
          />
        </CatalogFilterBar>
        {(query || (categoryParam !== "All" && categoryParam !== allLabel)) && (
          <button
            className="mb-4 min-h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-muted"
            onClick={reset}
          >
            {t.common.clearFilters}
          </button>
        )}
        <p role="status" className="mb-5 text-sm text-muted-foreground">
          {t.blogPage.matchingCount(meta.total)}
        </p>
        {visible.length ? (
          <div className="grid grid-cols-1 gap-8 border-t pt-8 lg:grid-cols-12">
            {/* Featured Hero Story (Spans 7 cols on desktop) */}
            {visible[0] && (
              <article
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-primary/50 lg:col-span-7 cursor-pointer"
                data-motion="tile"
                key={visible[0].slug}
              >
                <Link
                  className="absolute inset-0 z-20 rounded-3xl focus:outline-none"
                  href={ROUTES.blogDetail(visible[0].slug)}
                  aria-label={
                    (locale === "vi" ? "Xem bài viết: " : "View article: ") +
                    visible[0].title
                  }
                />
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    src={resolveCoverImage({
                      slug: visible[0].slug,
                      category: visible[0].category,
                      currentImage: visible[0].image,
                      type: "post",
                    })}
                    alt={visible[0].title}
                    fill
                    sizes="(max-width:1023px) 100vw, 60vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="rounded-full bg-teal-500/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-black uppercase tracking-wider shadow-sm">
                      {toLocalizedLabel(visible[0].eyebrow, locale)}
                    </span>
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white border border-white/10">
                      {locale === "vi" ? "5 phút đọc" : "5 min read"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <time>{visible[0].meta}</time>
                    <span>·</span>
                    <span className="text-primary font-bold">{toLocalizedLabel(visible[0].eyebrow, locale)}</span>
                  </div>
                  <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {visible[0].title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {visible[0].description}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                      {t.blogPage.readMore} →
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      BIM4C Engineering Insights
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* Sub-articles column (Spans 5 cols on desktop) */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              {visible.slice(1).map((item) => (
                <article
                  className="group relative flex flex-col sm:flex-row gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 cursor-pointer"
                  data-motion="tile"
                  key={item.slug}
                >
                  <Link
                    className="absolute inset-0 z-20 rounded-2xl focus:outline-none"
                    href={ROUTES.blogDetail(item.slug)}
                    aria-label={
                      (locale === "vi" ? "Xem bài viết: " : "View article: ") +
                      item.title
                    }
                  />
                  <div className="relative aspect-[16/10] sm:aspect-square w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      src={resolveCoverImage({
                        slug: item.slug,
                        category: item.category,
                        currentImage: item.image,
                        type: "post",
                      })}
                      alt={item.title}
                      fill
                      sizes="(max-width:639px) 100vw, 150px"
                    />
                    <div className="absolute top-2 left-2 z-10 sm:hidden">
                      <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                        {toLocalizedLabel(item.eyebrow, locale)}
                      </span>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-primary">
                        <span>{toLocalizedLabel(item.eyebrow, locale)}</span>
                        <span className="text-muted-foreground font-normal">·</span>
                        <time className="text-muted-foreground font-normal">{item.meta}</time>
                      </div>
                      <h3 className="mt-1 text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>{t.blogPage.readMore}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        {locale === "vi" ? "4 phút đọc" : "4 min read"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title={t.blogPage.emptyTitle}
            description={t.blogPage.emptyDesc}
          />
        )}
        <CatalogPagination
          ariaLabel={t.blogPage.catalogueTitle}
          page={page}
          pages={pages}
          pathname={ROUTES.blog}
        />
      </div>
    </section>
  );
}
