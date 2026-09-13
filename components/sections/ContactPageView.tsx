"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import { PageHero } from "@/components/shared/PageHero";
import { ConsultationSection } from "@/components/sections/ConsultationSection";
import { OfficeLocationMap } from "@/components/sections/OfficeLocationMap";
import { useLanguage } from "@/lib/i18n/context";

export function ContactPageView() {
  usePublicMotion();
  const { t } = useLanguage();

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: t.navigation.contact }]}
        eyebrow={t.contactPage.eyebrow}
        title={t.contactPage.heroTitle}
        description={t.contactPage.heroDesc}
        image="/images/news-bim-training.webp"
      />
      <ConsultationSection />
      <OfficeLocationMap />
    </main>
  );
}
