import { adminRequest } from "./http-client";

export interface DomainStats {
  total: number;
  byStatus: Record<string, number>;
}

export interface DashboardStats {
  projects: DomainStats;
  services: DomainStats;
  courses: DomainStats;
  posts: DomainStats;
  contacts: { status: string; _count: number }[];
  registrations: { status: string; _count: number }[];
  newsletter: { isActive: boolean; _count: number }[];
}

export interface RecentContent {
  id: string;
  type: "project" | "service" | "course" | "post";
  title: string;
  slug: string;
  image: string;
  status: string;
  updatedAt: string;
}

export const dashboardApi = {
  getStats: (signal?: AbortSignal) =>
    adminRequest<{ data: DashboardStats }>("dashboard/stats", { signal }),

  getRecentActivity: (signal?: AbortSignal) =>
    adminRequest<{ data: RecentContent[] }>("dashboard/recent-activity", {
      signal,
    }),

  getAll: async () => {
    return Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getRecentActivity(),
    ]);
  },
};

/** Backward-compatible export */
export const getDashboard = dashboardApi.getAll;
