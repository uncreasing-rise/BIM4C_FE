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

const pageSize = 4;

export function ServiceExplorer({ services }: { services: ContentEntry[] }) {
  const categories = useMemo(
    () => [
      "Tất cả",
      ...new Set(
        services.map((service) => service.category || service.eyebrow),
      ),
    ],
    [services],
  );
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const router = useRouter();
  const page = parsePage(useSearchParams().get("page"));
  const resetPage = () => router.replace(ROUTES.services, { scroll: false });
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    return services.filter((service) => {
      const serviceCategory = service.category || service.eyebrow;
      return (
        (category === "Tất cả" || serviceCategory === category) &&
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
          <p className="eyebrow">Danh mục dịch vụ</p>
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
            ariaLabel="Danh mục dịch vụ"
            items={categories}
            value={category}
            onChange={(value) => {
              setCategory(value);
              resetPage();
            }}
          />
          <CatalogFilterBar>
            <CatalogSearch
              label="Tìm dịch vụ"
              placeholder="Tìm theo tên, mục tiêu hoặc năng lực"
              value={query}
              onChange={(value) => {
                setQuery(value);
                resetPage();
              }}
            />
          </CatalogFilterBar>
          <p className="mb-5 text-xs text-muted-foreground">
            <strong className="font-semibold text-foreground">
              {filtered.length}
            </strong>{" "}
            dịch vụ phù hợp
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
                      Giải pháp BIM4C
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
                      Khám phá giải pháp <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  <Link
                    className="absolute inset-0"
                    href={ROUTES.serviceDetail(service.slug)}
                    aria-label={`Xem ${service.title}`}
                  />
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Không tìm thấy dịch vụ"
              description="Hãy thử từ khóa hoặc danh mục khác."
            />
          )}
          <CatalogPagination
            ariaLabel="Phân trang dịch vụ"
            page={page}
            pages={pages}
            pathname={ROUTES.services}
          />
        </div>
      </div>
    </section>
  );
}
