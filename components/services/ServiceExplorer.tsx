"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CatalogCategories,
  CatalogFilterBar,
  CatalogPagination,
  CatalogSearch,
} from "@/components/shared/CatalogControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import { parsePage } from "@/lib/seo/listing";
import { toEnglishLabel } from "@/lib/utils/public-labels";

const pageSize = 4;

export function ServiceExplorer({ services }: { services: ContentEntry[] }) {
  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        services.map((service) => service.category || service.eyebrow),
      ),
    ],
    [services],
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
    router.replace(
      `${ROUTES.services}${queryString ? `?${queryString}` : ""}`,
      { scroll: false },
    );
  };
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    return services.filter((service) => {
      const serviceCategory = service.category || service.eyebrow;
      return (
        (category === "All" || serviceCategory === category) &&
        (!normalizedQuery ||
          `${service.title} ${service.description} ${service.highlights.join(" ")}`
            .toLocaleLowerCase("vi")
            .includes(normalizedQuery))
      );
    });
  }, [category, query, services]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="py-20 lg:py-28" id="service-list">
      <div className="site-container grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-16">
        <header className="self-start lg:sticky lg:top-28">
          <p className="eyebrow">Solution catalogue</p>
          <h2 className="text-balance text-4xl font-semibold leading-[1.06] tracking-[-.05em] sm:text-5xl">
            Đúng giải pháp. Đúng thời điểm.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
            BIM4C kết hợp chuyên môn xây dựng, quy trình số và năng lực triển
            khai để giải quyết bài toán riêng của từng tổ chức.
          </p>
        </header>
        <div>
          <CatalogCategories
            ariaLabel="Solution categories"
            items={categories}
            value={category}
            formatLabel={toEnglishLabel}
            onChange={(value) => {
              setCategory(value);
              updateUrl("category", value);
            }}
          />
          <CatalogFilterBar>
            <CatalogSearch
              label="Search solutions"
              placeholder="Search by name, goal or capability"
              value={query}
              onChange={(value) => {
                setQuery(value);
                updateUrl("q", value);
              }}
            />
          </CatalogFilterBar>
          <p
            className="mb-5 text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <strong className="font-semibold text-foreground">
              {filtered.length}
            </strong>{" "}
            matching solutions
          </p>
          {visible.length ? (
            <div className="border-t">
              {visible.map((service, index) => (
                <article
                  className="group relative grid gap-6 border-b py-7 sm:grid-cols-[12rem_1fr] sm:items-center lg:grid-cols-[14rem_1fr]"
                  key={service.slug}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width:639px) 100vw, 224px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {String((page - 1) * pageSize + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                      BIM4C solution
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-.035em] md:text-3xl">
                      {service.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {service.description}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4">
                      {service.highlights.slice(0, 3).map((item) => (
                        <li
                          className="flex items-center gap-2 text-xs"
                          key={item}
                        >
                          <Check className="size-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Explore solution <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  <Link
                    className="absolute inset-0"
                    href={ROUTES.serviceDetail(service.slug)}
                    aria-label={`View ${service.title}`}
                  />
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No solutions found"
              description="Try a different keyword or category."
            />
          )}
          <CatalogPagination
            ariaLabel="Solution pagination"
            page={page}
            pages={pages}
            pathname={ROUTES.services}
          />
        </div>
      </div>
    </section>
  );
}
