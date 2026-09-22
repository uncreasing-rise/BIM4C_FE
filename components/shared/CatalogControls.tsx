"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
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
  const navRef = useRef<HTMLElement | null>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items]);

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [value]);

  const isItemActive = (item: string) => {
    const v = value.trim().toLowerCase();
    const it = item.trim().toLowerCase();
    const fmtV = formatLabel(value).trim().toLowerCase();
    const fmtIt = formatLabel(item).trim().toLowerCase();
    return (
      v === it ||
      fmtV === fmtIt ||
      v === fmtIt ||
      it === fmtV ||
      (v === "all" && (it === "all" || it === "tất cả")) ||
      (v === "tất cả" && (it === "all" || it === "tất cả"))
    );
  };

  return (
    <div className="relative mb-3.5 group/categories">
      {/* Left Scroll Gradient Cue for Mobile */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 bottom-2.5 w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />

      <nav
        ref={navRef}
        className="flex max-w-full items-center gap-2 overflow-x-auto pb-2.5 pt-1 px-1 pr-10 sm:pr-4 touch-pan-x overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        aria-label={ariaLabel}
      >
        {items.map((item) => {
          const isSelected = isItemActive(item);
          return (
            <button
              key={item}
              ref={isSelected ? activeBtnRef : undefined}
              type="button"
              className={cn(
                "min-h-10 shrink-0 select-none rounded-full px-4 py-2 font-semibold text-xs sm:text-sm transition-all duration-200 border shadow-2xs whitespace-nowrap active:scale-95 touch-manipulation",
                isSelected
                  ? "border-primary bg-primary text-white shadow-md shadow-teal-900/20 ring-2 ring-primary/20 scale-[1.02]"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
              )}
              aria-pressed={isSelected}
              onClick={() => onChange(item)}
            >
              {formatLabel(item)}
            </button>
          );
        })}
      </nav>

      {/* Right Scroll Gradient Cue for Mobile */}
      <div
        className={cn(
          "pointer-events-none absolute right-0 top-0 bottom-2.5 w-12 bg-gradient-to-l from-background via-background/80 to-transparent z-10 transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />
    </div>
  );
}

export function CatalogFilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-2 sm:p-2.5 shadow-xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 w-full">
        {children}
      </div>
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
    <div className="relative min-w-0 w-full md:flex-1">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-9 text-sm text-foreground font-medium placeholder:text-muted-foreground shadow-none transition-colors focus-visible:bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
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
    <div className="min-w-0 w-full md:w-auto md:min-w-[140px] lg:min-w-[155px] shrink-0 rounded-xl border border-border bg-muted/40 px-3 py-1.5 transition-colors focus-within:bg-card focus-within:border-primary">
      <span
        aria-hidden="true"
        className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="h-6 w-full rounded-none border-0 bg-transparent p-0 text-xs sm:text-sm font-semibold text-foreground shadow-none focus:ring-0 [&>svg]:size-3.5"
          aria-label={label}
        >
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border border-border bg-popover shadow-xl">
          <SelectItem value="All" className="font-semibold text-xs sm:text-sm">
            {formatLabel("All")}
          </SelectItem>
          {values.map((item) => (
            <SelectItem value={item} key={item} className="font-medium text-xs sm:text-sm">
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
    <div className="sticky bottom-6 z-40 mt-12 flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border bg-card/90 dark:bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
        aria-label={ariaLabel}
      >
        {/* Previous Page Button */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-9 rounded-full hover:bg-muted text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-30"
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
            <ChevronLeft className="size-4" />
          </Link>
        </Button>

        {/* Page Numbers */}
        {pageItems.map((number, index) => (
          <span className="contents" key={number}>
            {index > 0 && number - pageItems[index - 1] > 1 && (
              <span className="grid size-8 place-items-center text-xs text-muted-foreground font-mono">
                …
              </span>
            )}
            <Button
              asChild
              variant={page === number ? "default" : "ghost"}
              size="icon"
              className={cn(
                "size-9 rounded-full text-xs font-bold transition-all",
                page === number
                  ? "bg-primary text-white shadow-md shadow-teal-900/30 ring-2 ring-primary/20"
                  : "text-foreground hover:bg-muted",
              )}
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

        {/* Next Page Button */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-9 rounded-full hover:bg-muted text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-30"
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
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </nav>
    </div>
  );
}
