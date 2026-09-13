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

const LanguageContext = createContext<LanguageContextType | null>(null);

function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getStoredLocale(fallback: Locale): Locale {
  if (typeof window === "undefined") return fallback;
  try {
    // 1. Check cookie
    const cookies = document.cookie.split("; ");
    const localeCookie = cookies.find((c) => c.startsWith(`${LOCALE_COOKIE_NAME}=`));
    if (localeCookie) {
      const val = localeCookie.split("=")[1] as Locale;
      if (SUPPORTED_LOCALES.includes(val)) return val;
    }
    // 2. Check localStorage
    const stored = localStorage.getItem("bim4c_locale") as Locale;
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  } catch {
    // ignore
  }
  return fallback;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedLocale = getStoredLocale(initialLocale);
      if (savedLocale !== locale) {
        setLocaleState(savedLocale);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [initialLocale, locale]);

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
