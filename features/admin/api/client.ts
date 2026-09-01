import type {
  AdminCategory,
  AdminContent,
  AdminContentType,
  PageResult,
} from "../types";

const domain: Record<AdminContentType, string> = {
  "Dự án": "projects",
  "Tin tức": "posts",
  "Khóa học": "courses",
  "Dịch vụ": "services",
};
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `Admin API lỗi ${response.status}`);
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}
const queryString = (input: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(input).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  return q.toString();
};
export const adminContentApi = {
  list: (
    type: AdminContentType,
    query: Record<string, string | number | undefined>,
  ) =>
    request<PageResult<AdminContent>>(`${domain[type]}?${queryString(query)}`),
  create: (type: AdminContentType, body: unknown) =>
    request<{ data: AdminContent }>(domain[type], {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (type: AdminContentType, id: string, body: unknown) =>
    request<{ data: AdminContent }>(`${domain[type]}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (type: AdminContentType, id: string) =>
    request<void>(`${domain[type]}/${id}`, { method: "DELETE" }),
  bulk: (
    type: AdminContentType,
    ids: string[],
    action: "publish" | "archive" | "delete",
  ) =>
    request<{ success: true; affected: number }>(`${domain[type]}/bulk`, {
      method: "POST",
      body: JSON.stringify({ ids, action }),
    }),
  categories: (type: AdminContentType) =>
    type === "Dự án" || type === "Tin tức"
      ? request<{ data: AdminCategory[] }>(
          type === "Dự án" ? "project-categories" : "post-categories",
        )
      : Promise.resolve({ data: [] }),
  createCategory: (
    type: AdminContentType,
    body: { name: string; slug: string },
  ) =>
    request<{ data: AdminCategory }>(
      type === "Dự án" ? "project-categories" : "post-categories",
      { method: "POST", body: JSON.stringify(body) },
    ),
  updateCategory: (
    type: AdminContentType,
    id: string,
    body: { name: string; slug: string },
  ) =>
    request<{ data: AdminCategory }>(
      `${type === "Dự án" ? "project-categories" : "post-categories"}/${id}`,
      { method: "PATCH", body: JSON.stringify(body) },
    ),
  deleteCategory: (type: AdminContentType, id: string) =>
    request<void>(
      `${type === "Dự án" ? "project-categories" : "post-categories"}/${id}`,
      { method: "DELETE" },
    ),
  addProjectImage: (
    projectId: string,
    body: { url: string; alt: string; caption?: string; sortOrder: number },
  ) =>
    request<{ data: { id: string } }>(`projects/${projectId}/images`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteProjectImage: (projectId: string, id: string) =>
    request<void>(`projects/${projectId}/images/${id}`, { method: "DELETE" }),
  addCourseSection: (
    courseId: string,
    body: { title: string; description: string; sortOrder: number },
  ) =>
    request<{ data: { id: string } }>(`courses/${courseId}/sections`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteCourseSection: (courseId: string, id: string) =>
    request<void>(`courses/${courseId}/sections/${id}`, { method: "DELETE" }),
};
