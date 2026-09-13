"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import { useLanguage } from "@/lib/i18n/context";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  variant?: "default" | "about";
  breadcrumbs?: { label: string; href?: string }[];
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  variant = "default",
  breadcrumbs,
}: PageHeroProps) {
  const { t, locale } = useLanguage();
  const isAbout = variant === "about";

  const naturalEyebrow = toLocalizedLabel(
    eyebrow === eyebrow.toLocaleUpperCase("vi-VN")
      ? eyebrow
          .toLocaleLowerCase("vi-VN")
          .replace(/^./u, (character) => character.toLocaleUpperCase("vi-VN"))
          .replace(/\bbim4c\b/giu, "BIM4C")
          .replace(/\bbim\b/giu, "BIM")
      : eyebrow,
    locale,
  );

  const effectiveBreadcrumbs = breadcrumbs ?? [{ label: title }];
  const lastBreadcrumb = effectiveBreadcrumbs[effectiveBreadcrumbs.length - 1];
  const shouldShowEyebrowPill =
    Boolean(naturalEyebrow) &&
    naturalEyebrow.trim().toLowerCase() !== title.trim().toLowerCase() &&
    naturalEyebrow.trim().toLowerCase() !== lastBreadcrumb?.label.trim().toLowerCase();

  return (
    <section
      className={cn(
        "page-hero relative isolate flex flex-col justify-start min-h-[340px] sm:min-h-[380px] lg:min-h-[400px] overflow-hidden bg-brand-ink text-white pt-32 pb-14 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-20",
      )}
    >
      {/* Background Image with Parallax */}
      <Image
        className={cn(
          "-z-20 object-cover opacity-30 scale-105 transition-transform duration-1000",
          isAbout ? "object-center" : "object-right",
        )}
        data-motion="parallax"
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
      />

      {/* Deep Multi-stage Gradient Overlays */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,24,31,0.98)_0%,rgba(4,24,31,0.92)_50%,rgba(4,24,31,0.45)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-ink via-transparent to-brand-ink/60" />

      {/* Architectural Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-15 [background-image:linear-gradient(rgba(94,234,212,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,0.15)_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* Ambient Accent Glows */}
      <div className="pointer-events-none absolute -left-32 top-1/2 size-96 -translate-y-1/2 rounded-full bg-teal-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-10 top-1/4 size-80 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="site-container relative min-w-0" data-motion="hero">
        {/* Synchronized Breadcrumb Navigation */}
        <nav
          className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-zinc-300"
          aria-label={locale === "vi" ? "Đường dẫn trang" : "Breadcrumb"}
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-zinc-400 hover:text-teal-300 transition-colors"
          >
            <Home className="size-3.5" />
            <span className="sr-only">{t.navigation.home}</span>
          </Link>
          {effectiveBreadcrumbs.map((item, index, items) => (
            <span className="flex items-center gap-1.5" key={`${item.label}-${index}`}>
              <ChevronRight className="size-3 text-zinc-500 shrink-0" />
              {item.href ? (
                <Link
                  className="text-zinc-300 hover:text-teal-300 transition-colors truncate max-w-[200px] sm:max-w-none"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="font-semibold text-teal-300 truncate max-w-[260px] sm:max-w-md"
                  aria-current={index === items.length - 1 ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        {/* Optional Eyebrow Pill (Only shown when distinct from breadcrumb label) */}
        {shouldShowEyebrowPill && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 mb-4 backdrop-blur-md shadow-xs">
            <span className="size-1.5 rounded-full bg-teal-400" />
            <span>{naturalEyebrow}</span>
          </div>
        )}

        {/* Hero Title */}
        <h1 className="max-w-3xl text-balance text-3xl font-extrabold leading-[1.15] tracking-[-0.035em] sm:text-4xl lg:text-5xl text-white">
          {title}
        </h1>

        {/* Hero Description */}
        <p className="mt-4 max-w-2xl break-words border-l-2 border-teal-400 pl-4 text-sm leading-relaxed text-slate-200/95 sm:text-base md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}

