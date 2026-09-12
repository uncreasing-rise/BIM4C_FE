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
  Award,
  ShieldCheck,
  TrendingUp,
  BadgeCheck,
  Briefcase,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { Partners } from "@/components/sections/Partners";
import { ExpertiseStrip } from "@/components/sections/ExpertiseStrip";
import { DeliveryProcess } from "@/components/sections/DeliveryProcess";
import { useLanguage } from "@/lib/i18n/context";

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

      {/* Enterprise Track Record & Milestones Bar */}
      {t.aboutPage.trackRecord && (
        <section className="border-y border-border/80 bg-muted/40 py-12 lg:py-16">
          <div className="site-container">
            <div className="mb-8 text-center md:text-left">
              <p className="eyebrow">{t.aboutPage.trackRecord.eyebrow}</p>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                {t.aboutPage.trackRecord.title}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {t.aboutPage.trackRecord.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/40"
                  data-motion="tile"
                >
                  <p className="font-mono text-3xl font-black tracking-tight text-primary lg:text-4xl">
                    {metric.value}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-foreground">
                    {metric.label}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {metric.subtext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
          <figure className="relative overflow-hidden rounded-2xl shadow-lg border">
            <Image
              src="/images/news-project-coordination.webp"
              alt="Construction professionals reviewing project information together"
              width={900}
              height={680}
              sizes="(max-width:1023px) 100vw, 50vw"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/50 to-transparent px-6 pb-5 pt-12 text-sm text-white">
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
                className="rounded-xl border border-white/15 bg-white/[.04] p-5 transition-all hover:bg-white/[.08] hover:border-teal-400/40"
              >
                <Icon className="size-6 text-teal-300" />
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Certified Engineering Specialists */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="site-container">
          <div className="max-w-2xl mb-10">
            <p className="eyebrow">{t.aboutPage.teamEyebrow}</p>
            <h2 className="section-title">{t.aboutPage.teamTitle}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {t.aboutPage.teamDesc}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {t.aboutPage.teamMembers.map((member) => (
              <article
                key={member.name}
                className="group relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-primary/40"
                data-motion="tile"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {member.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {member.role}
                      </p>
                    </div>
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Briefcase className="size-6" />
                    </span>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
                    <BadgeCheck className="size-4 shrink-0 text-teal-600 dark:text-teal-400" />
                    <span>{member.cert}</span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {member.spec}
                  </p>
                </div>
              </article>
            ))}
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
