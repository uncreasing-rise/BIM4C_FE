import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { AboutView } from "@/components/sections/AboutView";
import { getHomepageContent } from "@/features/homepage/queries";
import { getSiteSettings } from "@/features/settings/queries";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
    "About",
    "Meet BIM4C: connecting construction expertise, BIM workflows and project information.",
    ROUTES.about,
  );
}

export default async function AboutPage() {
  const [homepage, settings] = await Promise.all([
    getHomepageContent().catch(() => ({ slides: [], partners: [] })),
    getSiteSettings().catch(() => null),
  ]);
  return (
    <main>
      <AboutView partners={homepage.partners} rawSettings={settings || undefined} />
    </main>
  );
}
