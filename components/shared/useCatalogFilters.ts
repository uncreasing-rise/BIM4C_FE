"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/** URL-backed filters keep pagination, reloads and browser navigation consistent. */
export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = searchParams.toString();
  const [draft, setDraft] = useState({
    source,
    query: searchParams.get("q") ?? "",
  });
  const [pending, startTransition] = useTransition();
  const latest = useRef(source);
  useEffect(() => {
    latest.current = source;
  }, [source]);

  if (draft.source !== source) {
    setDraft({ source, query: searchParams.get("q") ?? "" });
  }

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(latest.current);
    params.delete("page");
    if (!value || value === "All") params.delete(key);
    else params.set(key, value);
    latest.current = params.toString();
    startTransition(() =>
      router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
        scroll: false,
      }),
    );
  };

  useEffect(() => {
    if (draft.query === (searchParams.get("q") ?? "")) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(latest.current);
      params.delete("page");
      if (draft.query.trim()) params.set("q", draft.query.trim());
      else params.delete("q");
      latest.current = params.toString();
      startTransition(() =>
        router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
          scroll: false,
        }),
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [draft.query, pathname, router, searchParams]);

  return {
    searchParams,
    query: draft.query,
    pending,
    setQuery: (query: string) => setDraft({ source, query }),
    update,
    reset: () => {
      setDraft({ source, query: "" });
      latest.current = "";
      startTransition(() => router.replace(pathname, { scroll: false }));
    },
  };
}
