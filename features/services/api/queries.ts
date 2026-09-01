import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { isNotFoundError } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import { env } from "@/lib/config/env";
import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import { unwrapData } from "@/features/shared/mappers/response.mapper";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import { serviceEntries } from "@/mocks/content";
import type { ContentEntry } from "@/types/content";
import { canDeferBuildData } from "@/lib/config/build";

export async function getServices(): Promise<ContentEntry[]> {
  if (env.useMockApi) return serviceEntries;
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto[]> | ContentEntryDto[]
    >(API_ENDPOINTS.services.list, {
      next: { revalidate: 600, tags: ["services"] },
    });
    return unwrapData(response).map(mapContentDto);
  } catch (error) {
    if (canDeferBuildData(error)) return [];
    throw error;
  }
}

export async function getServiceBySlug(
  slug: string,
): Promise<ContentEntry | null> {
  if (env.useMockApi)
    return serviceEntries.find((service) => service.slug === slug) ?? null;
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto> | ContentEntryDto
    >(API_ENDPOINTS.services.detail(slug), {
      next: { revalidate: 600, tags: ["services", `service:${slug}`] },
    });
    return mapContentDto(unwrapData(response));
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}
