import { getAdminAccessToken } from "@/features/admin/auth";

/** Asks the frontend to drop cached public pages; the route verifies the admin session. */
export async function revalidateCmsCache(tags?: string[]): Promise<boolean> {
  const token = getAdminAccessToken();
  try {
    const res = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ tags }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
