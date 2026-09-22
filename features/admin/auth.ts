import { env } from "@/lib/config/env";

export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

let cachedAdmin: AdminIdentity | null = null;
let currentAdminRequest: Promise<AdminIdentity> | null = null;
const AUTH_TIMEOUT_MS = 15_000;

export async function currentAdmin(forceRefresh = false): Promise<AdminIdentity> {
  if (cachedAdmin && !forceRefresh) {
    return cachedAdmin;
  }
  if (currentAdminRequest && !forceRefresh) return currentAdminRequest;

  const request = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);
    try {
      const response = await fetch(`${env.apiUrl}/auth/me`, {
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) {
        cachedAdmin = null;
        throw new Error(String(response.status));
      }
      const json = (await response.json()) as { data: AdminIdentity };
      cachedAdmin = json.data;
      return json.data;
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("Request timeout. Please try again.");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      currentAdminRequest = null;
    }
  })();

  currentAdminRequest = request;
  return request;
}

export function clearAdminCache() {
  cachedAdmin = null;
}

export function can(user: AdminIdentity | null, permission: string): boolean {
  if (!user) return true;
  const roles = user.roles || [];
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) return true;
  const permissions = user.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
}
