import type {
  AdminCategory,
  AdminPostContent,
  PageResult,
  PostFilterQuery,
} from "../types";
import { serializePostPayload } from "../serializers/posts.serializer";
import { adminRequest, buildQueryString } from "./http-client";

export const postsApi = {
  /** Danh sách bài viết tin tức / chuyên môn có phân trang và bộ lọc */
  list: (query: PostFilterQuery = {}, signal?: AbortSignal) => {
    const qs = buildQueryString(query);
    return adminRequest<PageResult<AdminPostContent>>(`posts${qs ? `?${qs}` : ""}`, {
      signal,
    });
  },

  /** Chi tiết bài viết */
  getById: (id: string, signal?: AbortSignal) =>
    adminRequest<{ data: AdminPostContent }>(`posts/${id}`, { signal }),

  /** Tạo mới bài viết */
  create: (payload: Partial<AdminPostContent>) =>
    adminRequest<{ data: AdminPostContent }>("posts", {
      method: "POST",
      body: JSON.stringify(serializePostPayload(payload)),
    }),

  /** Cập nhật bài viết */
  update: (id: string, payload: Partial<AdminPostContent>) =>
    adminRequest<{ data: AdminPostContent }>(`posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(serializePostPayload(payload)),
    }),

  /** Xóa bài viết */
  remove: (id: string) =>
    adminRequest<void>(`posts/${id}`, { method: "DELETE" }),

  /** Thao tác hàng loạt (xuất bản, lưu trữ, xóa) */
  bulk: (ids: string[], action: "publish" | "archive" | "delete") =>
    adminRequest<{ success: true; affected: number }>("posts/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action }),
    }),

  /** Danh sách danh mục bài viết */
  categories: (signal?: AbortSignal) =>
    adminRequest<{ data: AdminCategory[] }>("post-categories", { signal }),

  /** Tạo mới danh mục bài viết */
  createCategory: (body: { name: string; slug: string }) =>
    adminRequest<{ data: AdminCategory }>("post-categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Cập nhật danh mục bài viết */
  updateCategory: (id: string, body: { name: string; slug: string }) =>
    adminRequest<{ data: AdminCategory }>(`post-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  /** Xóa danh mục bài viết */
  deleteCategory: (id: string) =>
    adminRequest<void>(`post-categories/${id}`, { method: "DELETE" }),
};
