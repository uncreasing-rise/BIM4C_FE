"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";
import { DeliveryProcess } from "@/components/sections/DeliveryProcess";
import { Partners } from "@/components/sections/Partners";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";
import {
  ArrowUpRight,
  Check,
  Compass,
  Cpu,
  Handshake,
  Layers3,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import type { SiteSettingsData } from "@/features/settings/types";
import { Download } from "lucide-react";

import { ui } from "@/lib/i18n/ui";
export function AboutView({
  partners = [],
  rawSettings,
}: {
  partners?: Array<{ name: string; logo: string; website?: string | null; sortOrder: number; isActive: boolean }>;
  rawSettings?: SiteSettingsData;
}) {
  usePublicMotion();
  const { t, locale } = useLanguage();

  const isVi = locale === "vi";
  const displayMetrics = rawSettings?.metrics && rawSettings.metrics.length > 0
    ? rawSettings.metrics.map((m) => ({
        value: m.value,
        label: isVi ? m.label_vi : m.label_en,
      }))
    : t.aboutPage.trackRecord.metrics;

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
  ];
  const workIcons = [Target, MessageCircle, RefreshCw, Sparkles];
  const whyChooseItems = t.aboutPage.whyChoose.items;

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

      <section className="border-b bg-card/40 py-16 lg:py-24">
        <div className="site-container grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">{t.aboutPage.letter.title}</p>
            <h2 className="section-title mt-1">{t.aboutPage.letter.subtitle || t.aboutPage.letter.title}</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            {t.aboutPage.letter.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="vision-mission" className="scroll-mt-24 py-16 lg:py-24">
        <div className="site-container grid gap-6 lg:grid-cols-2">
          {[t.aboutPage.visionMission.vision, t.aboutPage.visionMission.mission].map((item) => (
            <article key={item.title} className="rounded-2xl border bg-card p-7 shadow-xs">
              <p className="eyebrow">{item.title}</p>
              <p className="mt-2 text-base leading-8 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Who We Are Story */}
      <section id="about-us" className="scroll-mt-24 py-16 lg:py-24">
        <div className="site-container grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="eyebrow">{t.aboutPage.whoWeAreEyebrow}</p>
              <h2 className="section-title mt-2">
                {t.aboutPage.whoWeAreTitle}
              </h2>

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
                ),
              )}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border shadow-xl group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/news-digital-twin.webp"
                  alt={
                    ui(locale).aboutView.bIMTechnologyIllustration
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-flex items-center gap-2 rounded-md bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/20 mb-2">
                    <ShieldCheck className="size-4" /> BIM 3D–7D
                  </div>
                  <p className="text-base font-bold text-white/95">
                    {ui(locale).aboutView.standardizedCDEDataEnvironmentAnd}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id="core-values" className="scroll-mt-24 border-y bg-slate-950 py-16 text-white lg:py-24">
        <div className="site-container">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-primary-foreground/60">{t.aboutPage.guidesEyebrow}</p>
            <h2 className="section-title mt-1">{t.aboutPage.guidesTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-300">
              {t.aboutPage.guidesDesc}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.1] hover:border-primary/40 flex flex-col justify-between h-full"
                  data-motion="tile"
                >
                  <div>
                    <span
                      className={`grid size-12 place-items-center rounded-xl ${v.bg} ${v.color} mb-5`}
                    >
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {v.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {v.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b py-16 lg:py-24">
        <div className="site-container">
          <header className="mb-10 max-w-2xl">
            <p className="eyebrow">{t.aboutPage.workMethod.eyebrow}</p>
            <h2 className="section-title mt-1">{t.aboutPage.workMethod.title}</h2>
            <p className="mt-3 text-base leading-8 text-muted-foreground">{t.aboutPage.workMethod.intro}</p>
          </header>
          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-11 hidden h-px bg-border lg:block" />
            {t.aboutPage.workMethod.items.map((item, index) => {
              const Icon = workIcons[index];
              return <article key={item.title} className="group relative rounded-2xl border bg-card p-7 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <span className="relative z-10 mb-5 grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground ring-8 ring-background"><Icon className="size-5" /></span>
                <span className="absolute right-5 top-5 font-mono text-xs text-muted-foreground">0{index + 1}</span>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section id="team" className="scroll-mt-24 py-16 lg:py-24">
        <div className="site-container">
          <header className="mb-10 max-w-2xl">
            <p className="eyebrow">{t.aboutPage.operation.eyebrow}</p>
            <h2 className="section-title mt-1">{t.aboutPage.operation.title}</h2>
          </header>
          <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {t.aboutPage.operation.items.map((item, index) => (
              <article key={item.title} className="relative flex gap-5 border-l-2 border-primary/20 pl-6">
                <span className="absolute -left-[18px] top-0 grid size-8 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground ring-8 ring-background">0{index + 1}</span>
                <div><span className="mb-4 grid size-10 place-items-center rounded-xl bg-slate-900 text-white"><Workflow className="size-5" /></span>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why-bim4c" className="border-y bg-muted/30 py-16 lg:py-24">
        <div className="site-container">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.5fr] lg:items-start">
            <header className="rounded-3xl bg-slate-950 p-8 text-white lg:sticky lg:top-24 lg:p-10">
              <p className="eyebrow text-slate-400">{t.aboutPage.whyChoose.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.aboutPage.whyChoose.title}</h2>
              <div className="mt-10 h-px bg-white/15" />
              <p className="mt-6 text-sm leading-7 text-slate-300">{t.aboutPage.whyChoose.intro}</p>
            </header>
            <div className="divide-y rounded-3xl border bg-card px-6 shadow-sm sm:px-10">
            {whyChooseItems.map((item, index) => {
              const Icon = [Cpu, Lightbulb, Handshake][index] ?? ShieldCheck;
              return <article key={item.title} className="group grid gap-5 py-8 sm:grid-cols-[64px_1fr] sm:gap-7">
                <div className="flex items-start justify-between sm:block"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-6" /></span><span className="font-mono text-sm text-muted-foreground sm:mt-5 sm:block">0{index + 1}</span></div>
                <div><h3 className="text-xl font-bold tracking-tight">{item.title}</h3><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{item.text}</p></div>
              </article>;
            })}
            </div>
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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.aboutPage.teamMembers.map((member) => (
              <article
                key={member.name}
                className="group relative overflow-hidden rounded-2xl bg-slate-900 shadow-xl aspect-[3/4] cursor-pointer ring-1 ring-white/10 transition-shadow duration-300 hover:ring-primary/40 hover:shadow-2xl"
                data-motion="tile"
              >
                {/* Full-card background image */}
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center">
                    <span className="text-7xl font-black text-white/[0.07] select-none tracking-tighter">
                      {member.name.split(" ").pop()?.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Gradient overlay — deepens slightly on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent transition-all duration-500 group-hover:from-black/95 group-hover:via-black/45" />

                {/* Subtle teal accent glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

                {/* Info panel */}
                <div className="absolute inset-x-0 bottom-0">
                  {/* Always visible: role pill + name */}
                  <div className="px-5 pb-5 pt-3">
                    <span className="inline-block mb-2 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                      {member.role}
                    </span>
                    <h3 className="text-[1.05rem] font-bold text-white leading-snug">
                      {member.name}
                    </h3>
                  </div>

                  {/* Hover-revealed spec info — slides in via max-height */}
                  <div className="max-h-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:max-h-32">
                    <div className="px-5 pb-5 border-t border-white/15 pt-3">
                      <p className="text-[0.8rem] leading-relaxed text-white/70">
                        {member.spec}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <DeliveryProcess />
      <Partners customPartners={partners} />

      {/* Track Record Key Metrics Strip */}
      <section className="border-y bg-slate-900 py-12 text-white">
        <div className="site-container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-white/10">
            {displayMetrics.map((metric, idx) => (
              <div key={idx} className={idx !== 0 ? "md:pl-6" : ""}>
                <span className="text-3xl font-extrabold text-teal-300 sm:text-4xl">
                  {metric.value}
                </span>
                <p className="mt-1 text-xs font-medium text-slate-300 sm:text-sm">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 border-t bg-card/60">
        <div className="site-container flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-8 md:p-12 md:flex-row md:items-center shadow-lg">
          <div className="max-w-xl">
            <p className="eyebrow">{t.aboutPage.ctaEyebrow}</p>
            <h2 className="section-title text-2xl md:text-3xl mt-1">
              {t.aboutPage.ctaTitle}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            {rawSettings?.brochureUrl && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl font-semibold shadow-xs"
              >
                <a
                  href={rawSettings.brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2 inline-flex items-center"
                >
                  <Download className="size-4 text-primary" />
                  <span>{ui(locale).aboutView.downloadBrochurePDF}</span>
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              className="rounded-xl font-semibold shadow-md shrink-0"
            >
              <Link href={ROUTES.contact}>
                {t.common.discussProject}{" "}
                <ArrowUpRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
