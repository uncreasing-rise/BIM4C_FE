"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Compass,
  Layers3,
  Users,
  Leaf,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Partners } from "@/components/sections/Partners";
import { ExpertiseStrip } from "@/components/sections/ExpertiseStrip";
import { DeliveryProcess } from "@/components/sections/DeliveryProcess";
import { useLanguage } from "@/lib/i18n/context";

const team = [
  ["Nguyễn Minh Anh", "BIM Director"],
  ["Trần Quốc Bảo", "Project Manager"],
  ["Lê Hoàng Nam", "Lead BIM Engineer"],
  ["Phạm Khánh Linh", "BIM Coordinator"],
] as const;

export function AboutView() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Compass,
      title: t.aboutPage.values.integrity.title,
      text: t.aboutPage.values.integrity.desc,
    },
    {
      icon: Layers3,
      title: t.aboutPage.values.innovation.title,
      text: t.aboutPage.values.innovation.desc,
    },
    {
      icon: Users,
      title: t.aboutPage.values.collaboration.title,
      text: t.aboutPage.values.collaboration.desc,
    },
    {
      icon: Leaf,
      title: t.aboutPage.values.sustainability.title,
      text: t.aboutPage.values.sustainability.desc,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={t.aboutPage.eyebrow}
        title={t.aboutPage.heroTitle}
        description={t.aboutPage.heroDesc}
        image="/images/news-project-coordination.webp"
        variant="about"
      />
      <ExpertiseStrip />
      <section className="py-12 lg:py-16">
        <div className="site-container grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <p className="eyebrow">{t.aboutPage.whoWeAreEyebrow}</p>
            <h2 className="section-title">{t.aboutPage.whoWeAreTitle}</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              {t.aboutPage.whoWeAreP1}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {t.aboutPage.whoWeAreP2}
            </p>
            <ul className="mt-5 grid gap-3 border-t pt-5">
              {[
                t.aboutPage.check1,
                t.aboutPage.check2,
                t.aboutPage.check3,
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <Check className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 rounded-lg">
              <Link href={ROUTES.services}>
                {t.common.exploreExpertise} <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <figure className="relative overflow-hidden rounded-xl">
            <Image
              src="/images/news-project-coordination.webp"
              alt="Construction professionals reviewing project information together"
              width={900}
              height={680}
              sizes="(max-width:1023px) 100vw, 50vw"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-ink to-transparent px-6 pb-5 pt-12 text-sm text-white">
              {t.aboutPage.heroDesc}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="technical-grid bg-brand-ink py-12 text-white lg:py-16">
        <div className="site-container">
          <header className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">{t.aboutPage.guidesEyebrow}</p>
              <h2 className="section-title">{t.aboutPage.guidesTitle}</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-300">
              {t.aboutPage.guidesDesc}
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-xl border border-white/15 bg-white/[.04] p-5"
              >
                <Icon className="size-6 text-teal-300" />
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="site-container grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-12">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src="/images/news-bim-training.webp"
              alt="A team learning through a project review"
              width={800}
              height={600}
              sizes="(max-width:1023px) 100vw, 40vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">{t.aboutPage.teamEyebrow}</p>
            <h2 className="section-title">{t.aboutPage.teamTitle}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {t.aboutPage.teamDesc}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {team.map(([name, role]) => (
                <article
                  key={name}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground"
                  >
                    {name
                      .split(" ")
                      .slice(-2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <DeliveryProcess />
      <Partners compact />
      <section className="py-12 lg:py-16">
        <div className="site-container flex flex-col items-start justify-between gap-5 rounded-xl md:flex-row md:items-center">
          <div>
            <p className="eyebrow">{t.aboutPage.ctaEyebrow}</p>
            <h2 className="section-title">{t.aboutPage.ctaTitle}</h2>
          </div>
          <Button asChild size="lg" className="rounded-lg">
            <Link href={ROUTES.contact}>
              {t.common.discussProject} <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
