import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { pageMeta } from "@/lib/seo/page-meta";
import { getRequestLocale } from "@/lib/i18n/request";
import { AboutView } from "@/components/sections/AboutView";
import { getHomepageContent } from "@/features/homepage/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = pageMeta("about", await getRequestLocale());
  return pageMetadata(title, description, ROUTES.about);
}

export default async function AboutPage() {
  const homepage = await getHomepageContent().catch(() => ({
    slides: [],
    partners: [],
  }));
  return (
    <main>
      <AboutView partners={homepage.partners} />
    </main>
  );
}
