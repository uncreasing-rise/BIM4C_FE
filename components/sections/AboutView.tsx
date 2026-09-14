"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Compass,
  Layers3,
  Users,
  Leaf,
  Briefcase,
  BadgeCheck,
  ShieldCheck,
  Award,
  BarChart3,
  Building2,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Partners } from "@/components/sections/Partners";
import { DeliveryProcess } from "@/components/sections/DeliveryProcess";
import { useLanguage } from "@/lib/i18n/context";

export function AboutView() {
  usePublicMotion();
  const { t, locale } = useLanguage();

  const values = [
    {
      icon: Compass,
      title: t.aboutPage.values.integrity.title,
      text: t.aboutPage.values.integrity.desc,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Layers3,
      title: t.aboutPage.values.innovation.title,
      text: t.aboutPage.values.innovation.desc,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
    },
    {
      icon: Users,
      title: t.aboutPage.values.collaboration.title,
      text: t.aboutPage.values.collaboration.desc,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      icon: Leaf,
      title: t.aboutPage.values.sustainability.title,
      text: t.aboutPage.values.sustainability.desc,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: t.navigation.about }]}
        eyebrow={t.aboutPage.eyebrow}
        title={t.aboutPage.heroTitle}
        description={t.aboutPage.heroDesc}
        image="/images/news-project-coordination.webp"
        variant="about"
      />

      {/* Track Record Metrics Bento */}
      {t.aboutPage.trackRecord && (
        <section className="py-12 border-b bg-card/40">
          <div className="site-container">
            <div className="mb-8 text-center max-w-2xl mx-auto">
              <p className="eyebrow justify-center">{t.aboutPage.trackRecord.eyebrow}</p>
              <h2 className="section-title text-2xl md:text-3xl mt-1">
                {t.aboutPage.trackRecord.title}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {t.aboutPage.trackRecord.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl border bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md"
                  data-motion="tile"
                >
                  <div className="text-3xl md:text-4xl font-black tracking-tight text-primary">
                    {metric.value}
                  </div>
                  <h3 className="mt-2 text-base font-bold text-foreground">
                    {metric.label}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {metric.subtext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Who We Are Story */}
      <section className="py-16 lg:py-24">
        <div className="site-container grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="eyebrow">{t.aboutPage.whoWeAreEyebrow}</p>
              <h2 className="section-title mt-2">{t.aboutPage.whoWeAreTitle}</h2>
            </div>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              {t.aboutPage.whoWeAreP1}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {t.aboutPage.whoWeAreP2}
            </p>

            <ul className="space-y-3 pt-2">
              {[t.aboutPage.check1, t.aboutPage.check2, t.aboutPage.check3].map(
                (item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5 stroke-[3]" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border shadow-xl group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/news-digital-twin.webp"
                  alt="BIM4C Engineering Team"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-flex items-center gap-2 rounded-md bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/20 mb-2">
                    <ShieldCheck className="size-4" /> ISO 19650 Standardized
                  </div>
                  <p className="text-base font-bold text-white/95">
                    {locale === "vi"
                      ? "Hệ thống dữ liệu CDE và mô hình thông tin chuẩn xác cho dự án xây dựng hiện đại"
                      : "Standardized CDE data environment and accurate information models for modern construction"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-muted/40 border-y">
        <div className="site-container">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow">{t.aboutPage.guidesEyebrow}</p>
            <h2 className="section-title mt-1">{t.aboutPage.guidesTitle}</h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {t.aboutPage.guidesDesc}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border bg-card p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40 flex flex-col justify-between"
                  data-motion="tile"
                >
                  <div>
                    <span className={`grid size-12 place-items-center rounded-xl ${v.bg} ${v.color} mb-4`}>
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {v.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership & Expert Team */}
      <section className="py-16 lg:py-24">
        <div className="site-container">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow">{t.aboutPage.teamEyebrow}</p>
            <h2 className="section-title mt-1">{t.aboutPage.teamTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t.aboutPage.teamDesc}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.aboutPage.teamMembers.map((member) => (
              <article
                key={member.name}
                className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-md transition-all duration-500 hover:shadow-2xl hover:border-primary/60"
                data-motion="tile"
              >
                {/* Full-Card Portrait Image */}
                <Image
                  src={member.image || "/images/team/ceo-hieu.jpg"}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Ambient Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-500 group-hover:from-black/95 group-hover:via-black/60 pointer-events-none" />

                {/* Bottom Content: Name + Role, Expanding Specs on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col justify-end text-white z-10 pointer-events-none">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-xs sm:text-sm font-medium text-teal-300 tracking-wide">
                    {member.role}
                  </p>

                  {/* Smooth Expandable Drawer on Hover */}
                  <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:mt-3">
                    <div className="overflow-hidden space-y-2 border-t border-white/20 pt-3">
                      {member.cert && (
                        <p className="text-xs font-semibold text-white/90 leading-tight">
                          {member.cert}
                        </p>
                      )}
                      {member.spec && (
                        <p className="text-xs leading-relaxed text-slate-300">
                          {member.spec}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <DeliveryProcess />
      <Partners compact />

      {/* Bottom CTA */}
      <section className="py-16 border-t bg-card/60">
        <div className="site-container flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-8 md:p-12 md:flex-row md:items-center shadow-lg">
          <div className="max-w-xl">
            <p className="eyebrow">{t.aboutPage.ctaEyebrow}</p>
            <h2 className="section-title text-2xl md:text-3xl mt-1">{t.aboutPage.ctaTitle}</h2>
          </div>
          <Button asChild size="lg" className="rounded-xl font-semibold shadow-md shrink-0">
            <Link href={ROUTES.contact}>
              {t.common.discussProject} <ArrowUpRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
