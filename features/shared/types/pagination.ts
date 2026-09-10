export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageResult<T> {
  items: T[];
  meta: PageMeta;
}

export function paginateMock<T>(
  items: T[],
  page = 1,
  limit = 20,
): PageResult<T> {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}
