import type {
  AdminCategory,
  AdminContent,
  AdminContentType,
  PageResult,
} from "../types";
import { postsApi } from "./posts.api";
import { projectsApi } from "./projects.api";
import { coursesApi } from "./courses.api";
import { servicesApi } from "./services.api";

export * from "./http-client";
export * from "./posts.api";
export * from "./projects.api";
export * from "./courses.api";
export * from "./services.api";
export * from "./records.api";
export * from "./media.api";
export * from "./dashboard.api";
export * from "./revalidate.api";

/**
 * Unified Admin Content API Router
 * Dispatches to domain-specific API clients based on content type
 */
export const adminContentApi = {
  list: (
    type: AdminContentType,
    query: Record<string, string | number | undefined>,
    signal?: AbortSignal,
  ): Promise<PageResult<AdminContent>> => {
    switch (type) {
      case "Dự án":
        return projectsApi.list(query, signal) as Promise<PageResult<AdminContent>>;
      case "Khóa học":
        return coursesApi.list(query, signal) as Promise<PageResult<AdminContent>>;
      case "Dịch vụ":
        return servicesApi.list(query, signal) as Promise<PageResult<AdminContent>>;
      case "Tin tức":
      case "Chuyên môn":
      default:
        return postsApi.list(query, signal) as Promise<PageResult<AdminContent>>;
    }
  },

  getById: (type: AdminContentType, id: string, signal?: AbortSignal) => {
    switch (type) {
      case "Dự án":
        return projectsApi.getById(id, signal) as Promise<{ data: AdminContent }>;
      case "Khóa học":
        return coursesApi.getById(id, signal) as Promise<{ data: AdminContent }>;
      case "Dịch vụ":
        return servicesApi.getById(id, signal) as Promise<{ data: AdminContent }>;
      case "Tin tức":
      case "Chuyên môn":
      default:
        return postsApi.getById(id, signal) as Promise<{ data: AdminContent }>;
    }
  },

  create: (type: AdminContentType, body: Partial<AdminContent>) => {
    switch (type) {
      case "Dự án":
        return projectsApi.create(body as unknown as Parameters<typeof projectsApi.create>[0]) as Promise<{ data: AdminContent }>;
      case "Khóa học":
        return coursesApi.create(body as unknown as Parameters<typeof coursesApi.create>[0]) as Promise<{ data: AdminContent }>;
      case "Dịch vụ":
        return servicesApi.create(body as unknown as Parameters<typeof servicesApi.create>[0]) as Promise<{ data: AdminContent }>;
      case "Tin tức":
      case "Chuyên môn":
      default:
        return postsApi.create(body as unknown as Parameters<typeof postsApi.create>[0]) as Promise<{ data: AdminContent }>;
    }
  },

  update: (type: AdminContentType, id: string, body: Partial<AdminContent>) => {
    switch (type) {
      case "Dự án":
        return projectsApi.update(id, body as unknown as Parameters<typeof projectsApi.update>[1]) as Promise<{ data: AdminContent }>;
      case "Khóa học":
        return coursesApi.update(id, body as unknown as Parameters<typeof coursesApi.update>[1]) as Promise<{ data: AdminContent }>;
      case "Dịch vụ":
        return servicesApi.update(id, body as unknown as Parameters<typeof servicesApi.update>[1]) as Promise<{ data: AdminContent }>;
      case "Tin tức":
      case "Chuyên môn":
      default:
        return postsApi.update(id, body as unknown as Parameters<typeof postsApi.update>[1]) as Promise<{ data: AdminContent }>;
    }
  },

  remove: (type: AdminContentType, id: string) => {
    switch (type) {
      case "Dự án":
        return projectsApi.remove(id);
      case "Khóa học":
        return coursesApi.remove(id);
      case "Dịch vụ":
        return servicesApi.remove(id);
      case "Tin tức":
      case "Chuyên môn":
      default:
        return postsApi.remove(id);
    }
  },

  bulk: (
    type: AdminContentType,
    ids: string[],
    action: "publish" | "archive" | "delete",
  ) => {
    switch (type) {
      case "Dự án":
        return projectsApi.bulk(ids, action);
      case "Khóa học":
        return coursesApi.bulk(ids, action);
      case "Dịch vụ":
        return servicesApi.bulk(ids, action);
      case "Tin tức":
      case "Chuyên môn":
      default:
        return postsApi.bulk(ids, action);
    }
  },

  categories: (type: AdminContentType, signal?: AbortSignal) => {
    if (type === "Dự án") {
      return projectsApi.categories(signal);
    }
    if (type === "Tin tức" || type === "Chuyên môn") {
      return postsApi.categories(signal);
    }
    return Promise.resolve({ data: [] as AdminCategory[] });
  },

  createCategory: (
    type: AdminContentType,
    body: { name: string; slug: string },
  ) => {
    if (type === "Dự án") {
      return projectsApi.createCategory(body);
    }
    return postsApi.createCategory(body);
  },

  updateCategory: (
    type: AdminContentType,
    id: string,
    body: { name: string; slug: string },
  ) => {
    if (type === "Dự án") {
      return projectsApi.updateCategory(id, body);
    }
    return postsApi.updateCategory(id, body);
  },

  deleteCategory: (type: AdminContentType, id: string) => {
    if (type === "Dự án") {
      return projectsApi.deleteCategory(id);
    }
    return postsApi.deleteCategory(id);
  },

  // Project Gallery helpers
  addProjectImage: (
    projectId: string,
    body: { url: string; alt: string; caption?: string; sortOrder: number },
  ) => projectsApi.addImage(projectId, body),

  deleteProjectImage: (projectId: string, id: string) =>
    projectsApi.deleteImage(projectId, id),

  updateProjectImage: (
    projectId: string,
    id: string,
    body: { alt?: string; caption?: string | null; sortOrder?: number },
  ) => projectsApi.updateImage(projectId, id, body),

  // Course Curriculum helpers
  addCourseSection: (
    courseId: string,
    body: { title: string; description: string; sortOrder: number },
  ) => coursesApi.addSection(courseId, body),

  deleteCourseSection: (courseId: string, id: string) =>
    coursesApi.removeSection(courseId, id),

  updateCourseSection: (
    courseId: string,
    id: string,
    body: { title?: string; description?: string; sortOrder?: number },
  ) => coursesApi.updateSection(courseId, id, body),
};
