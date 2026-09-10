"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { parsePage } from "@/lib/seo/listing";
import { toEnglishLabel } from "@/lib/utils/public-labels";

const pageSize = 6;
const courseCategory = (course: ContentEntry) =>
  course.category?.trim() || course.eyebrow.split("·")[0].trim();

export function CourseExplorer({ courses }: { courses: ContentEntry[] }) {
  const categories = useMemo(
    () => ["All", ...new Set(courses.map(courseCategory).filter(Boolean))],
    [courses],
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
    router.replace(`${ROUTES.courses}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };
  const [selectedSlug, setSelectedSlug] = useState(courses[0]?.slug ?? "");
  const filtered = useMemo(
    () =>
      courses.filter(
        (course) =>
          (category === "All" || courseCategory(course) === category) &&
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
            <p className="eyebrow">Training programmes</p>
            <h2 className="text-3xl font-semibold tracking-[-.04em] md:text-5xl">
              Skills you can apply immediately
            </h2>
          </div>
          <p className="max-w-xl leading-7 text-muted-foreground md:justify-self-end">
            Choose a programme that matches your role and development goals.
          </p>
        </header>
        <CatalogCategories
          ariaLabel="Academy categories"
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
            label="Search courses"
            placeholder="Search programmes"
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
          matching programmes
        </p>
        {selected && (
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
            <div className="border-t" aria-label="Programme selection">
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
            <div className="overflow-hidden rounded-3xl bg-brand-ink text-white lg:sticky lg:top-28">
              <div className="relative aspect-[16/8]">
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  sizes="(max-width:1023px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink to-transparent" />
              </div>
              <div className="p-7 md:p-9">
                <Badge className="bg-white/10 text-white">
                  {toEnglishLabel(courseCategory(selected))}
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
                    View programme →
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <EmptyState
            title="No programmes found"
            description="Try a different keyword or category."
          />
        )}
        <CatalogPagination
          ariaLabel="Academy pagination"
          page={page}
          pages={pages}
          pathname={ROUTES.courses}
        />
      </div>
    </section>
  );
}
