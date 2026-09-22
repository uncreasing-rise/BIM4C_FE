import type {
  AdminCourseContent,
  CourseFilterQuery,
  PageResult,
} from "../types";
import { serializeCoursePayload } from "../serializers/courses.serializer";
import { adminRequest, buildQueryString } from "./http-client";

export const coursesApi = {
  /** Danh sách khóa học có phân trang và bộ lọc */
  list: (query: CourseFilterQuery = {}, signal?: AbortSignal) => {
    const qs = buildQueryString(query);
    return adminRequest<PageResult<AdminCourseContent>>(`courses${qs ? `?${qs}` : ""}`, {
      signal,
    });
  },

  /** Chi tiết khóa học */
  getById: (id: string, signal?: AbortSignal) =>
    adminRequest<{ data: AdminCourseContent }>(`courses/${id}`, { signal }),

  /** Tạo mới khóa học */
  create: (payload: Partial<AdminCourseContent>) =>
    adminRequest<{ data: AdminCourseContent }>("courses", {
      method: "POST",
      body: JSON.stringify(serializeCoursePayload(payload)),
    }),

  /** Cập nhật khóa học */
  update: (id: string, payload: Partial<AdminCourseContent>) =>
    adminRequest<{ data: AdminCourseContent }>(`courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(serializeCoursePayload(payload)),
    }),

  /** Xóa khóa học */
  remove: (id: string) =>
    adminRequest<void>(`courses/${id}`, { method: "DELETE" }),

  /** Thao tác hàng loạt */
  bulk: (ids: string[], action: "publish" | "archive" | "delete") =>
    adminRequest<{ success: true; affected: number }>("courses/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action }),
    }),

  /** Modules giáo trình khóa học */
  addSection: (
    courseId: string,
    body: { title: string; description: string; sortOrder: number },
  ) =>
    adminRequest<{ data: { id: string } }>(`courses/${courseId}/sections`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateSection: (
    courseId: string,
    id: string,
    body: { title?: string; description?: string; sortOrder?: number },
  ) =>
    adminRequest<{ data: { id: string } }>(`courses/${courseId}/sections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  removeSection: (courseId: string, id: string) =>
    adminRequest<void>(`courses/${courseId}/sections/${id}`, {
      method: "DELETE",
    }),
};
