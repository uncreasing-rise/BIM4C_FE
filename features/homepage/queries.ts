import { heroSlides, strategicPartners } from "@/constants/site-content";
import { assertApiEnvironment, env } from "@/lib/config/env";
import { isProductionBuild } from "@/lib/config/build";
import type { HeroSlide, StrategicPartner } from "./types";

export async function getHomepageContent(): Promise<{
  slides: HeroSlide[];
  partners: StrategicPartner[];
}> {
  if (env.useMockApi) {
    return {
      slides: heroSlides.map((slide, index) => ({
        ...slide,
        title: slide.title.join(" "),
        alt: slide.eyebrow,
        sortOrder: index,
        isActive: true,
      })),
      partners: strategicPartners.map((partner, index) => ({
        ...partner,
        sortOrder: index,
        isActive: true,
      })),
    };
  }

  assertApiEnvironment();
  try {
    const [slidesResponse, partnersResponse] = await Promise.all([
      fetch(`${env.apiUrl}/homepage/slides`, {
        next: { revalidate: 60, tags: ["homepage"] },
      }),
      fetch(`${env.apiUrl}/homepage/partners`, {
        next: { revalidate: 60, tags: ["homepage"] },
      }),
    ]);
    if (!slidesResponse.ok || !partnersResponse.ok)
      throw new Error("Homepage API failed");
    return {
      slides: (await slidesResponse.json()) as HeroSlide[],
      partners: (await partnersResponse.json()) as StrategicPartner[],
    };
  } catch (error) {
    if (isProductionBuild()) return { slides: [], partners: [] };
    throw error;
  }
}
