export interface DomainStats { total: number; byStatus: Record<string, number> }
export interface DashboardStats { projects: DomainStats; services: DomainStats; courses: DomainStats; posts: DomainStats; contacts: { status: string; _count: number }[]; registrations: { status: string; _count: number }[]; newsletter: { isActive: boolean; _count: number }[] }
export interface RecentContent { id: string; type: "project" | "service" | "course" | "post"; title: string; slug: string; image: string; status: string; updatedAt: string }
async function get<T>(path: string): Promise<T> { const response = await fetch(`/api/admin/dashboard/${path}`, { cache: "no-store" }); if (!response.ok) throw new Error("Không thể tải dashboard"); return response.json() as Promise<T>; }
export const getDashboard = async () => Promise.all([get<{ data: DashboardStats }>("stats"), get<{ data: RecentContent[] }>("recent-activity")]);
