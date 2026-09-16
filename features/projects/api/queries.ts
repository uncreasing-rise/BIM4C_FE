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
      cache: "no-store",
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
  const categorySlug: Record<string, string> = {
    "high-rise": "nha-cao-tang",
    "low-rise": "nha-thap-tang",
    industrial: "cong-nghiep",
    infrastructure: "ha-tang",
    mep: "co-dien",
  };
  const endpoint = withQueryParams(API_ENDPOINTS.projects.list, {
    page,
    limit,
    search: params.search,
    category:
      categorySlug[params.category?.toLowerCase().replace(/\s+/g, "-") ?? ""] ??
      params.category?.toLowerCase().replace(/\s+/g, "-"),
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
      cache: "no-store",
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

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const response = await apiClient.get<ApiResponse<ProjectDto> | ProjectDto>(
      API_ENDPOINTS.projects.detail(slug),
      { cache: "no-store" },
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
