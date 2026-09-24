"use client";

import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ArrowUpRight, Building2, Calendar, MapPin, ShieldCheck } from "lucide-react";
import type { Project } from "@/features/projects/types/project";
import { ROUTES } from "@/constants/routes";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent } from "@/lib/i18n/localize";
import { resolveCoverImage } from "@/lib/content/cover-images";

import { ui } from "@/lib/i18n/ui";
export function ProjectCard({
  project: rawProject,
}: {
  project: Project;
}) {
  const { locale } = useLanguage();
  const project = localizeContent(rawProject, locale);

  return (
    <article
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-xs transition-all duration-500 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1.5"
      data-motion="tile"
    >
      {/* Top Image Stage with Zoom & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <Image
          src={resolveCoverImage({
            slug: project.slug,
            category: project.category,
            currentImage: project.image,
            type: "project",
          })}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Ambient Subtle Shadow Mask */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30" />

        {/* Top-Left Category Tag */}
        <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
          <span className="rounded-lg border border-white/20 bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-teal-300 backdrop-blur-md shadow-sm">
            {toLocalizedLabel(project.category, locale)}
          </span>
        </div>

        {/* Top-Right Status Tag */}
        {project.status && (
          <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toLocalizedLabel(project.status, locale)}</span>
          </div>
        )}

        {/* Slide-Up Hover Drawer (Appears inside the image container on hover) */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full transition-transform duration-400 ease-out group-hover:translate-y-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 text-white">
          <div className="space-y-1.5 text-xs text-slate-200">
            {project.scale && (
              <div className="flex items-center gap-1.5 font-medium">
                <Building2 className="size-3.5 shrink-0 text-teal-400" />
                <span className="truncate">{toLocalizedLabel(project.scale, locale)}</span>
              </div>
            )}
            {project.contractPackage && (
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="size-3.5 shrink-0 text-teal-400" />
                <span className="truncate">{toLocalizedLabel(project.contractPackage, locale)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info Section (Always Visible: Title, Year, Location) */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 bg-card">
        <div>
          {/* Metadata: Location & Year */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
            {project.location && (
              <span className="inline-flex items-center gap-1 truncate max-w-[170px]">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>{toLocalizedLabel(project.location, locale)}</span>
              </span>
            )}
            {project.year && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5 text-primary shrink-0" />
                <span>{project.year}</span>
              </span>
            )}
          </div>

          {/* Project Title */}
          <h3 className="mt-2.5 text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            <Link
              href={ROUTES.projectDetail(project.slug)}
              className="focus:outline-none"
            >
              {project.title}
            </Link>
          </h3>
        </div>

        {/* Bottom Action / Explore Button (Highlighted on hover) */}
        <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
            {project.investor ? `${project.investor}` : "BIM4C Delivery"}
          </span>

          <Link
            href={ROUTES.projectDetail(project.slug)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-xs group-hover:shadow-md group-hover:shadow-teal-900/20"
            aria-label={`${ui(locale).projectCard.exploreProject} ${project.title}`}
          >
            <span>{ui(locale).projectCard.explore}</span>
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
