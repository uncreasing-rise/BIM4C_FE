"use client";

import Image from "next/image";
import Link from "next/link";
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
import { toEnglishLabel } from "@/lib/utils/public-labels";
import type { PageMeta } from "@/features/shared/types/pagination";

const naturalCase = (value: string) => toEnglishLabel(value);

export function BlogExplorer({
  posts,
  meta,
}: {
  posts: ContentEntry[];
  meta: PageMeta;
}) {
  const categories = ["All", ...new Set(posts.map((item) => item.eyebrow))];
  const { searchParams, query, setQuery, update, reset, pending } =
    useCatalogFilters();
  const category = searchParams.get("category") ?? "All";
  const pages = meta.totalPages;
  const page = meta.page;
  const visible = posts;

  return (
    <section className="bg-background py-12 lg:py-16" aria-busy={pending}>
      <div className="site-container">
        <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">News &amp; insights</p>
            <h2 className="text-3xl font-semibold tracking-[-.04em] md:text-5xl">
              Practical perspectives on digital construction
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end">
            Expert perspectives, project lessons and technology trends for the
            construction industry.
          </p>
        </header>
        <CatalogCategories
          ariaLabel="Insight topics"
          items={categories}
          value={category}
          formatLabel={naturalCase}
          onChange={(value) => {
            update("category", value);
          }}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label="Search insights"
            placeholder="Search insights"
            value={query}
            onChange={setQuery}
          />
        </CatalogFilterBar>
        {(query || category !== "All") && (
          <button
            className="mb-4 min-h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-muted"
            onClick={reset}
          >
            Clear filters
          </button>
        )}
        <p role="status" className="mb-5 text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">
            {meta.total}
          </strong>{" "}
          matching articles
        </p>
        {visible.length ? (
          <div className="grid grid-cols-1 gap-x-10 border-t pt-8 lg:grid-cols-[1.1fr_.9fr]">
            {visible.map((item, index) => (
              <article
                className={
                  index === 0
                    ? "group relative flex min-w-0 flex-col border-b pb-8 lg:row-span-4"
                    : "group relative grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-4 border-b py-6 sm:grid-cols-[8rem_minmax(0,1fr)] lg:col-start-2"
                }
                data-motion="tile"
                key={item.slug}
              >
                <Link
                  className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
                  href={ROUTES.blogDetail(item.slug)}
                  aria-label={"View " + item.title}
                />
                <div
                  className={
                    index === 0
                      ? "relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
                      : "relative aspect-square overflow-hidden rounded-xl bg-muted"
                  }
                >
                  <Image
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes={
                      index === 0 ? "(max-width:1023px) 100vw, 55vw" : "128px"
                    }
                  />
                </div>
                <div
                  className={
                    index === 0
                      ? "flex flex-1 flex-col pt-6"
                      : "flex min-w-0 flex-1 flex-col"
                  }
                >
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[.1em] text-primary">
                    {item.eyebrow}
                  </p>
                  <h3 className="line-clamp-2 text-[21px] font-semibold leading-[1.3] tracking-[-.015em] text-foreground">
                    {item.title}
                  </h3>
                  <p
                    className={
                      index === 0
                        ? "mt-3 line-clamp-3 text-[14px] leading-[1.65] text-muted-foreground"
                        : "mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground"
                    }
                  >
                    {item.description}
                  </p>
                  <div
                    className={
                      index === 0
                        ? "mt-5 flex items-center justify-between border-t pt-4 text-[12px] text-muted-foreground"
                        : "mt-auto flex items-center justify-between pt-3 text-[11px] text-muted-foreground"
                    }
                  >
                    <time>{item.meta}</time>
                    <span className="font-semibold text-primary">
                      Read more →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No articles found"
            description="Try a different keyword or topic."
          />
        )}
        <CatalogPagination
          ariaLabel="Insights pagination"
          page={page}
          pages={pages}
          pathname={ROUTES.blog}
        />
      </div>
    </section>
  );
}
