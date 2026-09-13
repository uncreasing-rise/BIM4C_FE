"use client";

import { useLanguage } from "@/lib/i18n/context";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/lib/i18n/config";
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
  return (
    <div
      role="group"
      aria-label={locale === "vi" ? "Chọn ngôn ngữ" : "Language selection"}
      className={cn(
        "language-switcher inline-flex items-center rounded-lg border p-1",
        isOverHero
          ? "border-white/20 text-white"
          : "border-border bg-background text-foreground",
        className,
      )}
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          aria-pressed={locale === loc}
          aria-label={`Switch language to ${LOCALE_LABELS[loc].label}`}
          className={cn(
            "min-h-9 min-w-10 rounded-md px-2 text-xs font-semibold transition-colors",
            variant === "compact" && "min-w-9",
            locale === loc
              ? isOverHero
                ? "bg-white text-brand-ink"
                : "bg-primary text-white"
              : isOverHero
                ? "text-white/75 hover:bg-white/10"
                : "text-muted-foreground hover:bg-muted",
          )}
        >
          {LOCALE_LABELS[loc].code}
        </button>
      ))}
    </div>
  );
}
