import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { isNotFoundError } from "@/lib/api/errors";
import { withQueryParams } from "@/lib/api/query-params";
import type { ApiResponse } from "@/lib/api/types";
import { env } from "@/lib/config/env";
import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import {
  unwrapData,
  unwrapPage,
} from "@/features/shared/mappers/response.mapper";
import type { PageResult } from "@/features/shared/types/pagination";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import type { ContentQueryParams } from "@/features/shared/types/query";
import { blogEntries } from "@/mocks/content";
import type { ContentEntry } from "@/types/content";
import { canDeferBuildData } from "@/lib/config/build";

export async function getPosts(
  params: ContentQueryParams & { strict?: boolean } = {},
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
    return unwrapPage<ContentEntryDto>(
      response,
      params.page,
      params.limit,
    ).items.map(mapContentDto);
  } catch (error) {
    if (!params.strict && canDeferBuildData(error)) return [];
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

export async function getPostsPage(
  params: ContentQueryParams & { strict?: boolean } = {},
): Promise<PageResult<ContentEntry>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 5;
  if (env.useMockApi) {
    const filtered = blogEntries.filter(
      (post) =>
        (!params.search ||
          `${post.title} ${post.description}`
            .toLowerCase()
            .includes(params.search.toLowerCase())) &&
        (!params.category || post.eyebrow === params.category),
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const safePage = Math.min(page, totalPages);
    return {
      items: filtered.slice((safePage - 1) * limit, safePage * limit),
      meta: { page: safePage, limit, total: filtered.length, totalPages },
    };
  }
  const endpoint = withQueryParams(API_ENDPOINTS.posts.list, {
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
      signal: params.signal,
      next: { revalidate: 300, tags: ["posts"] },
    });
    const result = unwrapPage<ContentEntryDto>(response, page, limit);
    return { ...result, items: result.items.map(mapContentDto) };
  } catch (error) {
    if (!params.strict && canDeferBuildData(error))
      return { items: [], meta: { page, limit, total: 0, totalPages: 1 } };
    throw error;
  }
}

export async function getAllPosts(
  options: { strict?: boolean } = {},
): Promise<ContentEntry[]> {
  const results: ContentEntry[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await getPosts({ page, limit: 100, strict: options.strict });
    results.push(...batch);
    if (batch.length < 100) return results;
  }
}
