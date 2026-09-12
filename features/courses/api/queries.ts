import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { withQueryParams } from "@/lib/api/query-params";
import { isNotFoundError } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import { env } from "@/lib/config/env";
import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import { unwrapData } from "@/features/shared/mappers/response.mapper";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import { courseEntries } from "@/mocks/content";
import type { ContentEntry } from "@/types/content";
import { canDeferBuildData } from "@/lib/config/build";
import { unwrapPage } from "@/features/shared/mappers/response.mapper";
import type { PageResult } from "@/features/shared/types/pagination";
import type { ContentQueryParams } from "@/features/shared/types/query";

export async function getCourses(
  options: { strict?: boolean; limit?: number } = {},
): Promise<ContentEntry[]> {
  if (env.useMockApi) return courseEntries;
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto[]> | ContentEntryDto[]
    >(withQueryParams(API_ENDPOINTS.courses.list, { limit: options.limit }), {
      next: { revalidate: 600, tags: ["courses"] },
    });
    return unwrapPage<ContentEntryDto>(response).items.map(mapContentDto);
  } catch (error) {
    if (!options.strict && (canDeferBuildData(error) || process.env.NODE_ENV !== "production")) {
      console.warn("Backend /courses error, falling back to courseEntries:", error);
      return courseEntries;
    }
    throw error;
  }
}

export async function getCoursesPage(
  params: ContentQueryParams = {},
): Promise<PageResult<ContentEntry>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 6;
  if (env.useMockApi) {
    const filtered = courseEntries.filter(
      (item) =>
        (!params.search ||
          `${item.title} ${item.description}`
            .toLowerCase()
            .includes(params.search.toLowerCase())) &&
        (!params.category ||
          (item.category || item.eyebrow) === params.category),
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const safePage = Math.min(page, totalPages);
    return {
      items: filtered.slice((safePage - 1) * limit, safePage * limit),
      meta: { page: safePage, limit, total: filtered.length, totalPages },
    };
  }
  const endpoint = withQueryParams(API_ENDPOINTS.courses.list, {
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
      next: { revalidate: 600, tags: ["courses"] },
      signal: params.signal,
    });
    const result = unwrapPage<ContentEntryDto>(response, page, limit);
    return { ...result, items: result.items.map(mapContentDto) };
  } catch (error) {
    if (canDeferBuildData(error) || process.env.NODE_ENV !== "production") {
      console.warn("Backend /courses list error, falling back to courseEntries:", error);
      const totalPages = Math.max(1, Math.ceil(courseEntries.length / limit));
      const safePage = Math.min(page, totalPages);
      return {
        items: courseEntries.slice((safePage - 1) * limit, safePage * limit),
        meta: { page: safePage, limit, total: courseEntries.length, totalPages },
      };
    }
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
    if (canDeferBuildData(error) || process.env.NODE_ENV !== "production") {
      console.warn(`Backend /courses/${slug} error, falling back to mock course:`, error);
      return courseEntries.find((course) => course.slug === slug) ?? null;
    }
    throw error;
  }
}

