"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/features/projects/types/project";
import { ROUTES } from "@/constants/routes";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent } from "@/lib/i18n/localize";

export function ProjectRow({
  project: rawProject,
  number,
  dark = false,
}: {
  project: Project;
  number: number;
  dark?: boolean;
}) {
  const { t, locale } = useLanguage();
  const project = localizeContent(rawProject, locale);

  return (
    <article
      className={cn(
        "project-row group relative grid min-w-0 gap-5 border-b py-7 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12",
        dark ? "border-white/20" : "border-border",
      )}
      data-motion="tile"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-xs">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width:767px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <span className="absolute left-4 top-4 rounded-full bg-brand-ink/85 px-3 py-1 font-mono text-xs font-semibold text-white border border-white/10 backdrop-blur">
          {String(number).padStart(2, "0")}
        </span>
        {project.scale && (
          <span className="absolute right-4 bottom-4 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-teal-300 backdrop-blur border border-teal-500/30">
            {project.scale}
          </span>
        )}
      </div>
      <div className="min-w-0 md:py-2">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              dark ? "text-teal-300" : "text-primary",
            )}
          >
            {toLocalizedLabel(project.category, locale)}
          </p>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-xs font-medium text-muted-foreground">
            {project.year}
          </span>
          {project.contractPackage && (
            <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {project.contractPackage}
            </span>
          )}
        </div>
        <h3 className="mt-2.5 text-2xl font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors lg:text-3xl">
          <Link
            href={ROUTES.projectDetail(project.slug)}
            className="after:absolute after:inset-0 after:rounded-2xl"
            aria-label={`View ${project.title}`}
          >
            {project.title}
          </Link>
        </h3>
        <p
          className={cn(
            "mt-3 max-w-xl text-sm leading-7 line-clamp-3",
            dark ? "text-slate-300" : "text-muted-foreground",
          )}
        >
          {project.description}
        </p>
        <dl
          className={cn(
            "mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t pt-4 text-xs",
            dark ? "border-white/15" : "border-border",
          )}
        >
          <div>
            <dt className={dark ? "text-slate-400" : "text-muted-foreground"}>
              {t.projectsPage.location}
            </dt>
            <dd className="mt-1 font-semibold leading-5 text-foreground">
              {toLocalizedLabel(project.location, locale)}
            </dd>
          </div>
          <div>
            <dt className={dark ? "text-slate-400" : "text-muted-foreground"}>
              {t.projectsPage.status}
            </dt>
            <dd className="mt-1 font-semibold leading-5 text-foreground">
              {toLocalizedLabel(project.status, locale)}
            </dd>
          </div>
          {project.investor && (
            <div>
              <dt className={dark ? "text-slate-400" : "text-muted-foreground"}>
                {t.common.investor}
              </dt>
              <dd className="mt-1 font-semibold leading-5 text-foreground truncate">
                {project.investor}
              </dd>
            </div>
          )}
        </dl>
        <span
          className={cn(
            "mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-semibold",
            dark ? "text-teal-200" : "text-primary",
          )}
        >
          {t.projectsPage.exploreProject}{" "}
          <span
            className={cn(
              "grid size-9 place-items-center rounded-full border transition-all duration-300 group-hover:translate-x-1",
              dark
                ? "border-white/25 group-hover:bg-white/10"
                : "border-primary/25 group-hover:bg-primary/10",
            )}
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </span>
      </div>
    </article>
  );
}
