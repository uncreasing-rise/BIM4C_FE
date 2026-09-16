import { apiClient } from "@/lib/api/client";
import { canDeferBuildData } from "@/lib/config/build";
import type { HeroSlide, StrategicPartner } from "./types";

export async function getHomepageContent(): Promise<{
  slides: HeroSlide[];
  partners: StrategicPartner[];
}> {
  try {
    const [slides, partners] = await Promise.all([
      apiClient.get<HeroSlide[]>("/homepage/slides", {
        next: { revalidate: 60, tags: ["homepage"] },
      }),
      apiClient.get<StrategicPartner[]>("/homepage/partners", {
        next: { revalidate: 60, tags: ["homepage"] },
      }),
    ]);
    return {
      slides: slides.filter((item) => item.isActive),
      partners: partners.filter((item) => item.isActive),
    };
  } catch (error) {
    if (canDeferBuildData(error)) return { slides: [], partners: [] };
    throw error;
  }
}
