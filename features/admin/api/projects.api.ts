import type {
  AdminCategory,
  AdminProjectContent,
  PageResult,
  ProjectFilterQuery,
} from "../types";
import { serializeProjectPayload } from "../serializers/projects.serializer";
import { adminRequest, buildQueryString } from "./http-client";

let projectCategoriesCache: { data: { data: AdminCategory[] }; expiresAt: number } | null = null;
let projectCategoriesRequest: Promise<{ data: AdminCategory[] }> | null = null;

export const projectsApi = {
  /** Danh sách dự án có phân trang và bộ lọc */
  list: (query: ProjectFilterQuery = {}, signal?: AbortSignal) => {
    const qs = buildQueryString(query);
    return adminRequest<PageResult<AdminProjectContent>>(`projects${qs ? `?${qs}` : ""}`, {
      signal,
    });
  },

  /** Chi tiết dự án */
  getById: (id: string, signal?: AbortSignal) =>
    adminRequest<{ data: AdminProjectContent }>(`projects/${id}`, { signal }),

  /** Tạo mới dự án */
  create: (payload: Partial<AdminProjectContent>) =>
    adminRequest<{ data: AdminProjectContent }>("projects", {
      method: "POST",
      body: JSON.stringify(serializeProjectPayload(payload)),
    }),

  /** Cập nhật dự án */
  update: (id: string, payload: Partial<AdminProjectContent>) =>
    adminRequest<{ data: AdminProjectContent }>(`projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(serializeProjectPayload(payload)),
    }),

  /** Xóa dự án */
  remove: (id: string) =>
    adminRequest<void>(`projects/${id}`, { method: "DELETE" }),

  /** Thao tác hàng loạt */
  bulk: (ids: string[], action: "publish" | "archive" | "delete") =>
    adminRequest<{ success: true; affected: number }>("projects/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action }),
    }),

  /** Danh mục dự án */
  categories: (signal?: AbortSignal) => {
    if (signal?.aborted) {
      return Promise.reject(new DOMException("The request was aborted.", "AbortError"));
    }
    if (projectCategoriesCache && projectCategoriesCache.expiresAt > Date.now()) {
      return Promise.resolve(projectCategoriesCache.data);
    }
    if (!projectCategoriesRequest) {
      projectCategoriesRequest = adminRequest<{ data: AdminCategory[] }>("project-categories")
        .then((result) => {
          projectCategoriesCache = { data: result, expiresAt: Date.now() + 15_000 };
          return result;
        })
        .finally(() => {
          projectCategoriesRequest = null;
        });
    }
    return projectCategoriesRequest;
  },

  createCategory: (body: { name: string; slug: string }) =>
    adminRequest<{ data: AdminCategory }>("project-categories", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((result) => {
      projectCategoriesCache = null;
      return result;
    }),

  updateCategory: (id: string, body: { name: string; slug: string }) =>
    adminRequest<{ data: AdminCategory }>(`project-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((result) => {
      projectCategoriesCache = null;
      return result;
    }),

  deleteCategory: (id: string) =>
    adminRequest<void>(`project-categories/${id}`, { method: "DELETE" }).then((result) => {
      projectCategoriesCache = null;
      return result;
    }),

  /** Album ảnh dự án */
  addImage: (
    projectId: string,
    body: { url: string; alt: string; caption?: string; sortOrder: number },
  ) =>
    adminRequest<{ data: { id: string } }>(`projects/${projectId}/images`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateImage: (
    projectId: string,
    id: string,
    body: { alt?: string; caption?: string | null; sortOrder?: number },
  ) =>
    adminRequest<{ data: { id: string } }>(`projects/${projectId}/images/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteImage: (projectId: string, id: string) =>
    adminRequest<void>(`projects/${projectId}/images/${id}`, {
      method: "DELETE",
    }),
};
