import type { Project, ProjectQueryParams } from "../types/project";

const ALL = "Tất cả";

export function filterProjects(projects: Project[], filters: ProjectQueryParams): Project[] {
  const normalizedSearch = filters.search?.trim().toLocaleLowerCase("vi") ?? "";
  return projects.filter(project =>
    (!filters.category || filters.category === ALL || project.category === filters.category) &&
    (!normalizedSearch || project.title.toLocaleLowerCase("vi").includes(normalizedSearch)) &&
    (!filters.location || filters.location === ALL || project.location === filters.location) &&
    (!filters.year || filters.year === ALL || project.year === filters.year) &&
    (!filters.status || filters.status === ALL || project.status === filters.status)
  );
}

