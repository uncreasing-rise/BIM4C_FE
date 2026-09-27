"use client";

/**
 * Sorting, searching and paging controls shared by every admin list, so each
 * screen behaves the same: click a column to sort, click again to reverse.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { table } from "./admin-ui";

export type SortDir = "asc" | "desc";
export interface SortState {
  by: string;
  dir: SortDir;
}

/** Same column flips direction; a new column starts from its natural order. */
export function nextSort(
  current: SortState,
  by: string,
  firstDir: SortDir = "asc",
): SortState {
  return current.by === by
    ? { by, dir: current.dir === "asc" ? "desc" : "asc" }
    : { by, dir: firstDir };
}

export function SortableTh({
  label,
  field,
  sort,
  onSort,
  firstDir = "asc",
  className,
}: {
  label: string;
  field: string;
  sort: SortState;
  onSort: (next: SortState) => void;
  /** Dates read best newest-first, text A→Z. */
  firstDir?: SortDir;
  className?: string;
}) {
  const active = sort.by === field;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      className={cn(table.th, className)}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(nextSort(sort, field, firstDir))}
        className={cn(
          "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-muted dark:hover:text-foreground",
          active && "text-slate-900 dark:text-foreground",
        )}
        title={`Sắp xếp theo ${label.toLowerCase()}`}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-40")} aria-hidden="true" />
      </button>
    </th>
  );
}

type SortValue = string | number | boolean | Date | null | undefined;
const collator = new Intl.Collator("vi", { sensitivity: "base", numeric: true });

function compareValues(a: SortValue, b: SortValue): number {
  // Blank values always sink to the bottom, whichever direction is chosen.
  if (a === null || a === undefined || a === "") return b === null || b === undefined || b === "" ? 0 : 1;
  if (b === null || b === undefined || b === "") return -1;
  if (a instanceof Date || b instanceof Date)
    return new Date(a as Date).getTime() - new Date(b as Date).getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/** Client-side sort for lists the API returns whole (users, appointments…). */
export function useClientSort<T>(
  items: T[],
  initial: SortState,
  accessors: Record<string, (item: T) => SortValue>,
) {
  const [sort, setSort] = useState(initial);
  const accessor = accessors[sort.by];
  const sorted = useMemo(() => {
    if (!accessor) return items;
    const factor = sort.dir === "asc" ? 1 : -1;
    return items
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const va = accessor(a.item);
        const vb = accessor(b.item);
        const blankA = va === null || va === undefined || va === "";
        const blankB = vb === null || vb === undefined || vb === "";
        if (blankA || blankB) return compareValues(va, vb) || a.index - b.index;
        return compareValues(va, vb) * factor || a.index - b.index;
      })
      .map(({ item }) => item);
  }, [items, accessor, sort.dir]);
  return { sorted, sort, setSort };
}

/** Case- and accent-insensitive "contains" for client-side search. */
export function normalizeSearch(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function matchesSearch(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  return fields.some((field) => normalizeSearch(field).includes(q));
}

/** Runs a loader whenever it changes, cancelling the previous request. */
export function useLoader(load: (signal: AbortSignal) => unknown) {
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load]);
}

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Xóa từ khóa"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export const selectClass =
  "h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-border dark:bg-background dark:text-foreground";

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={selectClass}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

const PAGE_SIZES = [10, 20, 50, 100];

export function ListFooter({
  page,
  pages,
  total,
  pageSize,
  onPage,
  onPageSize,
  itemLabel = "mục",
  pageSizes = PAGE_SIZES,
}: {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize?: (size: number) => void;
  itemLabel?: string;
  pageSizes?: number[];
}) {
  const last = Math.max(1, pages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const button =
    "grid size-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-border dark:bg-background dark:text-foreground";
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 dark:border-border dark:bg-muted/20 dark:text-muted-foreground">
      <span>
        {total === 0 ? (
          <>Không có {itemLabel}</>
        ) : (
          <>
            Hiển thị <b className="tabular-nums text-slate-700 dark:text-foreground">{from}–{to}</b> trên{" "}
            <b className="tabular-nums text-slate-700 dark:text-foreground">{total}</b> {itemLabel}
          </>
        )}
      </span>
      <div className="flex items-center gap-3">
        {onPageSize && (
          <label className="flex items-center gap-1.5">
            <span>Mỗi trang</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="h-8 rounded-md border border-slate-300 bg-white px-1.5 text-xs text-slate-700 dark:border-border dark:bg-background dark:text-foreground"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        <nav className="flex items-center gap-1" aria-label="Phân trang">
          <button type="button" className={button} disabled={page <= 1} onClick={() => onPage(1)} aria-label="Trang đầu">
            <ChevronsLeft className="size-3.5" />
          </button>
          <button type="button" className={button} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Trang trước">
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="px-2 tabular-nums">
            Trang <b className="text-slate-700 dark:text-foreground">{page}</b> / {last}
          </span>
          <button type="button" className={button} disabled={page >= last} onClick={() => onPage(page + 1)} aria-label="Trang sau">
            <ChevronRight className="size-3.5" />
          </button>
          <button type="button" className={button} disabled={page >= last} onClick={() => onPage(last)} aria-label="Trang cuối">
            <ChevronsRight className="size-3.5" />
          </button>
        </nav>
      </div>
    </footer>
  );
}
