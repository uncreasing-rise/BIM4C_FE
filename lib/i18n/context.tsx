"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale, SUPPORTED_LOCALES } from "./config";
import { enDictionary } from "./dictionaries/en";
import { viDictionary } from "./dictionaries/vi";
import type { Dictionary, LanguageContextType } from "./types";

const dictionaries: Record<Locale, Dictionary> = {
  en: enDictionary,
  vi: viDictionary,
};

export const LanguageContext = createContext<LanguageContextType | null>(null);

function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  // The server resolves the locale for every route (the /vi or /en URL prefix,
  // or Vietnamese for /admin), so it is authoritative. Re-reading a cookie on
  // the client used to flip the admin UI (and <html lang>) to English after a
  // visitor had browsed the English site.
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [syncedInitial, setSyncedInitial] = useState(initialLocale);
  if (initialLocale !== syncedInitial) {
    // Client navigation to a route rendered in another locale.
    setSyncedInitial(initialLocale);
    setLocaleState(initialLocale);
  }

  const setLocale = useCallback((newLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    setLocaleState(newLocale);
    setLocaleCookie(newLocale);
    try {
      localStorage.setItem("bim4c_locale", newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useMemo(() => dictionaries[locale] || dictionaries[DEFAULT_LOCALE], [locale]);

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: dictionaries[DEFAULT_LOCALE],
    };
  }
  return context;
}

export function useTranslation(): { t: Dictionary; locale: Locale } {
  const { t, locale } = useLanguage();
  return { t, locale };
}
