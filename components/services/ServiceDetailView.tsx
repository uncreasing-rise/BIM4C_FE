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
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent, localizeContentList } from "@/lib/i18n/localize";
import { breadcrumbSchema, contentSchema } from "@/lib/seo/structured-data";
import { legacyBlocks } from "@/lib/utils/legacy-blocks";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import type { ContentEntry } from "@/types/content";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ui } from "@/lib/i18n/ui";
interface ServiceDetailViewProps {
  entry: ContentEntry;
  related?: ContentEntry[];
  backHref?: string;
}

export function ServiceDetailView({
  entry: rawEntry,
  related: rawRelated = [],
  backHref = ROUTES.services,
}: ServiceDetailViewProps) {
  usePublicMotion();
  const { t, locale } = useLanguage();
  const entry = localizeContent(rawEntry, locale);
  const related = localizeContentList(rawRelated, locale);

  const detailPath = `${backHref}/${entry.slug}`;
  const breadcrumbItems = [
    { name: t.navigation.home, path: "/" },
    { name: t.detailPage.backServices, path: backHref },
    { name: entry.title, path: detailPath },
  ];

  const blocks = entry.contentBlocks ?? legacyBlocks(entry);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbItems),
          contentSchema("service", entry, detailPath),
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
          {/* Top Back Navigation */}
          <div
            className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b pb-5"
            data-motion="reveal"
          >
            <Button asChild variant="ghost" className="px-0">
              <Link href={backHref}>
                <ArrowLeft /> {t.detailPage.backServices}
              </Link>
            </Button>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {toLocalizedLabel(entry.eyebrow, locale)}
            </span>
          </div>

          {/* Table of Contents & Quick Action */}
          <TableOfContents
            blocks={blocks}
            cta={{
              label:
                ui(locale).serviceDetailView.enquireForThisService,
              href: "#service-enquiry",
            }}
          />

          {/* Main 2-Column: Service Content + Consultation Form */}
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
            <div className="min-w-0" data-motion="reveal">
              <ContentBlockRenderer blocks={blocks} />

              {/* Technical Scope & Delivery Commitments */}
              <div className="mt-10 rounded-2xl border bg-card p-6 shadow-2xs">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-4">
                  <Layers className="size-5" />
                  <span>
                    {ui(locale).serviceDetailView.serviceDeliveryFramework}
                  </span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      {ui(locale).serviceDetailView.informationManagementAndCDECoordination}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      {ui(locale).serviceDetailView.openBIMIFCBCFComplianceEnsuring}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      {ui(locale).serviceDetailView.fullLegalNDAComplianceSafeguarding}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sidebar: Consultation Card */}
            <Card
              id="service-enquiry"
              className="scroll-mt-28 gap-0 overflow-hidden rounded-2xl bg-slate-950 p-0 text-white ring-0 border border-slate-700/80 shadow-2xl"
              data-motion="tile"
            >
              <CardHeader className="border-b border-white/15 p-6 bg-white/[0.04]">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-teal-950/90 px-3 py-1 text-xs font-bold text-teal-300 border border-teal-400/50 shadow-xs">
                    {t.detailPage.serviceProfile}
                  </span>
                  <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950/90 px-2.5 py-1 rounded-md border border-teal-400/50 shadow-xs">
                    SLA &lt; 24H
                  </span>
                </div>
                <CardTitle className="text-xl font-extrabold text-white mt-3 leading-snug">
                  {entry.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-6 text-sm font-medium text-slate-200 leading-relaxed">
                  {ui(locale).serviceDetailView.receiveExpertConsultationDetailedScope}
                </p>

                <ConsultationForm
                  compact
                  subject={`${t.detailPage.serviceProfile}: ${entry.title}`}
                />

                {/* Service Trust Signals */}
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

        {/* Related Services Section */}
        {related.length > 0 && (
          <section
            className="site-container mt-16 border-t pt-12"
            aria-label={ui(locale).serviceDetailView.relatedServices}
          >
            <div>
              <header className="mb-8 flex items-center justify-between">
                <div>
                  <p className="eyebrow">{t.detailPage.keepExploring}</p>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {ui(locale).serviceDetailView.relatedServices2}
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
