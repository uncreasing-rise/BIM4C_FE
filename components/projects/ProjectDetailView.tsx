"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import { JsonLd } from "@/components/seo/JsonLd";
import { ContentBlockRenderer } from "@/components/shared/ContentBlockRenderer";
import { PageHero } from "@/components/shared/PageHero";
import { TableOfContents } from "@/components/shared/TableOfContents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { AppointmentBooking } from "@/features/contact/components/AppointmentBooking";
import type { Project } from "@/features/projects/types/project";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent, localizeContentList } from "@/lib/i18n/localize";
import { breadcrumbSchema, contentSchema } from "@/lib/seo/structured-data";
import { legacyBlocks } from "@/lib/utils/legacy-blocks";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import type { ContentEntry } from "@/types/content";
import { ArrowLeft, ArrowRight, Award, Clock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
          breadcrumbSchema(breadcrumbItems),
          contentSchema("project", entry, detailPath),
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
              className="mb-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border bg-card p-6 md:grid-cols-3 lg:grid-cols-6 shadow-xs"
              data-motion="tile"
            >
              {projectProfile.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-extrabold leading-snug text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
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
                  {locale === "vi"
                    ? "Đăng ký nhận tư vấn và báo giá chi tiết cho dự án của bạn từ đội ngũ kỹ sư BIM4C."
                    : "Request tailored consultation and delivery proposal for your project from BIM4C engineers."}
                </p>

                <ConsultationForm
                  compact
                  subject={`${t.detailPage.projectProfile}: ${entry.title}`}
                />
                <AppointmentBooking projectSlug={entry.slug} />

                {/* Project Trust Signals (NDA, SLA, Expert) */}
                {t.detailPage.trustSignals && (
                  <div className="mt-6 pt-5 border-t border-white/15 space-y-3 bg-teal-500/[0.04] p-4 rounded-xl border border-teal-500/20">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <ShieldCheck className="size-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-teal-300">
                          {t.detailPage.trustSignals.ndaTitle}:{" "}
                        </strong>
                        <span className="text-slate-200">
                          {t.detailPage.trustSignals.ndaDesc}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Clock className="size-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-teal-300">
                          {t.detailPage.trustSignals.slaTitle}:{" "}
                        </strong>
                        <span className="text-slate-200">
                          {t.detailPage.trustSignals.slaDesc}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Award className="size-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-teal-300">
                          {t.detailPage.trustSignals.expertTitle}:{" "}
                        </strong>
                        <span className="text-slate-200">
                          {t.detailPage.trustSignals.expertDesc}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Gallery */}
        {entry.gallery && entry.gallery.length > 0 && (
          <section
            className="site-container mt-16"
            aria-label="Project gallery"
          >
            <h2 className="text-xl font-bold mb-6 text-foreground">
              {locale === "vi"
                ? "Hình ảnh & Mô hình dự án"
                : "Project Gallery & 3D Deliverables"}
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
            aria-label="Related projects"
          >
            <div>
              <header className="mb-8 flex items-center justify-between">
                <div>
                  <p className="eyebrow">{t.detailPage.keepExploring}</p>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {locale === "vi"
                      ? "Dự án tiêu biểu khác"
                      : "Related projects"}
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
