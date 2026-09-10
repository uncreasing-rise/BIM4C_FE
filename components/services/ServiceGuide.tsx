"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";

const needs = [
  {
    label: "Start with a BIM plan",
    slug: "tu-van-bim",
    title: "Set a clear direction before modelling starts.",
    description:
      "Align your project goals, information requirements and team responsibilities.",
    preparation:
      "Your project stage, team structure and any existing BIM requirements.",
  },
  {
    label: "Coordinate project models",
    slug: "bim-coordination",
    title: "Help disciplines work from coordinated information.",
    description:
      "Bring models together, review clashes and make issues easier to track and resolve.",
    preparation:
      "Available discipline models, project milestones and current coordination challenges.",
  },
  {
    label: "Develop our team",
    slug: "dao-tao",
    title: "Build skills your team can apply at work.",
    description:
      "Discuss training around your team's current experience, roles and project workflows.",
    preparation:
      "Team roles, software experience and the skills you want to develop.",
  },
  {
    label: "Prepare digital handover",
    slug: "digital-twin-va-du-lieu-tai-san",
    title: "Make project information useful beyond construction.",
    description:
      "Define how asset data should be structured, checked and handed over for its next use.",
    preparation:
      "Asset information requirements, available model data and operational priorities.",
  },
];

export function ServiceGuide({
  services,
}: {
  services: Pick<ContentEntry, "slug" | "title">[];
}) {
  const [selected, setSelected] = useState(0);
  const need = needs[selected];
  const service = services.find((item) => item.slug === need.slug);
  return (
    <section
      className="border-b bg-white py-10 lg:py-12"
      aria-labelledby="service-guide-title"
    >
      <div className="site-container grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
        <div>
          <p className="eyebrow">
            <Compass className="size-4" /> Find your starting point
          </p>
          <h2 id="service-guide-title" className="section-title">
            What does your team need?
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Choose a priority to see a relevant starting point. We can shape the
            scope together.
          </p>
          <div
            className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
            role="group"
            aria-label="Your project priority"
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
            Suggested starting point
          </p>
          <h3 className="mt-4 max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {need.title}
          </h3>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
            {need.description}
          </p>
          <div className="my-6 border-y border-white/15 py-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Check className="size-4 text-teal-300" /> Useful for our first
              conversation
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
                Explore {service.title}
                <ArrowRight className="size-4" />
              </Link>
            )}
            <Link
              href={ROUTES.contact}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-200 underline-offset-4 hover:underline"
            >
              Discuss your needs <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
