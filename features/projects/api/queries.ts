import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { isNotFoundError } from "@/lib/api/errors";
import { withQueryParams } from "@/lib/api/query-params";
import { env } from "@/lib/config/env";
import { unwrapData } from "@/features/shared/mappers/response.mapper";
import type { ApiResponse } from "@/lib/api/types";
import { mockProjects } from "./project.mock";
import { mapProjectDto, type ProjectDto } from "./project.mapper";
import type { Project, ProjectQueryParams } from "../types/project";
import { canDeferBuildData } from "@/lib/config/build";

export async function getProjects(params: ProjectQueryParams = {}): Promise<Project[]> {
  if (env.useMockApi) return mockProjects;
  const endpoint = withQueryParams(API_ENDPOINTS.projects.list, {
    page: params.page, limit: params.limit, search: params.search, category: params.category,
    location: params.location, year: params.year, status: params.status,
    sortBy: params.sortBy, sortOrder: params.sortOrder,
  });
  try {
    const response = await apiClient.get<ApiResponse<ProjectDto[]> | ProjectDto[]>(endpoint, { signal: params.signal, next: { revalidate: 300, tags: ["projects"] } });
    return unwrapData(response).map(mapProjectDto);
  } catch (error) {
    if (canDeferBuildData(error)) return [];
    throw error;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (env.useMockApi) return mockProjects.find(project => project.slug === slug) ?? null;
  try {
    const response = await apiClient.get<ApiResponse<ProjectDto> | ProjectDto>(API_ENDPOINTS.projects.detail(slug), { next: { revalidate: 300, tags: ["projects", `project:${slug}`] } });
    return mapProjectDto(unwrapData(response));
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}
