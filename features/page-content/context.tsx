"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/context";
import type { SiteSettingsData } from "@/features/settings/types";
import type { PageContentBlock, PageContentKey, PageContentMap } from "./types";

interface SiteData {
  settings: SiteSettingsData | null;
  content: PageContentMap;
}

const SiteDataContext = createContext<SiteData>({
  settings: null,
  content: {},
});

/** Carries admin-managed settings and page copy fetched once by the public layout. */
export function SiteDataProvider({
  settings,
  content,
  children,
}: SiteData & { children: ReactNode }) {
  return (
    <SiteDataContext.Provider value={{ settings, content }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsData | null {
  return useContext(SiteDataContext).settings;
}

/**
 * The block in the active language, falling back to the other language when only
 * one was filled in. Null when the block was deleted, so callers can hide it.
 */
export function usePageContent<K extends PageContentKey>(
  key: K,
): PageContentBlock<K> | null {
  const { locale } = useLanguage();
  const block = useContext(SiteDataContext).content[key];
  return block?.[locale] ?? block?.[locale === "vi" ? "en" : "vi"] ?? null;
}
