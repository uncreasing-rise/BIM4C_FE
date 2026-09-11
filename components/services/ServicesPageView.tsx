"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/PageHero";
import { ROUTES } from "@/constants/routes";
import { ServiceExplorer } from "@/components/services/ServiceExplorer";
import { ServiceGuide } from "@/components/services/ServiceGuide";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import type { ContentEntry } from "@/types/content";
import type { PageMeta } from "@/features/shared/types/pagination";
import { useLanguage } from "@/lib/i18n/context";

export function ServicesPageView({
  services,
  meta,
}: {
  services: ContentEntry[];
  meta: PageMeta;
}) {
  const { t } = useLanguage();

  return (
    <main>
      <PageHero
        eyebrow={t.servicesPage.eyebrow}
        title={t.servicesPage.title}
        description={t.servicesPage.description}
        image="/images/news-digital-twin.webp"
      />
      <ServiceGuide
        services={services.map(({ slug, title }) => ({
          slug,
          title,
        }))}
      />
      <ServiceExplorer services={services} meta={meta} />
      <ServiceFaq />
      <section className="bg-brand-ink py-20 text-white">
        <div className="site-container flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">{t.servicesPage.startEyebrow}</p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-.04em]">
              {t.servicesPage.startTitle}
            </h2>
          </div>
          <Button asChild size="lg" className="w-fit rounded-full">
            <Link href={ROUTES.contact}>
              {t.servicesPage.talkToExpert} <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
