"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import { HomepageSectionHeader } from "./HomepageSectionHeader";
import { HomepageSectionToolbar } from "./HomepageSectionToolbar";

function label(value: string) {
  const text = value.trim().toLocaleLowerCase("vi-VN");
  return text
    ? text[0].toLocaleUpperCase("vi-VN") + text.slice(1)
    : text;
}

export function News({ posts }: { posts: ContentEntry[] }) {
  const all = "Tất cả";
  const categories = [
    all,
    ...Array.from(new Set(posts.map((p) => p.eyebrow).filter(Boolean))),
  ];
  const [category, setCategory] = useState(all);

  const visible = (
    category === all
      ? posts
      : posts.filter((p) => p.eyebrow === category)
  ).slice(0, 4);

  if (!posts.length) return null;
  const featured = visible[0];

  return (
    <section className="home-section bg-white" id="news">
      <div className="home-container">
        <HomepageSectionHeader title="Tin tức và góc nhìn">
          <HomepageSectionToolbar
            categories={categories}
            selected={category}
            onSelect={setCategory}
            ariaLabel="Danh mục tin tức"
            ctaHref={ROUTES.blog}
            ctaLabel="Xem tất cả tin tức"
          />
        </HomepageSectionHeader>

        {featured ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <article>
              <Link
                href={ROUTES.blogDetail(featured.slug)}
                className="group block"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width:1023px) 100vw, 65vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mb-2 mt-5 text-sm font-semibold text-[#09a7a5]">
                  {label(featured.eyebrow)}
                </p>
                <h3 className="text-2xl font-semibold leading-snug tracking-[-0.02em] text-slate-900 sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-slate-600">
                  {featured.description}
                </p>
              </Link>
            </article>

            <div className="border-t border-slate-200">
              {visible.slice(1).map((post) => (
                <article
                  key={post.slug}
                  className="border-b border-slate-200 py-5"
                >
                  <Link
                    href={ROUTES.blogDetail(post.slug)}
                    className="grid grid-cols-[110px_1fr] gap-4"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        sizes="110px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-[#09a7a5]">
                        {label(post.eyebrow)}
                      </p>
                      <h3 className="line-clamp-3 text-[15px] font-semibold leading-snug text-slate-900">
                        {post.title}
                      </h3>
                      {post.meta && (
                        <time className="mt-2 block text-xs text-slate-400">
                          {post.meta}
                        </time>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="py-20 text-center text-slate-500">
            Chưa có bài viết trong danh mục này.
          </p>
        )}
      </div>
    </section>
  );
}