"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { scrollToElementTop } from "@/lib/utils/scroll";

export function CatalogCategories({
  ariaLabel,
  items,
  value,
  onChange,
  formatLabel = (item) => item,
}: {
  ariaLabel: string;
  items: readonly string[];
  value: string;
  onChange: (value: string) => void;
  formatLabel?: (item: string) => string;
}) {
  return (
    <nav
      className="flex max-w-full items-center gap-2 overflow-x-auto pb-3 pt-2 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]"
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <Button
          variant="ghost"
          className={cn(
            "min-h-11 shrink-0 rounded-full border px-4 text-muted-foreground shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
            value === item &&
              "border-primary bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground",
          )}
          aria-pressed={value === item}
          onClick={() => onChange(item)}
          key={item}
        >
          {formatLabel(item)}
        </Button>
      ))}
    </nav>
  );
}

export function CatalogFilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-7 mt-3 grid grid-cols-1 gap-2 rounded-2xl border bg-card p-2 shadow-sm md:[&:has(>:nth-child(2))]:grid-cols-2 lg:[&:has(>:nth-child(4))]:grid-cols-[1.5fr_1fr_1fr_1fr]">
      {children}
    </div>
  );
}

export function CatalogSearch({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="h-12 rounded-xl border-0 bg-muted/55 pl-10 shadow-none focus-visible:bg-background"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function CatalogSelect({
  label,
  value,
  values,
  onChange,
  formatLabel = (item) => item,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
  formatLabel?: (item: string) => string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/55 px-3 pb-1.5 pt-2">
      <span
        aria-hidden="true"
        className="block text-xs font-medium text-muted-foreground"
      >
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="h-9! w-full rounded-lg border-0 bg-transparent px-0 shadow-none"
          aria-label={label}
        >
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {values.map((item) => (
            <SelectItem value={item} key={item}>
              {formatLabel(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CatalogPagination({
  ariaLabel,
  page,
  pages,
  pathname,
}: {
  ariaLabel: string;
  page: number;
  pages: number;
  pathname: string;
}) {
  const searchParams = useSearchParams();
  if (pages <= 1) return null;

  const changePage = (trigger: HTMLElement) => {
    scrollToElementTop(trigger.closest("section"));
  };
  const href = (number: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (number === 1) params.delete("page");
    else params.set("page", String(number));
    return `${pathname}${params.size ? `?${params}` : ""}`;
  };

  const pageItems = Array.from(
    { length: pages },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      number === 1 || number === pages || Math.abs(number - page) <= 1,
  );

  return (
    <nav
      className="mt-12 flex justify-center gap-2 border-t pt-8"
      aria-label={ariaLabel}
    >
      <Button
        asChild
        variant="outline"
        size="icon"
        className="size-11 rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-40"
        aria-label={page === 1 ? "Already on the first page" : "Previous page"}
      >
        <Link
          aria-disabled={page === 1}
          tabIndex={page === 1 ? -1 : undefined}
          href={href(Math.max(1, page - 1))}
          scroll={false}
          onClick={(event) => {
            if (page === 1) event.preventDefault();
            else changePage(event.currentTarget);
          }}
        >
          <ChevronLeft />
        </Link>
      </Button>
      {pageItems.map((number, index) => (
        <span className="contents" key={number}>
          {index > 0 && number - pageItems[index - 1] > 1 && (
            <span className="grid size-10 place-items-center text-muted-foreground">
              …
            </span>
          )}
          <Button
            asChild
            variant={page === number ? "default" : "outline"}
            size="icon"
            className="size-11 rounded-full"
            aria-label={`Page ${number}`}
            aria-current={page === number ? "page" : undefined}
          >
            <Link
              href={href(number)}
              scroll={false}
              onClick={(event) => changePage(event.currentTarget)}
            >
              {number}
            </Link>
          </Button>
        </span>
      ))}
      <Button
        asChild
        variant="outline"
        size="icon"
        className="size-11 rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-40"
        aria-label={page === pages ? "Already on the last page" : "Next page"}
      >
        <Link
          aria-disabled={page === pages}
          tabIndex={page === pages ? -1 : undefined}
          href={href(Math.min(pages, page + 1))}
          scroll={false}
          onClick={(event) => {
            if (page === pages) event.preventDefault();
            else changePage(event.currentTarget);
          }}
        >
          <ChevronRight />
        </Link>
      </Button>
    </nav>
  );
}
