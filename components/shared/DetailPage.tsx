"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ShieldCheck,
  Clock,
  Award,
  CheckCircle2,
  Cpu,
  Layers,
  FileText,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { CourseRegistrationForm } from "@/features/contact/components/CourseRegistrationForm";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";
import type { Project } from "@/features/projects/types/project";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";
import type { ContentEntry } from "@/types/content";
import { ContentBlockRenderer } from "./ContentBlockRenderer";
import { PageHero } from "./PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, contentSchema } from "@/lib/seo/structured-data";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent, localizeContentList } from "@/lib/i18n/localize";

type DetailKind = "course" | "project" | "article" | "service";
type DetailEntry = ContentEntry &
  Partial<
    Pick<
      Project,
      | "investor"
      | "expectedCompletion"
      | "scale"
      | "contractPackage"
      | "location"
      | "year"
      | "status"
    >
  >;

function legacyBlocks(entry: ContentEntry): ContentBlock[] {
  return entry.sections.flatMap((section, index) => {
    const prefix = `legacy-${index}`;
    const blocks: ContentBlock[] = [
      {
        id: `${prefix}-text`,
        type: "rich-text",
        heading: section.title,
        content: section.body,
      },
    ];
    if (section.images?.length === 1)
      blocks.push({
        id: `${prefix}-image`,
        type: "image",
        image: section.images[0],
      });
    if ((section.images?.length ?? 0) > 1)
      blocks.push({
        id: `${prefix}-gallery`,
        type: "gallery",
        images: section.images!,
      });
    if (section.unorderedList?.length)
      blocks.push({
        id: `${prefix}-features`,
        type: "feature-list",
        items: section.unorderedList,
        ordered: false,
      });
    if (section.orderedList?.length)
      blocks.push({
        id: `${prefix}-steps`,
        type: "feature-list",
        items: section.orderedList,
        ordered: true,
      });
    if (section.quote)
      blocks.push({
        id: `${prefix}-quote`,
        type: "quote",
        quote: section.quote,
      });
    if (section.videoUrl)
      blocks.push({
        id: `${prefix}-video`,
        type: "video",
        url: section.videoUrl,
      });
    return blocks;
  });
}

