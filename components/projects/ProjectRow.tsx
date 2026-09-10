import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/features/projects/types/project";
import { ROUTES } from "@/constants/routes";
import { toEnglishLabel } from "@/lib/utils/public-labels";
import { cn } from "@/lib/utils";

export function ProjectRow({
  project,
  number,
  dark = false,
}: {
  project: Project;
  number: number;
  dark?: boolean;
}) {
  return (
    <article
      className={cn(
        "project-row group relative grid min-w-0 gap-5 border-b py-7 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12",
        dark ? "border-white/20" : "border-border",
      )}
      data-motion="tile"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
        <Image
          src={project.image}
          alt=""
          fill
          sizes="(max-width:767px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025] group-focus-within:scale-[1.025]"
        />
        <span className="absolute left-4 top-4 rounded bg-brand-ink/85 px-3 py-2 font-mono text-xs text-white">
          {String(number).padStart(2, "0")}
        </span>
      </div>
      <div className="min-w-0 md:py-3">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            dark ? "text-teal-200" : "text-primary",
          )}
        >
          {toEnglishLabel(project.category)} <span aria-hidden="true"> / </span>{" "}
          {project.year}
        </p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight lg:text-3xl">
          <Link
            href={ROUTES.projectDetail(project.slug)}
            className="after:absolute after:inset-0 after:rounded-lg"
            aria-label={`View ${project.title}`}
          >
            {project.title}
          </Link>
        </h3>
        <p
          className={cn(
            "mt-3 max-w-xl text-sm leading-7",
            dark ? "text-slate-300" : "text-muted-foreground",
          )}
        >
          {project.description}
        </p>
        <dl
          className={cn(
            "mt-5 grid grid-cols-[1fr_auto] gap-4 border-t pt-4 text-xs",
            dark ? "border-white/15" : "border-border",
          )}
        >
          <div>
            <dt className={dark ? "text-slate-400" : "text-muted-foreground"}>
              Location
            </dt>
            <dd className="mt-1 font-medium leading-5">{project.location}</dd>
          </div>
          <div>
            <dt className={dark ? "text-slate-400" : "text-muted-foreground"}>
              Status
            </dt>
            <dd className="mt-1 font-medium leading-5">
              {toEnglishLabel(project.status)}
            </dd>
          </div>
        </dl>
        <span
          className={cn(
            "mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-semibold",
            dark ? "text-teal-200" : "text-primary",
          )}
        >
          Explore project{" "}
          <span
            className={cn(
              "grid size-9 place-items-center rounded-full border transition-colors",
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
