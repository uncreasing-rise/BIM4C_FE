"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CatalogCategories,
  CatalogFilterBar,
  CatalogPagination,
  CatalogSearch,
} from "@/components/shared/CatalogControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";

const pageSize = 6;

export function CourseExplorer({ courses }: { courses: ContentEntry[] }) {
  const categories = useMemo(
    () => [
      "Tất cả",
      ...new Set(courses.map((course) => course.eyebrow).filter(Boolean)),
    ],
    [courses],
  );
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState(courses[0]?.slug ?? "");
  const filtered = useMemo(
    () =>
      courses.filter(
        (course) =>
          (category === "Tất cả" || course.eyebrow === category) &&
          (!query ||
            `${course.title} ${course.description}`
              .toLocaleLowerCase("vi")
              .includes(query.toLocaleLowerCase("vi"))),
      ),
    [courses, category, query],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected =
    visible.find((course) => course.slug === selectedSlug) ?? visible[0];

  return (
    <section
      className="bg-background text-foreground"
      aria-label="Các chương trình đào tạo"
    >
      <div className="site-container py-20 lg:py-24">
        <header className="mb-8 grid gap-4 border-b pb-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">Chương trình đào tạo</p>
            <h2 className="text-3xl font-semibold tracking-[-.04em] md:text-5xl">
              Năng lực có thể áp dụng ngay
            </h2>
          </div>
          <p className="max-w-xl leading-7 text-muted-foreground md:justify-self-end">
            Chọn chương trình phù hợp với công việc và mục tiêu phát triển của
            bạn.
          </p>
        </header>
        <CatalogCategories
          ariaLabel="Danh mục đào tạo"
          items={categories}
          value={category}
          onChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        />
        <CatalogFilterBar>
          <CatalogSearch
            label="Tìm khóa học"
            placeholder="Tìm chương trình"
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
          />
        </CatalogFilterBar>
        <p className="mb-5 text-[12px] text-muted-foreground">
          <strong className="font-semibold text-foreground">
            {filtered.length}
          </strong>{" "}
          chương trình phù hợp
        </p>
        {selected && (
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
            <div className="border-t">
              {visible.map((course, index) => (
                <button
                  type="button"
                  onClick={() => setSelectedSlug(course.slug)}
                  className={`flex w-full items-center gap-4 border-b px-2 py-5 text-left transition-colors ${selected.slug === course.slug ? "bg-foreground text-background" : "hover:bg-muted"}`}
                  key={course.slug}
                >
                  <span
                    className={`text-xs font-semibold ${selected.slug === course.slug ? "text-primary" : "text-muted-foreground"}`}
                  >
                    0{index + 1}
                  </span>
                  <span className="flex-1 font-semibold">{course.title}</span>
                  <span aria-hidden>→</span>
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-3xl bg-[#0b1220] text-white lg:sticky lg:top-28">
              <div className="relative aspect-[16/8]">
                <Image
                  src={selected.image}
                  alt=""
                  fill
                  sizes="(max-width:1023px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] to-transparent" />
              </div>
              <div className="p-7 md:p-9">
                <Badge className="bg-white/10 text-white">
                  {selected.eyebrow}
                </Badge>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-.04em] md:text-4xl">
                  {selected.title}
                </h3>
                <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                  {selected.description}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {selected.highlights.map((item) => (
                    <span
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <Button asChild className="mt-8 rounded-full">
                  <Link href={ROUTES.courseDetail(selected.slug)}>
                    Xem chương trình →
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <EmptyState
            title="Không tìm thấy chương trình"
            description="Hãy thử một từ khóa hoặc danh mục khác."
          />
        )}
        <CatalogPagination
          ariaLabel="Phân trang khóa học"
          page={page}
          pages={pages}
          onChange={setPage}
        />
      </div>
    </section>
  );
}
