"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/** URL-backed filters keep pagination, reloads and browser navigation consistent. */
export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = searchParams.toString();
  const urlQuery = searchParams.get("q") ?? "";
  // `committed` is the last q this hook wrote to the URL. When the URL settles
  // on that value, the input keeps whatever was typed while the request ran;
  // only an outside change (back/forward, a link) replaces the input text.
  const [draft, setDraft] = useState({
    source,
    query: urlQuery,
    committed: urlQuery,
  });
  const [pending, startTransition] = useTransition();
  const latest = useRef(source);
  useEffect(() => {
    latest.current = source;
  }, [source]);

  if (draft.source !== source) {
    const external = urlQuery !== draft.committed;
    setDraft({
      source,
      query: external ? urlQuery : draft.query,
      committed: urlQuery,
    });
  }

  const navigate = (params: URLSearchParams) => {
    latest.current = params.toString();
    startTransition(() =>
      router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
        scroll: false,
      }),
    );
  };

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(latest.current);
    params.delete("page");
    if (!value || value === "All") params.delete(key);
    else params.set(key, value);
    navigate(params);
  };

  const trimmedQuery = draft.query.trim();
  useEffect(() => {
    if (trimmedQuery === draft.committed) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(latest.current);
      params.delete("page");
      if (trimmedQuery) params.set("q", trimmedQuery);
      else params.delete("q");
      setDraft((current) => ({ ...current, committed: trimmedQuery }));
      navigate(params);
    }, 300);
    return () => window.clearTimeout(timer);
    // navigate only closes over stable router/pathname values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedQuery, draft.committed, pathname]);

  return {
    searchParams,
    query: draft.query,
    pending,
    setQuery: (query: string) =>
      setDraft((current) => ({ ...current, query })),
    update,
    reset: () => {
      setDraft((current) => ({ ...current, query: "", committed: "" }));
      navigate(new URLSearchParams());
    },
  };
}
