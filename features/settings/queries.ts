import { apiClient } from "@/lib/api/client";
import { canDeferBuildData } from "@/lib/config/build";
import { DEFAULT_METRICS, type SiteSettingsData } from "./types";

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  companyName: "BIM4C",
  email: "info@bim4c.vn",
  phone: "+84 28 1234 5678",
  address: "Toà nhà BIM4C, TP. Hồ Chí Minh, Việt Nam",
  brochureUrl: "https://www.bim4c.vn/brochure.pdf",
  metrics: DEFAULT_METRICS,
  socialLinks: {
    facebook: "https://facebook.com/bim4c",
    linkedin: "https://linkedin.com/company/bim4c",
    youtube: "https://youtube.com/@bim4c",
  },
  defaultSeoTitle: "BIM4C - Tiên phong Chuyển đổi số Xây dựng",
  defaultSeoDescription: "Giải pháp BIM, Chuyển đổi số Xây dựng & Tư vấn 3D-7D toàn diện.",
  defaultOgImage: "/images/hero-1.webp",
};

interface SettingsResponse {
  data?: Partial<SiteSettingsData>;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const response = await apiClient.get<SettingsResponse | SiteSettingsData>("/settings/public", {
      next: { revalidate: 60, tags: ["settings"] },
    });
    
    const data: Partial<SiteSettingsData> = (response && "data" in response && response.data)
      ? response.data
      : (response as Partial<SiteSettingsData>) || {};

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
      metrics: data?.metrics && Array.isArray(data.metrics) && data.metrics.length > 0 ? data.metrics : DEFAULT_METRICS,
      socialLinks: {
        ...DEFAULT_SITE_SETTINGS.socialLinks,
        ...(data?.socialLinks || {}),
      },
    };
  } catch (error) {
    if (canDeferBuildData(error)) {
      return DEFAULT_SITE_SETTINGS;
    }
    return DEFAULT_SITE_SETTINGS;
  }
}
