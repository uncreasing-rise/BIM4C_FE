"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
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

const LEGACY_SERVICE_BASE_CATEGORIES = [
  "Tư vấn BIM",
  "Đào tạo",
  "Thiết kế",
  "Tư vấn giám sát",
  "BIM Coordination",
  "Digital Twin & Dữ liệu tài sản",
];

const SERVICE_BASE_CATEGORIES = [
  "Tư vấn BIM",
  "Đào tạo",
  "Thiết kế",
  "Tư vấn giám sát",
  "BIM Coordination",
  "Digital Twin & Dữ liệu tài sản",
];

const pageSize = 6;

export function ServiceExplorer({
  services: rawServices,
  meta,
}: {
  services: ContentEntry[];
  meta: PageMeta;
}) {
  const { t, locale } = useLanguage();
  const services = localizeContentList(rawServices, locale);

  const allLabel = t.common.all;
  const categories = [
    allLabel,
    ...SERVICE_BASE_CATEGORIES.map((cat) => toLocalizedLabel(cat, locale)),
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
  const visible = services;

  const formatFilterLabel = (val: string) => toLocalizedLabel(val, locale);

  return (
    <section className="py-12 lg:py-16" id="service-list" aria-busy={pending}>
      <div className="site-container">
        <header className="mb-7 flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t.servicesPage.catalogueEyebrow}</p>
            <h2 className="section-title">{t.servicesPage.catalogueTitle}</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            {t.servicesPage.catalogueDesc}
          </p>
        </header>
        <div>
          {categories.length > 2 && (
            <CatalogCategories
              ariaLabel={t.servicesPage.catalogueTitle}
              items={categories}
              value={category === "All" ? allLabel : category}
              formatLabel={formatFilterLabel}
              onChange={(value) => {
                update("category", value === allLabel ? "All" : value);
              }}
            />
          )}
          <CatalogFilterBar>
            <CatalogSearch
              label={t.servicesPage.searchLabel}
              placeholder={t.servicesPage.searchPlaceholder}
              value={query}
              onChange={setQuery}
            />
          </CatalogFilterBar>
          {(query ||
            (categoryParam !== "All" && categoryParam !== allLabel)) && (
            <button
              className="mb-4 min-h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-muted"
              onClick={reset}
            >
              {t.common.clearFilters}
            </button>
          )}
          <p
            className="mb-5 text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {t.servicesPage.matchingCount(meta.total)}
          </p>
          {visible.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((service, index) => (
                <article
                  className="service-card group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors duration-200 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary"
                  data-motion="tile"
                  key={service.slug}
                >
                  <div className="relative aspect-[16/8] overflow-hidden bg-muted">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width:767px) 100vw, (max-width:1279px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <span className="absolute left-4 top-4 rounded-full bg-brand-ink/80 px-3 py-1 text-xs font-mono font-semibold text-white backdrop-blur border border-white/10">
                      {String((page - 1) * pageSize + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                      {t.servicesPage.solutionBadge}
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-3">
                      {service.description}
                    </p>
                    <ul className="mb-5 mt-4 grid gap-2 border-t pt-4">
                      {service.highlights.slice(0, 3).map((item, i) => (
                        <li
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                          key={`${service.id}-hl-${i}`}
                        >
                          <Check className="size-4 shrink-0 text-primary mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:underline">
                      {t.servicesPage.exploreSolution}{" "}
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
              title={t.servicesPage.emptyTitle}
              description={t.servicesPage.emptyDesc}
            />
          )}
          <CatalogPagination
            ariaLabel={t.servicesPage.catalogueTitle}
            page={page}
            pages={pages}
            pathname={ROUTES.services}
          />
        </div>
      </div>
    </section>
  );
}
