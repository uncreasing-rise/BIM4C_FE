"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/features/projects/types/project";
import { ProjectRow } from "@/components/projects/ProjectRow";
import { useSlideshow } from "@/components/motion/hooks/use-slideshow";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

import { ui } from "@/lib/i18n/ui";
export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const slider = useSlideshow(projects.length, 6000);
  const { locale } = useLanguage();

  useEffect(() => {
    if (!slider.reduced && !slider.playing) slider.toggle();
  }, [slider, slider.reduced, slider.playing, slider.toggle]);

  if (!projects.length) return null;

  return (
    <div
      className="project-showcase relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={ui(locale).projectCarousel.selectedProjects}
      {...slider.handlers}
    >
      {/* Main Slide Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl">
        <div className="project-fade-track relative min-h-[460px] sm:min-h-[400px]">
          {projects.map((project, index) => {
            const isCurrent = slider.active === index;
            return (
              <div
                key={project.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${projects.length}`}
                aria-hidden={!isCurrent}
                inert={!isCurrent}
                className={cn(
                  "transition-all duration-500 ease-out",
                  isCurrent
                    ? "opacity-100 translate-y-0 relative z-10 pointer-events-auto"
                    : "opacity-0 translate-y-4 absolute inset-0 z-0 pointer-events-none",
                )}
              >
                <ProjectRow project={project} number={index + 1} dark />
              </div>
            );
          })}
        </div>

        {/* Carousel Bottom Controls Bar */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-6">
          {/* Slide Indicator Tabs */}
          <div className="flex flex-wrap items-center gap-2" role="tablist">
            {projects.map((project, index) => {
              const isCurrent = slider.active === index;
              return (
                <button
                  key={project.slug}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  onClick={() => slider.select(index)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 border",
                    isCurrent
                      ? "border-teal-500/50 bg-teal-500/20 text-white shadow-sm shadow-teal-900/50"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.08]",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[11px] font-bold",
                      isCurrent ? "text-teal-300" : "text-zinc-500",
                    )}
                  >
                    0{index + 1}
                  </span>
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">
                    {project.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next Action Arrows & Status */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Slide Index Counter */}
            <span className="font-mono text-xs text-zinc-400">
              <strong className="text-white font-bold">
                {String(slider.active + 1).padStart(2, "0")}
              </strong>
              <span> / {String(projects.length).padStart(2, "0")}</span>
            </span>

            {/* Prev Button */}
            <button
              type="button"
              onClick={() => slider.select(slider.active - 1)}
              className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/[0.05] text-white hover:bg-teal-500 hover:text-slate-950 hover:border-teal-400 transition-all duration-200 shadow-md"
              aria-label={ui(locale).projectCarousel.previousProject}
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => slider.select(slider.active + 1)}
              className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/[0.05] text-white hover:bg-teal-500 hover:text-slate-950 hover:border-teal-400 transition-all duration-200 shadow-md"
              aria-label={ui(locale).projectCarousel.nextProject}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
