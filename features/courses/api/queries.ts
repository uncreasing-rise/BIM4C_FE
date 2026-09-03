import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { isNotFoundError } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import { env } from "@/lib/config/env";
import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import { unwrapData } from "@/features/shared/mappers/response.mapper";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import { courseEntries } from "@/mocks/content";
import type { ContentEntry } from "@/types/content";
import { canDeferBuildData } from "@/lib/config/build";

export async function getCourses(options: { strict?: boolean } = {}): Promise<ContentEntry[]> {
  if (env.useMockApi) return courseEntries;
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto[]> | ContentEntryDto[]
    >(API_ENDPOINTS.courses.list, {
      next: { revalidate: 600, tags: ["courses"] },
    });
    return unwrapData(response).map(mapContentDto);
  } catch (error) {
    if (!options.strict && canDeferBuildData(error)) return [];
    throw error;
  }
}

export async function getCourseBySlug(
  slug: string,
): Promise<ContentEntry | null> {
  if (env.useMockApi)
    return courseEntries.find((course) => course.slug === slug) ?? null;
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto> | ContentEntryDto
    >(API_ENDPOINTS.courses.detail(slug), {
      next: { revalidate: 600, tags: ["courses", `course:${slug}`] },
    });
    return mapContentDto(unwrapData(response));
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}
