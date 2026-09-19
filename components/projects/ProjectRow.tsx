"use client";

import { ROUTES } from "@/constants/routes";
import type { Project } from "@/features/projects/types/project";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent } from "@/lib/i18n/localize";
import { cn } from "@/lib/utils";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";

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
  const isVi = locale === "vi";
  const project = localizeContent(rawProject, locale);

  return (
    <article
      className={cn(
        "project-row group relative grid min-w-0 gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10 items-center rounded-3xl p-4 sm:p-6 transition-all duration-300",
        dark
          ? "bg-transparent text-white"
          : "border border-border/80 bg-card text-card-foreground shadow-xs hover:border-primary/40 hover:shadow-xl",
      )}
      data-motion="tile"
    >
      {/* 3D Render / Project Photo Showcase Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-2xl bg-slate-950 border border-black/10 dark:border-white/15 shadow-md">
        <Image
          src={project.image}
          alt={project.title}
          fill
          priority
          sizes="(max-width:1023px) 100vw, 55vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Depth gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Slide Number Badge (Top-Left) */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-xl bg-slate-950/85 px-3 py-1.5 font-mono text-xs font-bold text-teal-300 border border-teal-500/30 backdrop-blur-md shadow-md">
          <span className="text-[10px] text-zinc-400">PROJECT</span>
          <span>{String(number).padStart(2, "0")}</span>
        </div>

        {/* Project Scale Tag (Bottom-Left) */}
        {project.scale && (
          <div className="absolute left-4 bottom-4 max-w-[80%] flex items-center gap-1.5 rounded-lg bg-slate-950/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/15 shadow-md">
            <Building2 className="size-3.5 text-teal-400 shrink-0" />
            <span className="truncate">{project.scale}</span>
          </div>
        )}

        {/* Status indicator (Top-Right) */}
        {project.status && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur border border-emerald-500/30">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toLocalizedLabel(project.status, locale)}</span>
          </div>
        )}
      </div>

      {/* Project Details Panel */}
      <div className="min-w-0 flex flex-col justify-center">
        {/* Metadata Header */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 border border-teal-500/30">
            {toLocalizedLabel(project.category, locale)}
          </span>
          {project.year && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold",
                dark
                  ? "bg-white/[0.06] text-slate-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Calendar className="size-3 text-primary" />
              <span>{project.year}</span>
            </span>
          )}
          {project.contractPackage && (
            <span
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium truncate max-w-[200px]",
                dark
                  ? "bg-white/[0.06] text-slate-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {project.contractPackage}
            </span>
          )}
        </div>

        {/* Project Title */}
        <h3
          className={cn(
            "mt-3 text-2xl sm:text-3xl font-bold leading-tight tracking-tight transition-colors",
            dark
              ? "text-white group-hover:text-teal-300"
              : "text-foreground group-hover:text-primary",
          )}
        >
          <Link
            href={ROUTES.projectDetail(project.slug)}
            className="after:absolute after:inset-0"
            aria-label={`View ${project.title}`}
          >
            {project.title}
          </Link>
        </h3>

        {/* Description */}
        <p
          className={cn(
            "mt-3 text-sm leading-relaxed line-clamp-3",
            dark ? "text-slate-300" : "text-muted-foreground",
          )}
        >
          {project.description}
        </p>

        {/* Structured Bento Specs Strip */}
        <div
          className={cn(
            "mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 border-t pt-4 text-xs",
            dark ? "border-white/10" : "border-border",
          )}
        >
          {project.location && (
            <div
              className={cn(
                "rounded-xl border p-2.5 backdrop-blur-sm",
                dark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-border bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-1 text-[11px] font-medium",
                  dark ? "text-slate-400" : "text-muted-foreground",
                )}
              >
                <MapPin className="size-3 text-teal-600 dark:text-teal-400" />
                {t.projectsPage.location}
              </span>
              <p
                className={cn(
                  "mt-1 font-bold truncate",
                  dark ? "text-white" : "text-foreground",
                )}
              >
                {toLocalizedLabel(project.location, locale)}
              </p>
            </div>
          )}

          {project.investor && (
            <div
              className={cn(
                "rounded-xl border p-2.5 backdrop-blur-sm",
                dark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-border bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-1 text-[11px] font-medium",
                  dark ? "text-slate-400" : "text-muted-foreground",
                )}
              >
                <UserCheck className="size-3 text-teal-600 dark:text-teal-400" />
                {t.common.investor}
              </span>
              <p
                className={cn(
                  "mt-1 font-bold truncate",
                  dark ? "text-white" : "text-foreground",
                )}
              >
                {project.investor}
              </p>
            </div>
          )}

          <div
            className={cn(
              "rounded-xl border p-2.5 backdrop-blur-sm col-span-2 sm:col-span-1",
              dark
                ? "border-white/10 bg-white/[0.03]"
                : "border-border bg-muted/40",
            )}
          >
            <span
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium",
                dark ? "text-slate-400" : "text-muted-foreground",
              )}
            >
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              {isVi ? "Tiêu chuẩn" : "Standard"}
            </span>
            <p
              className={cn(
                "mt-1 font-bold font-mono",
                dark ? "text-teal-300" : "text-primary",
              )}
            >
              BIM
            </p>
          </div>
        </div>

        {/* Action Link */}
        <div className="mt-6 flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-2 text-sm font-bold transition-colors",
              dark
                ? "text-teal-300 group-hover:text-teal-200"
                : "text-primary group-hover:text-primary-hover",
            )}
          >
            <span>{t.projectsPage.exploreProject}</span>
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
