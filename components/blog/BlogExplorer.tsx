"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";

const pageSize = 9;
const publishedAt = (meta?: string) => {
  if (!meta) return 0;
  const match = meta.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (match)
    return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  const parsed = Date.parse(meta);
  return Number.isNaN(parsed) ? 0 : parsed;
};
const naturalCase = (value: string) =>
  value
    .toLocaleLowerCase("vi-VN")
    .replace(/^./u, (character) => character.toLocaleUpperCase("vi-VN"));

export function BlogExplorer({ posts }: { posts: ContentEntry[] }) {
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => publishedAt(b.meta) - publishedAt(a.meta)),
    [posts],
  );
  const categories = useMemo(
    () => ["Tất cả", ...new Set(sortedPosts.map((item) => item.eyebrow))],
    [sortedPosts],
  );
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      sortedPosts.filter(
        (item) =>
          (category === "Tất cả" || item.eyebrow === category) &&
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
    <section className="public-explorer blog-explorer bg-white py-14 lg:py-16">
      <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1200px] md:w-[calc(100%_-_48px)]">
        <header className="mb-8 max-w-[680px]">
          <p className="mb-[9px] text-[10px] font-semibold uppercase leading-[1.35] tracking-[.14em] text-[#ff5a36]">
            Tin tức &amp; sự kiện
          </p>
          <h2 className="text-[30px] font-semibold leading-[1.16] tracking-[-.025em] text-[#171717] md:text-[40px]">
            Những câu chuyện về xây dựng số
          </h2>
        </header>
        <nav
          className="public-category-nav"
          role="tablist"
          aria-label="Chủ đề bài viết"
        >
          {categories.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={category === item}
              className={category === item ? "active" : ""}
              onClick={() => {
                setCategory(item);
                setPage(1);
              }}
              key={item}
            >
              {naturalCase(item)}
            </button>
          ))}
        </nav>
        <div className="public-filter-bar mb-6">
          <label className="public-search-field">
            <span className="sr-only">Tìm bài viết</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm bài viết"
            />
          </label>
        </div>
        <p className="mb-5 text-[12px] text-[#888]">
          <strong className="font-semibold text-[#333]">
            {filtered.length}
          </strong>{" "}
          bài viết phù hợp
        </p>
        {visible.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((item) => (
              <article
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#e9e6e3] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgb(28_20_16/10%)]"
                key={item.slug}
              >
                <Link
                  className="absolute inset-0 z-10 rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#ff5a36]"
                  href={ROUTES.blogDetail(item.slug)}
                  aria-label={"Xem " + item.title}
                />
                <div className="relative aspect-[16/10] overflow-hidden bg-[#eee]">
                  <Image
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width:767px) 100vw, (max-width:1279px) 50vw, 33vw"
                  />
                </div>
                <div className="flex min-h-[196px] flex-1 flex-col p-5 lg:p-6">
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[.1em] text-[#ff5a36]">
                    {item.eyebrow}
                  </p>
                  <h3 className="line-clamp-2 text-[21px] font-semibold leading-[1.3] tracking-[-.015em] text-[#171717]">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[14px] leading-[1.65] text-[#666]">
                    {item.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-[#e9e6e3] pt-4 text-[12px] text-[#888]">
                    <time>{item.meta}</time>
                    <span className="font-semibold text-[#ff5a36]">
                      Đọc thêm →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Không tìm thấy bài viết"
            description="Hãy thử một từ khóa hoặc chủ đề khác."
          />
        )}
        {pages > 1 && (
          <nav className="public-pagination" aria-label="Phân trang tin tức">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              ←
            </button>
            {Array.from({ length: pages }, (_, index) => index + 1).map(
              (number) => (
                <button
                  type="button"
                  className={page === number ? "active" : ""}
                  aria-current={page === number ? "page" : undefined}
                  onClick={() => setPage(number)}
                  key={number}
                >
                  {String(number).padStart(2, "0")}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={page === pages}
              onClick={() => setPage((value) => value + 1)}
            >
              →
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
