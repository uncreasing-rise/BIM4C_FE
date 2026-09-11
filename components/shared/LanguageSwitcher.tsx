"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "pill" | "select" | "compact";
  className?: string;
  isOverHero?: boolean;
}

export function LanguageSwitcher({
  variant = "pill",
  className,
  isOverHero = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-full border p-1 text-xs font-semibold backdrop-blur-md transition-colors",
          isOverHero
            ? "border-white/15 bg-black/20 text-white"
            : "border-border/80 bg-background/80 text-foreground",
          className,
        )}
        role="group"
        aria-label="Language selection"
      >
        <Globe className="ml-1.5 size-3.5 opacity-60" aria-hidden="true" />
        {SUPPORTED_LOCALES.map((loc) => {
          const isActive = locale === loc;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider transition-all duration-200",
                isActive
                  ? isOverHero
                    ? "bg-white text-brand-ink shadow-sm"
                    : "bg-primary text-primary-foreground shadow-sm"
                  : isOverHero
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              aria-pressed={isActive}
              aria-label={`Switch language to ${LOCALE_LABELS[loc].label}`}
            >
              {LOCALE_LABELS[loc].code}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-1 text-xs font-medium backdrop-blur-md transition-all duration-300",
        isOverHero
          ? "border-white/20 bg-black/25 text-white shadow-inner"
          : "border-border/70 bg-white/70 text-foreground shadow-xs",
        className,
      )}
      role="group"
      aria-label="Language selection"
    >
      <Globe
        className={cn(
          "ml-2 mr-0.5 size-3.5 transition-opacity",
          isOverHero ? "text-teal-300 opacity-90" : "text-primary opacity-80",
        )}
        aria-hidden="true"
      />
      {SUPPORTED_LOCALES.map((loc) => {
        const isActive = locale === loc;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-all duration-200",
              isActive
                ? isOverHero
                  ? "bg-white text-brand-ink font-bold shadow-sm"
                  : "bg-foreground text-background font-bold shadow-sm"
                : isOverHero
                  ? "text-white/75 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-pressed={isActive}
            aria-label={`Switch language to ${LOCALE_LABELS[loc].label}`}
          >
            <span className="text-[11px]">{LOCALE_LABELS[loc].flag}</span>
            <span>{LOCALE_LABELS[loc].code}</span>
          </button>
        );
      })}
    </div>
  );
}
