export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

let cachedAdmin: AdminIdentity | null = null;

export async function currentAdmin(forceRefresh = false): Promise<AdminIdentity> {
  if (cachedAdmin && !forceRefresh) {
    return cachedAdmin;
  }
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) {
    cachedAdmin = null;
    throw new Error(String(response.status));
  }
  const json = (await response.json()) as { data: AdminIdentity };
  cachedAdmin = json.data;
  return json.data;
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
