"use client";

import { useLanguage } from "@/lib/i18n/context";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { localePrefix } from "@/lib/i18n/path";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";

import { ui } from "@/lib/i18n/ui";
interface LanguageSwitcherProps {
  variant?: "pill" | "select" | "compact";
  className?: string;
  isOverHero?: boolean;
}

export function LocaleFlag({ loc, className }: { loc: (typeof SUPPORTED_LOCALES)[number]; className?: string }) {
  if (loc === "vi") {
    return (
      <svg viewBox="0 0 640 480" className={cn("inline-block shrink-0 rounded-xs shadow-xs object-cover", className)} aria-hidden="true">
        <rect width="640" height="480" fill="#da251d" />
        <polygon
          points="320,80 357,194 477,194 380,265 417,379 320,309 223,379 260,265 163,194 283,194"
          fill="#ffff00"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 640 480" className={cn("inline-block shrink-0 rounded-xs shadow-xs object-cover", className)} aria-hidden="true">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path fill="#fff" d="m75 0 245 180L565 0h75v60L435 240l205 180v60h-75L320 300 75 480H0v-60l205-180L0 60V0z" />
      <path fill="#c8102e" d="m425 285 215 160v35h-35L390 310zM195 195 0 45V0h35l215 160zM425 195 640 35V0h-35L390 170zM195 285 0 435v45h35l215-160z" />
      <path fill="#fff" d="M260 0h120v480H260zM0 180h640v120H0z" />
      <path fill="#c8102e" d="M280 0h80v480H280zM0 200h640v80H0z" />
    </svg>
  );
}

export function LanguageSwitcher({
  variant = "pill",
  className,
  isOverHero = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (nextLocale: (typeof SUPPORTED_LOCALES)[number]) => {
    if (nextLocale === locale) return;
    setLocale(nextLocale);
    // The same page in the other language, query kept (page number, filters).
    router.push(`${localePrefix(nextLocale, pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/")}${window.location.search}`);
  };

  if (variant === "compact") {
    return (
      <div
        role="group"
        aria-label={ui(locale).languageSwitcher.languageSelection}
        className={cn(
          "language-switcher inline-flex items-center gap-0.5 rounded-full p-1 transition-all duration-200",
          isOverHero
            ? "border border-white/20 bg-slate-950/40 text-white shadow-inner backdrop-blur-md ring-1 ring-white/10"
            : "border border-slate-200/80 bg-slate-100/90 text-foreground shadow-inner backdrop-blur-md",
          className,
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center pl-1.5 pr-0.5",
            isOverHero ? "text-white/60" : "text-slate-400"
          )}
          aria-hidden="true"
        >
          <Globe className="size-3.5" />
        </div>
        {SUPPORTED_LOCALES.map((loc) => {
          const isActive = locale === loc;
          const info = LOCALE_LABELS[loc];
          return (
            <a
              key={loc}
              href={localePrefix(loc, pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/")}
              onClick={(event) => {
                event.preventDefault();
                switchTo(loc);
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Switch language to ${info.label}`}
              className={cn(
                "relative inline-flex h-7 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ease-out select-none",
                isActive
                  ? isOverHero
                    ? "bg-white text-slate-950 shadow-sm"
                    : "bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/70"
                  : isOverHero
                    ? "text-white/70 hover:bg-white/15 hover:text-white"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-950",
              )}
            >
              <LocaleFlag loc={loc} className="h-3 w-4" />
              <span>{info.code}</span>
            </a>
          );
        })}
      </div>
    );
  }

  // Full / Mobile Sheet / Standard pill variant
  return (
    <div
      role="group"
      aria-label={ui(locale).languageSwitcher.languageSelection}
      className={cn(
        "language-switcher grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/90 p-1.5",
        className,
      )}
    >
      {SUPPORTED_LOCALES.map((loc) => {
        const isActive = locale === loc;
        const info = LOCALE_LABELS[loc];
        return (
          <a
            key={loc}
            href={localePrefix(loc, pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/")}
            onClick={(event) => {
              event.preventDefault();
              switchTo(loc);
            }}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Switch language to ${info.label}`}
            className={cn(
              "flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
              isActive
                ? "bg-white text-teal-700 shadow-sm ring-1 ring-teal-600/20"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
            )}
          >
            <div className="flex items-center gap-2.5">
              <LocaleFlag loc={loc} className="h-3.5 w-5" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-xs">{info.code}</span>
                <span className={cn("text-[11px]", isActive ? "text-teal-600/90" : "text-muted-foreground")}>
                  {info.label}
                </span>
              </div>
            </div>
            {isActive && <Check className="size-4 text-teal-600 shrink-0" />}
          </a>
        );
      })}
    </div>
  );
}
