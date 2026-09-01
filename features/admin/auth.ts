export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}
export async function currentAdmin(): Promise<AdminIdentity> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) throw new Error(String(response.status));
  return ((await response.json()) as { data: AdminIdentity }).data;
}
export function can(user: AdminIdentity | null, permission: string) {
  return Boolean(
    user &&
    (user.permissions.includes("*") || user.permissions.includes(permission)),
  );
}
