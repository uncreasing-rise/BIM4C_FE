import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import {
  unwrapData,
  unwrapPage,
} from "@/features/shared/mappers/response.mapper";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import type { PageResult } from "@/features/shared/types/pagination";
import type { ContentQueryParams } from "@/features/shared/types/query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { isNotFoundError } from "@/lib/api/errors";
import { withQueryParams } from "@/lib/api/query-params";
import type { ApiResponse } from "@/lib/api/types";
import { canDeferBuildData } from "@/lib/config/build";
import type { ContentEntry } from "@/types/content";

export async function getServices(
  options: { strict?: boolean; limit?: number } = {},
): Promise<ContentEntry[]> {
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto[]> | ContentEntryDto[]
    >(withQueryParams(API_ENDPOINTS.services.list, { limit: options.limit }), {
      next: { revalidate: 300, tags: ["services"] },
    });
    return unwrapPage<ContentEntryDto>(response).items.map(mapContentDto);
  } catch (error) {
    if (!options.strict && canDeferBuildData(error)) return [];
    throw error;
  }
}

export async function getServicesPage(
  params: ContentQueryParams = {},
): Promise<PageResult<ContentEntry>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 6;
  const endpoint = withQueryParams(API_ENDPOINTS.services.list, {
    page,
    limit,
    search: params.search,
    category: params.category,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto[]> | ContentEntryDto[]
    >(endpoint, {
      next: { revalidate: 300, tags: ["services"] },
      signal: params.signal,
    });
    const result = unwrapPage<ContentEntryDto>(response, page, limit);
    return { ...result, items: result.items.map(mapContentDto) };
  } catch (error) {
    if (canDeferBuildData(error))
      return { items: [], meta: { page, limit, total: 0, totalPages: 1 } };
    throw error;
  }
}

export async function getServiceBySlug(
  slug: string,
): Promise<ContentEntry | null> {
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto> | ContentEntryDto
    >(API_ENDPOINTS.services.detail(slug), {
      next: { revalidate: 300, tags: ["services", `service-${slug}`] },
    });
    return mapContentDto(unwrapData(response));
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}

