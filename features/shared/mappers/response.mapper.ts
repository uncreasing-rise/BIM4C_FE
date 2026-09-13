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
  if (typeof response === "object" && response !== null) {
    const obj = response as Record<string, unknown>;

    // Case 1: Standard { data: T[], meta: PageMeta }
    if ("data" in obj && "meta" in obj && Array.isArray(obj.data) && typeof obj.meta === "object" && obj.meta !== null) {
      const meta = obj.meta as Partial<PageResult<T>["meta"]>;
      const limit = Number(meta.limit ?? fallbackLimit);
      const total = Number(meta.total ?? obj.data.length);
      const page = Number(meta.page ?? fallbackPage);
      const totalPages = Number(meta.totalPages ?? Math.max(1, Math.ceil(total / limit)));
      return {
        items: obj.data as T[],
        meta: { page, limit, total, totalPages },
      };
    }

    // Case 2: Standard { items: T[], meta: PageMeta }
    if ("items" in obj && "meta" in obj && Array.isArray(obj.items) && typeof obj.meta === "object" && obj.meta !== null) {
      const meta = obj.meta as Partial<PageResult<T>["meta"]>;
      const limit = Number(meta.limit ?? fallbackLimit);
      const total = Number(meta.total ?? obj.items.length);
      const page = Number(meta.page ?? fallbackPage);
      const totalPages = Number(meta.totalPages ?? Math.max(1, Math.ceil(total / limit)));
      return {
        items: obj.items as T[],
        meta: { page, limit, total, totalPages },
      };
    }

    // Case 3: Flat pagination { data: T[], total: number, page?: number, limit?: number }
    if ("data" in obj && Array.isArray(obj.data) && "total" in obj) {
      const total = Number(obj.total ?? obj.data.length);
      const limit = Number(obj.limit ?? fallbackLimit);
      const page = Number(obj.page ?? fallbackPage);
      return {
        items: obj.data as T[],
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    }

    // Case 4: Flat pagination { items: T[], total: number, page?: number, limit?: number }
    if ("items" in obj && Array.isArray(obj.items) && "total" in obj) {
      const total = Number(obj.total ?? obj.items.length);
      const limit = Number(obj.limit ?? fallbackLimit);
      const page = Number(obj.page ?? fallbackPage);
      return {
        items: obj.items as T[],
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    }
  }

  // Fallback: unwrap array directly
  const items = unwrapData(response as ApiResponse<T[]> | T[]);
  const list = Array.isArray(items) ? items : [];
  return {
    items: list,
    meta: {
      page: fallbackPage,
      limit: fallbackLimit,
      total: list.length,
      totalPages: Math.max(1, Math.ceil(list.length / fallbackLimit)),
    },
  };
}
