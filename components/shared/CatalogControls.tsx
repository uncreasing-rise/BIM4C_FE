"use client";

import type { ReactNode } from "react";
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
      className="flex max-w-full items-center gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <Button
          variant="ghost"
          className={cn(
            "h-10 shrink-0 rounded-full border px-4 text-muted-foreground shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
            value === item &&
              "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
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
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="h-12! w-full rounded-xl border-0 bg-muted/55 px-4 shadow-none"
        aria-label={label}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Tất cả">Tất cả</SelectItem>
        {values.map((item) => (
          <SelectItem value={item} key={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CatalogPagination({
  ariaLabel,
  page,
  pages,
  onChange,
}: {
  ariaLabel: string;
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;

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
        variant="outline"
        size="icon"
        className="rounded-full"
        aria-label="Trang trước"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft />
      </Button>
      {pageItems.map((number, index) => (
        <span className="contents" key={number}>
          {index > 0 && number - pageItems[index - 1] > 1 && (
            <span className="grid size-10 place-items-center text-muted-foreground">
              …
            </span>
          )}
          <Button
            variant={page === number ? "default" : "outline"}
            size="icon"
            className="rounded-full"
            aria-label={`Trang ${number}`}
            aria-current={page === number ? "page" : undefined}
            onClick={() => onChange(number)}
          >
            {number}
          </Button>
        </span>
      ))}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        aria-label="Trang sau"
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
