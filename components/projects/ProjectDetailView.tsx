"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";
import { TrustSignals } from "@/components/shared/TrustSignals";

import { JsonLd } from "@/components/seo/JsonLd";
import { ContentBlockRenderer } from "@/components/shared/ContentBlockRenderer";
import { PageHero } from "@/components/shared/PageHero";
import { TableOfContents } from "@/components/shared/TableOfContents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { LocalizedLink } from "@/components/shared/LocalizedLink";
import { cn } from "@/lib/utils";
import type { Project } from "@/features/projects/types/project";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent, localizeContentList } from "@/lib/i18n/localize";
import { breadcrumbSchema, contentSchema } from "@/lib/seo/structured-data";
import { legacyBlocks } from "@/lib/utils/legacy-blocks";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import type { ContentEntry } from "@/types/content";
import { ArrowLeft, ArrowRight, CalendarClock } from "lucide-react";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";

import { ui } from "@/lib/i18n/ui";
interface ProjectDetailViewProps {
  entry: Project;
  related?: ContentEntry[];
  backHref?: string;
}

export function ProjectDetailView({
  entry: rawEntry,
  related: rawRelated = [],
  backHref = ROUTES.projects,
}: ProjectDetailViewProps) {
  usePublicMotion();
  const { t, locale } = useLanguage();
  const entry = localizeContent(rawEntry, locale) as Project;
  const related = localizeContentList(rawRelated, locale);

  const detailPath = `${backHref}/${entry.slug}`;
  const breadcrumbItems = [
    { name: t.navigation.home, path: "/" },
    { name: t.detailPage.backProjects, path: backHref },
    { name: entry.title, path: detailPath },
  ];

  const projectProfile = [
    [t.detailPage.fields.client, entry.investor],
    [
      t.detailPage.fields.location,
      toLocalizedLabel(entry.location ?? "", locale),
    ],
    [t.detailPage.fields.scale, entry.scale],
    [t.detailPage.fields.contractPackage, entry.contractPackage],
    [
      entry.expectedCompletion
        ? t.detailPage.fields.expectedCompletion
        : t.detailPage.fields.projectYear,
      entry.expectedCompletion ?? entry.year,
    ],
    [t.detailPage.fields.status, toLocalizedLabel(entry.status ?? "", locale)],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  const blocks = entry.contentBlocks?.length ? entry.contentBlocks : legacyBlocks(entry);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbItems, locale),
          contentSchema("project", entry, detailPath, locale),
        ]}
      />
      <PageHero
        eyebrow={
          entry.meta
            ? `${toLocalizedLabel(entry.eyebrow, locale)} · ${entry.meta}`
            : toLocalizedLabel(entry.eyebrow, locale)
        }
        title={entry.title}
        description={entry.description}
        image={entry.image}
        breadcrumbs={breadcrumbItems.map((item, index) => ({
          label: item.name,
          href: index < breadcrumbItems.length - 1 ? item.path : undefined,
        }))}
      />
      <article
        className="bg-background py-8 lg:py-12 pb-24 lg:pb-16"
        data-motion="detail"
      >
        <div className="site-container">
          {/* Top Bar Navigation */}
          <div
            className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b pb-5"
            data-motion="reveal"
          >
            <Button asChild variant="ghost" className="px-0">
              <Link href={backHref}>
                <ArrowLeft /> {t.detailPage.backProjects}
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">
              {entry.category}
            </span>
          </div>

          {/* Project Specifications Card Strip */}
          {projectProfile.length > 0 && (
            <dl
              className="mb-8 grid grid-cols-1 gap-x-6 gap-y-5 rounded-2xl border bg-card p-6 shadow-xs sm:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]"
              data-motion="tile"
            >
              {projectProfile.map(([label, value]) => {
                // Long free-text facts (scale, package) get two columns instead of a cramped one.
                const long = String(value).length > 48;
                return (
                  <div key={label} className={cn("min-w-0", long && "sm:col-span-2")}>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </dt>
                    <dd
                      className={cn(
                        "mt-1 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]",
                        long ? "font-semibold" : "font-extrabold",
                      )}
                    >
                      {value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}

          {/* Table of Contents & Quick Action */}
          <TableOfContents
            blocks={blocks}
            cta={{
              label: t.detailPage.discussProject,
              href: "#project-enquiry",
            }}
          />

          {/* Main Grid: Case Study Content + Enterprise Consultation */}
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
            <div className="min-w-0" data-motion="reveal">
              <ContentBlockRenderer blocks={blocks} />
            </div>

            {/* Sidebar: Consultation Card */}
            <Card
              id="project-enquiry"
              className="scroll-mt-28 gap-0 overflow-hidden rounded-2xl bg-slate-950 p-0 text-white ring-0 border border-slate-700/80 shadow-2xl"
              data-motion="tile"
            >
              <CardHeader className="border-b border-white/15 p-6 bg-white/[0.04]">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-teal-950/90 px-3 py-1 text-xs font-bold text-teal-300 border border-teal-400/50 shadow-xs">
                    {t.detailPage.projectProfile}
                  </span>
                  <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950/90 px-2.5 py-1 rounded-md border border-teal-400/50 shadow-xs">
                    {toLocalizedLabel(entry.eyebrow, locale)}
                  </span>
                </div>
                <CardTitle className="text-xl font-extrabold text-white mt-3 leading-snug">
                  {entry.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-6 text-sm font-medium text-slate-200 leading-relaxed">
                  {ui(locale).projectDetailView.requestTailoredConsultationAndDelivery}
                </p>

                <ConsultationForm
                  compact
                  subject={`${t.detailPage.projectProfile}: ${entry.title}`}
                />
                {/* Booking lives on the contact page; link there instead of embedding a second form. */}
                <LocalizedLink
                  href={`${ROUTES.contact}#dat-lich`}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-teal-400/40 px-4 text-sm font-semibold text-teal-300 transition-colors hover:bg-teal-400/10 hover:text-white"
                >
                  <CalendarClock className="size-4" />
                  {ui(locale).consultationSection.bookAConsultation}
                </LocalizedLink>

                {/* Project Trust Signals (NDA, SLA, Expert) */}
                <TrustSignals />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Gallery */}
        {entry.gallery && entry.gallery.length > 0 && (
          <section
            className="site-container mt-16"
            aria-label={ui(locale).projectDetailView.projectGallery}
          >
            <h2 className="text-xl font-bold mb-6 text-foreground">
              {ui(locale).projectDetailView.projectGallery3DDeliverables}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entry.gallery.map((image, index) => (
                <figure
                  data-motion="tile"
                  className={
                    index === 0
                      ? "relative aspect-[16/10] overflow-hidden rounded-2xl sm:col-span-2 sm:aspect-[21/9]"
                      : "relative aspect-[16/10] overflow-hidden rounded-2xl"
                  }
                  key={`${image.url}-${index}`}
                >
                  <Image
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    src={image.url}
                    alt={image.alt ?? `${entry.title} - ${index + 1}`}
                    fill
                    sizes="(max-width:767px) 100vw, 50vw"
                  />
                  {image.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-black/65 p-3 text-sm text-white">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Related Projects Section */}
        {related.length > 0 && (
          <section
            className="site-container mt-16 border-t pt-12"
            aria-label={ui(locale).projectDetailView.relatedProjects}
          >
            <div>
              <header className="mb-8 flex items-center justify-between">
                <div>
                  <p className="eyebrow">{t.detailPage.keepExploring}</p>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {ui(locale).projectDetailView.relatedProjects2}
                  </h2>
                </div>
                <Button asChild variant="outline">
                  <Link href={backHref}>
                    {t.detailPage.viewAll}{" "}
                    <ArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </header>
              <div className="grid gap-6 md:grid-cols-3">
                {related.slice(0, 3).map((item) => (
                  <article
                    className="group relative"
                    key={item.slug}
                    data-motion="tile"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width:767px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                      {toLocalizedLabel(item.eyebrow, locale)}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-snug text-foreground">
                      {item.title}
                    </h3>
                    <Link
                      className="absolute inset-0"
                      href={`${backHref}/${item.slug}`}
                      aria-label={`View ${item.title}`}
                    />
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