export function DetailPage({
  entry: rawEntry,
  backHref,
  backLabel,
  kind = "service",
  related: rawRelated = [],
}: {
  entry: DetailEntry;
  backHref: string;
  backLabel?: string;
  kind?: DetailKind;
  related?: ContentEntry[];
}) {
  const { t, locale } = useLanguage();
  const entry = localizeContent(rawEntry, locale) as DetailEntry;
  const related = localizeContentList(rawRelated, locale);

  const uiLabels: Record<DetailKind, { aside: string; back: string }> = {
    course: {
      aside: t.detailPage.courseProfile,
      back: t.detailPage.backCourses,
    },
    project: {
      aside: t.detailPage.projectProfile,
      back: t.detailPage.backProjects,
    },
    article: {
      aside: t.detailPage.articleInfo,
      back: t.detailPage.backBlog,
    },
    service: {
      aside: t.detailPage.serviceProfile,
      back: t.detailPage.backServices,
    },
  };

  const blocks = entry.contentBlocks ?? legacyBlocks(entry);
  const detailPath = `${backHref}/${entry.slug}`;
  const breadcrumbItems = [
    { name: t.navigation.home, path: "/" },
    { name: uiLabels[kind].back, path: backHref },
    { name: entry.title, path: detailPath },
  ];

  const projectProfile =
    kind === "project"
      ? [
          [t.detailPage.fields.client, entry.investor],
          [t.detailPage.fields.location, toLocalizedLabel(entry.location ?? "", locale)],
          [t.detailPage.fields.scale, entry.scale],
          [t.detailPage.fields.contractPackage, entry.contractPackage],
          [
            entry.expectedCompletion
              ? t.detailPage.fields.expectedCompletion
              : t.detailPage.fields.projectYear,
            entry.expectedCompletion ?? entry.year,
          ],
          [t.detailPage.fields.status, toLocalizedLabel(entry.status ?? "", locale)],
        ].filter((item): item is [string, string] => Boolean(item[1]))
      : [];

  const courseProfile =
    kind === "course"
      ? [
          [
            t.detailPage.fields.duration,
            toLocalizedLabel(entry.duration || entry.eyebrow.split("·")[1]?.trim() || "", locale),
          ],
          [
            t.detailPage.fields.level,
            toLocalizedLabel(entry.level || entry.eyebrow.split("·")[0]?.trim(), locale),
          ],
          [t.detailPage.fields.price, entry.price],
          [t.detailPage.fields.instructor, entry.instructor],
        ].filter((item): item is [string, string] => Boolean(item[1]))
      : [];

  const defaultBackLabel = backLabel || uiLabels[kind].back;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbItems),
          contentSchema(kind, entry, detailPath),
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
      <article className="bg-background py-8 lg:py-12" data-motion="detail">
        <div className="site-container">
          <div
            className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b pb-5"
            data-motion="reveal"
          >
            <Button asChild variant="ghost" className="px-0">
              <Link href={backHref}>
                <ArrowLeft /> {defaultBackLabel}
              </Link>
            </Button>
            {(entry.authorName || entry.publishedAt) && (
              <p className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                {entry.publishedAt && (
                  <time dateTime={entry.publishedAt}>
                    {new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
                      dateStyle: "long",
                      timeZone: "UTC",
                    }).format(new Date(entry.publishedAt))}
                  </time>
                )}
                {entry.authorName && (
                  <span>
                    {t.detailPage.byAuthor}{" "}
                    <strong className="text-foreground">
                      {entry.authorName}
                    </strong>
                  </span>
                )}
              </p>
            )}
          </div>
          {projectProfile.length > 0 && (
            <dl
              className="mb-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border bg-card p-5 md:grid-cols-3"
              data-motion="tile"
            >
              {projectProfile.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-6">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <div
            className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/50 p-4"
            data-motion="reveal"
          >
            <nav aria-label={t.detailPage.onThisPage} className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.detailPage.onThisPage}
              </p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {blocks
                  .filter(
                    (block) => block.type === "rich-text" && block.heading,
                  )
                  .map((block) => (
                    <li key={block.id}>
                      <a
                        className="inline-block py-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        href={`#block-${block.id}`}
                      >
                        {block.type === "rich-text" ? block.heading : ""}
                      </a>
                    </li>
                  ))}
              </ul>
            </nav>
            {kind !== "article" && (
              <Button asChild className="shrink-0">
                <a href="#detail-enquiry">
                  {kind === "course"
                    ? t.detailPage.enquireProgramme
                    : t.detailPage.discussProject}{" "}
                  <ArrowUpRight />
                </a>
              </Button>
            )}
          </div>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
            <div className="min-w-0" data-motion="reveal">
              <ContentBlockRenderer blocks={blocks} />
            </div>
            <Card
              id="detail-enquiry"
              className="scroll-mt-28 gap-0 overflow-hidden rounded-2xl bg-brand-ink p-0 text-white ring-0 border border-white/10 shadow-2xl"
              data-motion="tile"
            >
              <CardHeader className="border-b border-white/10 p-6 bg-white/[0.02]">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="w-fit bg-teal-500/20 text-teal-300 border-teal-500/30">
                    {uiLabels[kind].aside}
                  </Badge>
                  {kind === "course" && (
                    <span className="font-mono text-[11px] text-teal-300 bg-black/40 px-2 py-0.5 rounded border border-teal-500/30">
                      ISO 19650
                    </span>
                  )}
                </div>
                <CardTitle className="text-2xl text-white mt-2">
                  {entry.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {courseProfile.length > 0 && (
                  <dl className="mb-6">
                    {courseProfile.map(([label, value]) => (
                      <div
                        className="border-b border-white/10 py-3"
                        key={label}
                      >
                        <dt className="text-xs font-medium text-white/75">
                          {label}
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-white/85">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {/* Holographic Certificate Preview for Courses */}
                {kind === "course" && (
                  <div className="mb-6 rounded-xl border border-teal-500/30 p-4 hologram-effect text-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-white/20 pb-2">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-teal-200">
                        {t.detailPage.certificateBadge}
                      </span>
                      <span className="font-mono text-[10px] text-white/75">
                        ID: 19650-VERIFIED
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-white">
                      {t.detailPage.certificateTitle}
                    </p>
                    <p className="mt-1 text-[11px] text-white/80">
                      {t.detailPage.certificateDesc}
                    </p>
                  </div>
                )}

                {entry.learningOutcomes?.length ? (
                  <ul className="mb-7 grid gap-3">
                    {entry.learningOutcomes.map((item) => (
                      <li
                        className="flex gap-2 text-sm text-white/80"
                        key={item}
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {entry.highlights.length > 0 && (
                  <ul className="mb-7 grid gap-3">
                    {entry.highlights.map((item) => (
                      <li
                        className="flex gap-2 text-sm text-white/80"
                        key={item}
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {kind === "course" ? (
                  <CourseRegistrationForm
                    courseId={entry.id ?? entry.slug}
                    courseTitle={entry.title}
                  />
                ) : kind === "article" ? (
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      {t.detailPage.getInsightsTitle}
                    </h3>
                    <p className="mb-5 text-sm leading-6 text-white/65">
                      {t.detailPage.getInsightsDesc}
                    </p>
                    <NewsletterForm />
                  </div>
                ) : (
                  <ConsultationForm
                    compact
                    subject={`${uiLabels[kind].back}: ${entry.title}`}
                  />
                )}

                {/* Enterprise Assurance Trust Signals */}
                {kind !== "article" && t.detailPage.trustSignals && (
                  <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
                    <div className="flex items-start gap-2.5 text-xs text-white/75">
                      <ShieldCheck className="size-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white/90">{t.detailPage.trustSignals.ndaTitle}: </span>
                        <span>{t.detailPage.trustSignals.ndaDesc}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-white/75">
                      <Clock className="size-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white/90">{t.detailPage.trustSignals.slaTitle}: </span>
                        <span>{t.detailPage.trustSignals.slaDesc}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-white/75">
                      <Award className="size-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white/90">{t.detailPage.trustSignals.expertTitle}: </span>
                        <span>{t.detailPage.trustSignals.expertDesc}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {kind === "project" && entry.gallery?.length ? (
          <section
            className="site-container mt-16"
            aria-label="Project gallery"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entry.gallery.map((image, index) => (
                <figure
                  data-motion="tile"
                  className={
                    index === 0
                      ? "relative overflow-hidden rounded-2xl sm:col-span-2"
                      : "relative overflow-hidden rounded-2xl"
                  }
                  key={`${image.url}-${index}`}
                >
                  <Image
                    className="aspect-[4/3] h-full w-full object-cover"
                    src={image.url}
                    alt={image.alt}
                    width={image.width ?? 1000}
                    height={image.height ?? 750}
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
        ) : null}
        {kind === "course" && entry.curriculum?.length ? (
          <section className="site-container mt-16">
            <h2 className="mb-6 text-3xl font-semibold tracking-tight">
              {t.detailPage.curriculumTitle}
            </h2>
            <ol className="divide-y rounded-2xl border bg-card shadow-xs">
              {entry.curriculum.map((module, index) => (
                <li
                  className="grid gap-3 p-6 sm:grid-cols-[3.5rem_1fr]"
                  data-motion="tile"
                  key={module.id ?? `${module.title}-${index}`}
                >
                  <span className="font-mono text-base font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{module.title}</h3>
                    {module.description && (
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {module.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {/* Software & Tools Stack */}
            <div className="mt-10 rounded-2xl border bg-muted/30 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {t.detailPage.softwareStack}
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {[
                  "Autodesk Revit (Arch / Struct / MEP)",
                  "Navisworks Manage (Clash Detective)",
                  "Autodesk Construction Cloud (ACC / BIM 360)",
                  "Solibri Model Checker",
                  "Dynamo BIM & Python Automation",
                  "OpenBIM IFC4 & BCF Standards",
                ].map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs"
                  >
                    <Cpu className="size-3.5 text-teal-600 dark:text-teal-400" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Corporate B2B Cohort Training Banner */}
            <div className="mt-8 relative overflow-hidden rounded-2xl bg-brand-ink p-6 text-white sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="rounded bg-teal-500/20 px-2.5 py-1 text-xs font-bold text-teal-300 border border-teal-500/30">
                    B2B ENTERPRISE
                  </span>
                  <h3 className="mt-3 text-2xl font-bold text-white">
                    {t.detailPage.b2bTrainingTitle}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                    {t.detailPage.b2bTrainingDesc}
                  </p>
                </div>
                <Button asChild size="lg" className="shrink-0 bg-teal-500 hover:bg-teal-400 text-brand-ink font-bold">
                  <a href="#detail-enquiry">
                    {t.detailPage.b2bTrainingAction} <ArrowUpRight className="size-4 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {/* Project Standards & Deliverables Banner */}
        {kind === "project" && (
          <section className="site-container mt-12">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <Building2 className="size-5" />
                  <span>{t.detailPage.standardsCompliance}</span>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-500 shrink-0" />
                    <span>ISO 19650-1 & ISO 19650-2:2018 CDE Information Governance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-500 shrink-0" />
                    <span>AIA G202-2013 Building Information Modeling Protocol (LOD 300 - 500)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-500 shrink-0" />
                    <span>buildingSMART OpenBIM IFC4 & BCF 2.1 Coordination</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <FileText className="size-5" />
                  <span>{t.detailPage.deliverablesChecklist}</span>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {t.detailPage.deliverables.map((item) => (
                    <li className="flex items-center gap-2" key={item}>
                      <CheckCircle2 className="size-4 text-teal-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Blog / Insight Author Profile */}
        {kind === "article" && (
          <section className="site-container mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border bg-muted/40 p-6">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-white font-bold text-lg">
                B4
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {t.detailPage.authorProfileTitle}
                </p>
                <h3 className="text-base font-bold text-foreground mt-0.5">
                  {entry.authorName || "BIM4C Engineering Team"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.detailPage.authorRole}
                </p>
              </div>
            </div>
          </section>
        )}
        {related.length > 0 && (
          <section className="mt-20 border-t bg-muted/40 py-16">
            <div className="site-container">
              <header className="mb-8 flex items-end justify-between gap-5">
                <div>
                  <p className="eyebrow">{t.detailPage.keepExploring}</p>
                  <h2 className="text-3xl font-semibold tracking-[-.035em]">
                    {t.detailPage.relatedContent}
                  </h2>
                </div>
                <Button asChild variant="outline">
                  <Link href={backHref}>
                    {t.detailPage.viewAll} <ArrowUpRight />
                  </Link>
                </Button>
              </header>
              <div className="grid gap-6 md:grid-cols-3">
                {related.slice(0, 3).map((item) => (
                  <article className="group relative" key={item.slug} data-motion="tile">
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
                    <h3 className="mt-2 text-xl font-semibold leading-snug">
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
