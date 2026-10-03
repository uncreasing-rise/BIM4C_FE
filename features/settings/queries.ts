import { apiClient } from "@/lib/api/client";
import type { SiteSettingsData } from "./types";

interface SettingsResponse {
  data?: Partial<SiteSettingsData> | null;
}

/**
 * Returns null when the API is unreachable or the settings row was deleted.
 * Callers hide contact details instead of showing stale hard-coded values.
 */
export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  try {
    const response = await apiClient.get<SettingsResponse>("/settings/public", {
      next: { revalidate: 60, tags: ["settings"] },
    });
    const data = response?.data;
    if (!data) return null;
    return {
      email: data.email ?? "",
      phone: data.phone || undefined,
      address: data.address || undefined,
      metrics: Array.isArray(data.metrics) ? data.metrics : [],
      socialLinks:
        data.socialLinks && typeof data.socialLinks === "object"
          ? data.socialLinks
          : {},
      defaultSeoTitle: data.defaultSeoTitle ?? "",
      defaultSeoDescription: data.defaultSeoDescription ?? "",
      defaultOgImage: data.defaultOgImage || undefined,
    };
  } catch {
    return null;
  }
}
