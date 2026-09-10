import type { Project, ProjectQueryParams } from "../types/project";

import { ALL_PROJECT_FILTER } from "../constants";
import { toEnglishLabel } from "@/lib/utils/public-labels";

const matches = (value: string, filter?: string) =>
  !filter ||
  filter === ALL_PROJECT_FILTER ||
  filter === "Tất cả" ||
  toEnglishLabel(value) === toEnglishLabel(filter);

export function filterProjects(
  projects: Project[],
  filters: ProjectQueryParams,
): Project[] {
  const normalizedSearch = filters.search?.trim().toLocaleLowerCase("vi") ?? "";
  return projects.filter(
    (project) =>
      matches(project.category, filters.category) &&
      (!normalizedSearch ||
        project.title.toLocaleLowerCase("vi").includes(normalizedSearch)) &&
      matches(project.location, filters.location) &&
      matches(project.year, filters.year) &&
      matches(project.status, filters.status),
  );
}
