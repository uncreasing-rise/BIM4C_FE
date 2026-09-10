import type { ApiResponse } from "@/lib/api/types";
import type { PageResult } from "@/features/shared/types/pagination";

export function unwrapData<T>(response: ApiResponse<T> | T): T {
  return typeof response === "object" && response !== null && "data" in response
    ? (response as ApiResponse<T>).data
    : (response as T);
}

export function unwrapPage<T>(
  response: unknown,
  fallbackPage = 1,
  fallbackLimit = 20,
): PageResult<T> {
  if (
    typeof response === "object" &&
    response !== null &&
    "meta" in response &&
    "data" in response
  ) {
    const value = response as { data: T[]; meta: PageResult<T>["meta"] };
    return { items: value.data, meta: value.meta };
  }
  const items = unwrapData(response as ApiResponse<T[]> | T[]);
  return {
    items,
    meta: {
      page: fallbackPage,
      limit: fallbackLimit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / fallbackLimit)),
    },
  };
}
