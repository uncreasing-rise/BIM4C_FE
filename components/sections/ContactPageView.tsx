"use client";

import { PageHero } from "@/components/shared/PageHero";
import { ConsultationSection } from "@/components/sections/ConsultationSection";
import { OfficeLocationMap } from "@/components/sections/OfficeLocationMap";
import { useLanguage } from "@/lib/i18n/context";

export function ContactPageView() {
  const { t } = useLanguage();

  return (
    <main>
      <PageHero
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
