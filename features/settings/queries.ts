import { apiClient } from "@/lib/api/client";
import { canDeferBuildData } from "@/lib/config/build";
import { DEFAULT_METRICS, type SiteSettingsData } from "./types";

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  companyName: "Công ty Cổ phần Công nghệ và Xây dựng BIM4C",
  email: "Bim4c.lab@gmail.com",
  phone: "+84 93 2468 099",
  address: "20 Bắc Sơn, Đà Nẵng, Việt Nam",
  brochureUrl: "/documents/bim4c-profile-2026-vi.pdf",
  metrics: DEFAULT_METRICS,
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/bim4c",
    facebook: "https://facebook.com/bim4c",
    youtube: "https://youtube.com/@bim4c",
  },
  defaultSeoTitle: "BIM4C - Tiên phong Chuyển đổi số Xây dựng",
  defaultSeoDescription: "Giải pháp BIM, Chuyển đổi số Xây dựng & Tư vấn 3D-7D toàn diện.",
  defaultOgImage: "/images/hero-skyline-bim.jpg",
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
