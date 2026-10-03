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
import {
  usePageContent,
  useSiteSettings,
} from "@/features/page-content/context";
import { filled } from "@/lib/utils/contact";

import { ui } from "@/lib/i18n/ui";

const valueStyles = [
  { icon: Compass, color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Layers3, color: "text-teal-500", bg: "bg-teal-500/10" },
  { icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
];
const workIcons = [Target, MessageCircle, RefreshCw, Sparkles];
const whyChooseIcons = [Cpu, Lightbulb, Handshake];

/** Every section reads the admin-managed `about` block and hides itself when its copy is empty. */
export function AboutView({
  partners = [],
}: {
  partners?: Array<{
    name: string;
    logo: string;
    website?: string | null;
    sortOrder: number;
    isActive: boolean;
  }>;
}) {
  usePublicMotion();
  const { t, locale } = useLanguage();
  const about = usePageContent("about");
  const settings = useSiteSettings();

  const isVi = locale === "vi";
  const displayMetrics = (settings?.metrics ?? [])
    .map((m) => ({ value: m.value, label: isVi ? m.label_vi : m.label_en }))
    .filter((m) => m.value?.trim());

  const letterParagraphs = filled(about?.letter?.paragraphs);
  const visionMission = filled([
    about?.visionMission?.vision,
    about?.visionMission?.mission,
  ]).filter((item) => item.title || item.text);
  const checks = filled([about?.check1, about?.check2, about?.check3]);
  const values = Object.values(about?.values ?? {}).filter(
    (v) => v?.title || v?.desc,
  );
  const workItems = filled(about?.workMethod?.items).filter(
    (item) => item.title || item.text,
  );
  const operationItems = filled(about?.operation?.items).filter(
    (item) => item.title || item.text,
  );
  const whyChooseItems = filled(about?.whyChoose?.items).filter(
    (item) => item.title || item.text,
  );
  const teamMembers = filled(about?.teamMembers).filter(
    (member) => member.role,
  );

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: t.navigation.about }]}
        eyebrow={about?.eyebrow}
        title={about?.heroTitle || t.navigation.about}
        description={about?.heroDesc}
        image="/images/news-project-coordination.webp"
        variant="about"
      />

      {letterParagraphs.length > 0 && (
        <section className="border-b bg-card/40 py-16 lg:py-24">
          <div className="site-container grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              {about?.letter?.title && (
                <p className="eyebrow">{about.letter.title}</p>
              )}
              {(about?.letter?.subtitle || about?.letter?.title) && (
                <h2 className="section-title mt-1">
                  {about?.letter?.subtitle || about?.letter?.title}
                </h2>
              )}
            </div>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              {letterParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {visionMission.length > 0 && (
        <section id="vision-mission" className="scroll-mt-24 py-16 lg:py-24">
          <div className="site-container grid gap-6 lg:grid-cols-2">
            {visionMission.map((item, index) => (
              <article
                key={item.title ?? index}
                className="rounded-2xl border bg-card p-7 shadow-xs"
              >
                <p className="eyebrow">{item.title}</p>
                <p className="mt-2 text-base leading-8 text-muted-foreground">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Who We Are Story */}
      {(about?.whoWeAreTitle || about?.whoWeAreP1 || about?.whoWeAreP2) && (
        <section id="about-us" className="scroll-mt-24 py-16 lg:py-24">
          <div className="site-container grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-6">
              <div>
                {about.whoWeAreEyebrow && (
                  <p className="eyebrow">{about.whoWeAreEyebrow}</p>
                )}
                {about.whoWeAreTitle && (
                  <h2 className="section-title mt-2">{about.whoWeAreTitle}</h2>
                )}
              </div>
              {about.whoWeAreP1 && (
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  {about.whoWeAreP1}
                </p>
              )}
              {about.whoWeAreP2 && (
                <p className="text-base leading-relaxed text-muted-foreground">
                  {about.whoWeAreP2}
                </p>
              )}

              {checks.length > 0 && (
                <ul className="space-y-3 pt-2">
                  {checks.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3.5 stroke-[3]" />
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl border shadow-xl group">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/news-digital-twin.webp"
                    alt={ui(locale).aboutView.bIMTechnologyIllustration}
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
      )}

      {/* Core Values */}
      {values.length > 0 && (
        <section
          id="core-values"
          className="scroll-mt-24 border-y bg-slate-950 py-16 text-white lg:py-24"
        >
          <div className="site-container">
            <div className="max-w-2xl mb-12">
              {about?.guidesEyebrow && (
                <p className="eyebrow text-primary-foreground/60">
                  {about.guidesEyebrow}
                </p>
              )}
              {about?.guidesTitle && (
                <h2 className="section-title mt-1">{about.guidesTitle}</h2>
              )}
              {about?.guidesDesc && (
                <p className="mt-3 text-base leading-relaxed text-slate-300">
                  {about.guidesDesc}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {values.map((v, i) => {
                const style = valueStyles[i % valueStyles.length];
                const Icon = style.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.1] hover:border-primary/40 flex flex-col justify-between h-full"
                    data-motion="tile"
                  >
                    <div>
                      <span
                        className={`grid size-12 place-items-center rounded-xl ${style.bg} ${style.color} mb-5`}
                      >
                        <Icon className="size-6" />
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {v?.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300">
                        {v?.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {workItems.length > 0 && (
        <section className="border-b py-16 lg:py-24">
          <div className="site-container">
            <header className="mb-10 max-w-2xl">
              {about?.workMethod?.eyebrow && (
                <p className="eyebrow">{about.workMethod.eyebrow}</p>
              )}
              {about?.workMethod?.title && (
                <h2 className="section-title mt-1">{about.workMethod.title}</h2>
              )}
              {about?.workMethod?.intro && (
                <p className="mt-3 text-base leading-8 text-muted-foreground">
                  {about.workMethod.intro}
                </p>
              )}
            </header>
            <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-11 hidden h-px bg-border lg:block" />
              {workItems.map((item, index) => {
                const Icon = workIcons[index % workIcons.length];
                return (
                  <article
                    key={item.title ?? index}
                    className="group relative rounded-2xl border bg-card p-7 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="relative z-10 mb-5 grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground ring-8 ring-background">
                      <Icon className="size-5" />
                    </span>
                    <span className="absolute right-5 top-5 font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {operationItems.length > 0 && (
        <section id="team" className="scroll-mt-24 py-16 lg:py-24">
          <div className="site-container">
            <header className="mb-10 max-w-2xl">
              {about?.operation?.eyebrow && (
                <p className="eyebrow">{about.operation.eyebrow}</p>
              )}
              {about?.operation?.title && (
                <h2 className="section-title mt-1">{about.operation.title}</h2>
              )}
            </header>
            <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {operationItems.map((item, index) => (
                <article
                  key={item.title ?? index}
                  className="relative flex gap-5 border-l-2 border-primary/20 pl-6"
                >
                  <span className="absolute -left-[18px] top-0 grid size-8 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground ring-8 ring-background">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="mb-4 grid size-10 place-items-center rounded-xl bg-slate-900 text-white">
                      <Workflow className="size-5" />
                    </span>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {whyChooseItems.length > 0 && (
        <section id="why-bim4c" className="border-y bg-muted/30 py-16 lg:py-24">
          <div className="site-container">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.5fr] lg:items-start">
              <header className="rounded-3xl bg-slate-950 p-8 text-white lg:sticky lg:top-24 lg:p-10">
                {about?.whyChoose?.eyebrow && (
                  <p className="eyebrow text-slate-400">
                    {about.whyChoose.eyebrow}
                  </p>
                )}
                {about?.whyChoose?.title && (
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    {about.whyChoose.title}
                  </h2>
                )}
                {about?.whyChoose?.intro && (
                  <>
                    <div className="mt-10 h-px bg-white/15" />
                    <p className="mt-6 text-sm leading-7 text-slate-300">
                      {about.whyChoose.intro}
                    </p>
                  </>
                )}
              </header>
              <div className="divide-y rounded-3xl border bg-card px-6 shadow-sm sm:px-10">
                {whyChooseItems.map((item, index) => {
                  const Icon = whyChooseIcons[index] ?? ShieldCheck;
                  return (
                    <article
                      key={item.title ?? index}
                      className="group grid gap-5 py-8 sm:grid-cols-[64px_1fr] sm:gap-7"
                    >
                      <div className="flex items-start justify-between sm:block">
                        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="size-6" />
                        </span>
                        <span className="font-mono text-sm text-muted-foreground sm:mt-5 sm:block">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">
                          {item.title}
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                          {item.text}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Leadership & Expert Team */}
      {teamMembers.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="site-container">
            <div className="max-w-2xl mb-12">
              {about?.teamEyebrow && (
                <p className="eyebrow">{about.teamEyebrow}</p>
              )}
              {about?.teamTitle && (
                <h2 className="section-title mt-1">{about.teamTitle}</h2>
              )}
              {about?.teamDesc && (
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {about.teamDesc}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* By role and expertise only: names and photos are kept private
                  (the API and getPageContent leave them out). */}
              {teamMembers.map((member, index) => (
                <article
                  key={`${member.role}-${index}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 shadow-xl ring-1 ring-white/10 transition-shadow duration-300 hover:ring-primary/40 hover:shadow-2xl"
                  data-motion="tile"
                >
                  {/* Subtle teal accent glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

                  <span className="relative grid size-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                    <Users className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="relative mt-5 text-[1.05rem] font-bold leading-snug text-white">
                    {member.role}
                  </h3>
                  {member.spec && (
                    <p className="relative mt-3 border-t border-white/15 pt-3 text-[0.85rem] leading-relaxed text-white/70">
                      {member.spec}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <DeliveryProcess />
      <Partners customPartners={partners} />

      {/* Track Record Key Metrics Strip */}
      {displayMetrics.length > 0 && (
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
      )}

      {/* Bottom CTA */}
      <section className="py-16 border-t bg-card/60">
        <div className="site-container flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-8 md:p-12 md:flex-row md:items-center shadow-lg">
          <div className="max-w-xl">
            {about?.ctaEyebrow && <p className="eyebrow">{about.ctaEyebrow}</p>}
            {about?.ctaTitle && (
              <h2 className="section-title text-2xl md:text-3xl mt-1">
                {about.ctaTitle}
              </h2>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
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
