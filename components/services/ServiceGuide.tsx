"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent } from "@/lib/i18n/localize";

export function ServiceGuide({
  services: rawServices,
}: {
  services: Pick<ContentEntry, "slug" | "title">[];
}) {
  const { t, locale } = useLanguage();
  const [selected, setSelected] = useState(0);

  const needs = t.servicesPage.needs;
  const need = needs[selected] ?? needs[0];

  const rawService = rawServices.find((item) => item.slug === need.slug);
  const service = rawService
    ? localizeContent({ title: rawService.title, slug: rawService.slug }, locale)
    : null;

  return (
    <section
      className="border-b bg-white py-10 lg:py-12"
      aria-labelledby="service-guide-title"
    >
      <div className="site-container grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
        <div>
          <p className="eyebrow">
            <Compass className="size-4" /> {t.servicesPage.guideEyebrow}
          </p>
          <h2 id="service-guide-title" className="section-title">
            {t.servicesPage.guideTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {t.servicesPage.guideDesc}
          </p>
          <div
            className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
            role="group"
            aria-label={t.servicesPage.guideTitle}
          >
            {needs.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                aria-pressed={selected === index}
                aria-controls="service-recommendation"
                onClick={() => setSelected(index)}
                className="flex min-h-12 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white"
              >
                {item.label}
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
        <div
          id="service-recommendation"
          className="technical-grid flex flex-col rounded-2xl bg-brand-ink p-6 text-white sm:p-8"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
            {t.servicesPage.suggestedStartingPoint}
          </p>
          <h3 className="mt-4 max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {need.title}
          </h3>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
            {need.description}
          </p>
          <div className="my-6 border-y border-white/15 py-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Check className="size-4 text-teal-300" />{" "}
              {t.servicesPage.usefulForFirstConversation}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {need.preparation}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-4">
            {service && (
              <Link
                href={ROUTES.serviceDetail(service.slug)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-brand-ink hover:bg-teal-100"
              >
                {t.servicesPage.exploreSolution}: {service.title}
                <ArrowRight className="size-4" />
              </Link>
            )}
            <Link
              href={ROUTES.contact}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-200 underline-offset-4 hover:underline"
            >
              {t.servicesPage.discussNeeds} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
