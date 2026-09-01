import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { isNotFoundError } from "@/lib/api/errors";
import { withQueryParams } from "@/lib/api/query-params";
import type { ApiResponse } from "@/lib/api/types";
import { env } from "@/lib/config/env";
import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import { unwrapData } from "@/features/shared/mappers/response.mapper";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import type { ContentQueryParams } from "@/features/shared/types/query";
import { blogEntries } from "@/mocks/content";
import type { ContentEntry } from "@/types/content";
import { canDeferBuildData } from "@/lib/config/build";

export async function getPosts(
  params: ContentQueryParams = {},
): Promise<ContentEntry[]> {
  if (env.useMockApi) return blogEntries;
  const endpoint = withQueryParams(API_ENDPOINTS.posts.list, {
    page: params.page,
    limit: params.limit,
    search: params.search,
    category: params.category,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto[]> | ContentEntryDto[]
    >(endpoint, {
      signal: params.signal,
      next: { revalidate: 300, tags: ["posts"] },
    });
    return unwrapData(response).map(mapContentDto);
  } catch (error) {
    if (canDeferBuildData(error)) return [];
    throw error;
  }
}

export async function getPostBySlug(
  slug: string,
): Promise<ContentEntry | null> {
  if (env.useMockApi)
    return blogEntries.find((post) => post.slug === slug) ?? null;
  try {
    const response = await apiClient.get<
      ApiResponse<ContentEntryDto> | ContentEntryDto
    >(API_ENDPOINTS.posts.detail(slug), {
      next: { revalidate: 300, tags: ["posts", `post:${slug}`] },
    });
    return mapContentDto(unwrapData(response));
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}
