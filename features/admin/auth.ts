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
const ACCESS_TOKEN_KEY = "bim4c_admin_access_token";

export function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token: string): void {
  if (typeof window !== "undefined") window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAdminAccessToken(): void {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

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
        ...(getAdminAccessToken()
          ? { headers: { Accept: "application/json", Authorization: `Bearer ${getAdminAccessToken()}` } }
          : {}),
        signal: controller.signal,
      });
      if (!response.ok) {
        cachedAdmin = null;
        if (response.status === 401) clearAdminAccessToken();
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
  // Fail closed: an unknown identity is granted nothing.
  if (!user) return false;
  const roles = user.roles || [];
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) return true;
  const permissions = user.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
}
