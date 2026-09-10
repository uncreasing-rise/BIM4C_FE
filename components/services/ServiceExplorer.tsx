"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { useMemo } from "react";
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
import { parsePage } from "@/lib/seo/listing";
import { toEnglishLabel } from "@/lib/utils/public-labels";

const pageSize = 6;

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
  const { searchParams, query, setQuery, update, reset, pending } =
    useCatalogFilters();
  const category = searchParams.get("category") ?? "All";
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
  const page = Math.min(parsePage(searchParams.get("page")), pages);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="py-12 lg:py-16" id="service-list" aria-busy={pending}>
      <div className="site-container">
        <header className="mb-7 flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Solution catalogue</p>
            <h2 className="section-title">Expertise that fits your project.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            From BIM strategy to coordinated models and asset information, find
            support that fits your project stage and your team.
          </p>
        </header>
        <div>
          {categories.length > 2 && (
            <CatalogCategories
              ariaLabel="Solution categories"
              items={categories}
              value={category}
              formatLabel={toEnglishLabel}
              onChange={(value) => {
                update("category", value);
              }}
            />
          )}
          <CatalogFilterBar>
            <CatalogSearch
              label="Search solutions"
              placeholder="Search by name, goal or capability"
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
            <div className="grid gap-6 md:grid-cols-2">
              {visible.map((service, index) => (
                <article
                  className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
                  key={service.slug}
                >
                  <div className="relative aspect-[16/7] overflow-hidden bg-muted">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width:767px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {String((page - 1) * pageSize + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </div>
                  <div className="p-6">
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
