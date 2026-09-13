"use client";

import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { CourseDetailView, type CourseDetailEntry } from "@/components/courses/CourseDetailView";
import { ServiceDetailView } from "@/components/services/ServiceDetailView";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import type { ContentEntry } from "@/types/content";
import type { Project } from "@/features/projects/types/project";

export type DetailKind = "course" | "project" | "article" | "service";
export type DetailEntry = ContentEntry & Partial<Project> & Partial<CourseDetailEntry>;

export function DetailPage({
  entry,
  backHref,
  kind = "service",
  related = [],
}: {
  entry: DetailEntry;
  backHref: string;
  backLabel?: string;
  kind?: DetailKind;
  related?: ContentEntry[];
}) {
  switch (kind) {
    case "project":
      return (
        <ProjectDetailView
          entry={entry as Project}
          related={related}
          backHref={backHref}
        />
      );
    case "course":
      return (
        <CourseDetailView
          entry={entry as CourseDetailEntry}
          related={related}
          backHref={backHref}
        />
      );
    case "article":
      return (
        <BlogDetailView
          entry={entry}
          related={related}
          backHref={backHref}
        />
      );
    case "service":
    default:
      return (
        <ServiceDetailView
          entry={entry}
          related={related}
          backHref={backHref}
        />
      );
  }
}
