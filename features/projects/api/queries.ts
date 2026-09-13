import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { isNotFoundError } from "@/lib/api/errors";
import { withQueryParams } from "@/lib/api/query-params";
import { env } from "@/lib/config/env";
import {
  unwrapData,
  unwrapPage,
} from "@/features/shared/mappers/response.mapper";
import type { PageResult } from "@/features/shared/types/pagination";
import type { ApiResponse } from "@/lib/api/types";
import { mockProjects } from "./project.mock";
import { mapProjectDto, type ProjectDto } from "./project.mapper";
import type { Project, ProjectQueryParams } from "../types/project";
import { toEnglishLabel } from "@/lib/utils/public-labels";
import { canDeferBuildData } from "@/lib/config/build";

export async function getProjects(
  params: ProjectQueryParams & { strict?: boolean } = {},
): Promise<Project[]> {
  if (env.useMockApi) return mockProjects;
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
    return unwrapPage<ProjectDto>(response, params.page, params.limit).items.map(
      mapProjectDto,
    );
  } catch (error) {
    if (!params.strict && (canDeferBuildData(error) || process.env.NODE_ENV !== "production")) {
      console.warn("Backend /projects error, falling back to mockProjects:", error);
      return mockProjects;
    }
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
  if (env.useMockApi) {
    const categoryBySlug: Record<string, string> = {
      "lumi-hanoi": "high-rise",
      "the-matrix-one-giai-doan-2": "high-rise",
      elysian: "high-rise",
      "tt-avio": "low-rise",
      "greenfield-smart-factory": "industrial",
      "northgate-logistics-hub": "industrial",
      "central-park-residences": "infrastructure",
      "metro-depot-digital-coordination": "infrastructure",
    };
    const filtered = mockProjects.filter(
      (project) =>
        (!params.search ||
          `${project.title} ${project.description}`
            .toLowerCase()
            .includes(params.search.toLowerCase())) &&
        (!params.category ||
          categoryBySlug[project.slug] ===
            params.category.toLowerCase().replace(/\s+/g, "-")) &&
        (!params.location || project.location === params.location) &&
        (!params.year || project.year === params.year) &&
        (!params.status ||
          toEnglishLabel(project.status).toLowerCase() ===
            params.status.toLowerCase()),
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const safePage = Math.min(page, totalPages);
    return {
      items: filtered.slice((safePage - 1) * limit, safePage * limit),
      meta: { page: safePage, limit, total: filtered.length, totalPages },
    };
  }
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
      next: { revalidate: 300, tags: ["projects"] },
      signal: params.signal,
    });
    const result = unwrapPage<ProjectDto>(response, page, limit);
    return { ...result, items: result.items.map(mapProjectDto) };
  } catch (error) {
    if (canDeferBuildData(error) || process.env.NODE_ENV !== "production") {
      console.warn("Backend /projects list error, falling back to mockProjects:", error);
      const categoryBySlug: Record<string, string> = {
        "lumi-hanoi": "high-rise",
        "the-matrix-one-giai-doan-2": "high-rise",
        elysian: "high-rise",
        "tt-avio": "low-rise",
        "greenfield-smart-factory": "industrial",
        "northgate-logistics-hub": "industrial",
        "central-park-residences": "infrastructure",
        "metro-depot-digital-coordination": "infrastructure",
      };
      const filtered = mockProjects.filter(
        (project) =>
          (!params.search ||
            `${project.title} ${project.description}`
              .toLowerCase()
              .includes(params.search.toLowerCase())) &&
          (!params.category ||
            categoryBySlug[project.slug] ===
              params.category.toLowerCase().replace(/\s+/g, "-")) &&
          (!params.location || project.location === params.location) &&
          (!params.year || project.year === params.year) &&
          (!params.status ||
            toEnglishLabel(project.status).toLowerCase() ===
              params.status.toLowerCase()),
      );
      const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
      const safePage = Math.min(page, totalPages);
      return {
        items: filtered.slice((safePage - 1) * limit, safePage * limit),
        meta: { page: safePage, limit, total: filtered.length, totalPages },
      };
    }
    throw error;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (env.useMockApi)
    return mockProjects.find((project) => project.slug === slug) ?? null;
  try {
    const response = await apiClient.get<ApiResponse<ProjectDto> | ProjectDto>(
      API_ENDPOINTS.projects.detail(slug),
      { next: { revalidate: 300, tags: ["projects", `project:${slug}`] } },
    );
    return mapProjectDto(unwrapData(response));
  } catch (error) {
    if (isNotFoundError(error)) return null;
    if (canDeferBuildData(error) || process.env.NODE_ENV !== "production") {
      console.warn(`Backend /projects/${slug} error, falling back to mock project:`, error);
      return mockProjects.find((project) => project.slug === slug) ?? null;
    }
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
