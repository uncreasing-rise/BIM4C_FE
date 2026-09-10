"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Project } from "@/features/projects/types/project";
import { ProjectRow } from "@/components/projects/ProjectRow";

export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const count = projects.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [count]);

  if (!count) return null;
  const select = (index: number) => setActive((index + count) % count);

  return (
    <div
      className="relative"
      aria-roledescription="carousel"
      aria-label="Selected projects"
    >
      <div className="overflow-hidden">
        <div
          key={projects[active].slug}
          className="project-slide animate-in fade-in duration-500"
        >
          <ProjectRow project={projects[active]} number={active + 1} dark />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-400" aria-live="polite">
          <span className="font-mono text-teal-200">
            {String(active + 1).padStart(2, "0")}
          </span>{" "}
          / {String(count).padStart(2, "0")}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => select(active - 1)}
            className="grid size-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 focus-visible:outline-white"
            aria-label="Previous project"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => select(active + 1)}
            className="grid size-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 focus-visible:outline-white"
            aria-label="Next project"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <div
        className="mt-4 flex gap-2"
        role="tablist"
        aria-label="Choose project"
      >
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-label={`Show project ${index + 1}: ${project.title}`}
            onClick={() => select(index)}
            className="group flex min-h-6 items-center gap-2"
            tabIndex={active === index ? 0 : -1}
          >
            <span
              className={`h-1 rounded-full transition-all ${active === index ? "w-10 bg-teal-300" : "w-5 bg-white/25 group-hover:bg-white/50"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
