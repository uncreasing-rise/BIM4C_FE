"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { parsePage } from "@/lib/seo/listing";
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

const pageSize = 5;
const publishedAt = (meta?: string) => {
  if (!meta) return 0;
  const match = meta.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (match)
    return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  const parsed = Date.parse(meta);
  return Number.isNaN(parsed) ? 0 : parsed;
};
const naturalCase = (value: string) => toEnglishLabel(value);

export function BlogExplorer({ posts }: { posts: ContentEntry[] }) {
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => publishedAt(b.meta) - publishedAt(a.meta)),
    [posts],
  );
  const categories = useMemo(
    () => ["All", ...new Set(sortedPosts.map((item) => item.eyebrow))],
    [sortedPosts],
  );
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "All",
  );
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const router = useRouter();
  const page = parsePage(searchParams.get("page"));
  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (!value || value === "All") params.delete(key);
    else params.set(key, value);
    const queryString = params.toString();
    router.replace(`${ROUTES.blog}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };
  const filtered = useMemo(
    () =>
      sortedPosts.filter(
        (item) =>
          (category === "All" || item.eyebrow === category) &&
          (!query ||
            (item.title + " " + item.description)
              .toLocaleLowerCase("vi")
              .includes(query.toLocaleLowerCase("vi"))),
      ),
    [sortedPosts, category, query],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="site-container">
        <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">Tin tức &amp; sự kiện</p>
            <h2 className="text-3xl font-semibold tracking-[-.04em] md:text-5xl">
              Những câu chuyện về xây dựng số
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
            setCategory(value);
            updateUrl("category", value);
          }}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label="Search insights"
            placeholder="Search insights"
            value={query}
            onChange={(value) => {
              setQuery(value);
              updateUrl("q", value);
            }}
          />
        </CatalogFilterBar>
        <p className="mb-5 text-[12px] text-muted-foreground">
          <strong className="font-semibold text-foreground">
            {filtered.length}
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
                    : "group relative grid min-w-0 grid-cols-[8rem_1fr] gap-5 border-b py-6 lg:col-start-2"
                }
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
