import {
  unwrapData,
  unwrapPage,
} from "@/features/shared/mappers/response.mapper";
import type { PageResult } from "@/features/shared/types/pagination";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { isNotFoundError } from "@/lib/api/errors";
import { withQueryParams } from "@/lib/api/query-params";
import type { ApiResponse } from "@/lib/api/types";
import { canDeferBuildData } from "@/lib/config/build";
import type { Project, ProjectQueryParams } from "../types/project";
import { mapProjectDto, type ProjectDto } from "./project.mapper";

export async function getProjects(
  params: ProjectQueryParams & { strict?: boolean } = {},
): Promise<Project[]> {
  const endpoint = withQueryParams(API_ENDPOINTS.projects.list, {
    page: params.page,
    limit: params.limit,
    search: params.search,
    category: params.category,
    location: params.location,
    year: params.year,
    status: params.status,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  try {
    const response = await apiClient.get<
      ApiResponse<ProjectDto[]> | ProjectDto[]
    >(endpoint, {
      signal: params.signal,
      next: { revalidate: 300, tags: ["projects"] },
    });
    return unwrapPage<ProjectDto>(
      response,
      params.page,
      params.limit,
    ).items.map(mapProjectDto);
  } catch (error) {
    if (!params.strict && canDeferBuildData(error)) return [];
    throw error;
  }
}

export async function getProjectsPage(
  params: ProjectQueryParams = {},
): Promise<PageResult<Project>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 6;
  // Filter values are the slugs/keys returned by getProjectFilters.
  const endpoint = withQueryParams(API_ENDPOINTS.projects.list, {
    page,
    limit,
    search: params.search,
    category: params.category,
    location: params.location,
    year: params.year,
    status: params.status?.trim().toLowerCase(),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  try {
    const response = await apiClient.get<
      ApiResponse<ProjectDto[]> | ProjectDto[]
    >(endpoint, {
      next: { revalidate: 300, tags: ["projects"] },
      signal: params.signal,
    });
    const result = unwrapPage<ProjectDto>(response, page, limit);
    return { ...result, items: result.items.map(mapProjectDto) };
  } catch (error) {
    if (canDeferBuildData(error))
      return { items: [], meta: { page, limit, total: 0, totalPages: 1 } };
    throw error;
  }
}

/** Filter options present in published projects; empty lists when the API is unavailable. */
export interface ProjectFilters {
  categories: { slug: string; name: string }[];
  locations: { value: string; label_vi: string | null }[];
  years: number[];
  statuses: string[];
}

export async function getProjectFilters(): Promise<ProjectFilters> {
  try {
    const response = await apiClient.get<Partial<ProjectFilters>>(
      API_ENDPOINTS.projects.filters,
      { next: { revalidate: 300, tags: ["projects"] } },
    );
    return {
      categories: response?.categories ?? [],
      locations: response?.locations ?? [],
      years: response?.years ?? [],
      statuses: response?.statuses ?? [],
    };
  } catch {
    return { categories: [], locations: [], years: [], statuses: [] };
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const response = await apiClient.get<ApiResponse<ProjectDto> | ProjectDto>(
      API_ENDPOINTS.projects.detail(slug),
      { next: { revalidate: 300, tags: ["projects", `project-${slug}`] } },
    );
    return mapProjectDto(unwrapData(response));
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}


export async function getAllProjects(): Promise<Project[]> {
  const results: Project[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await getProjects({ page, limit: 100 });
    results.push(...batch);
    if (batch.length < 100) return results;
  }
}
