import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { CourseRegistrationForm } from "@/features/contact/components/CourseRegistrationForm";
import type { Project } from "@/features/projects/types/project";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";
import type { ContentEntry } from "@/types/content";
import { ContentBlockRenderer } from "./ContentBlockRenderer";
import { PageHero } from "./PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, contentSchema } from "@/lib/seo/structured-data";

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

const uiLabels: Record<DetailKind, { aside: string; back: string }> = {
  course: { aside: "Thông tin khóa học", back: "Khóa học" },
  project: { aside: "Hồ sơ dự án", back: "Dự án" },
  article: { aside: "Thông tin bài viết", back: "Bài viết" },
  service: { aside: "Thông tin dịch vụ", back: "Dịch vụ" },
};

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
  entry,
  backHref,
  backLabel,
  kind = "service",
  related = [],
}: {
  entry: DetailEntry;
  backHref: string;
  backLabel: string;
  kind?: DetailKind;
  related?: ContentEntry[];
}) {
  const blocks = entry.contentBlocks ?? legacyBlocks(entry);
  const detailPath = `${backHref}/${entry.slug}`;
  const breadcrumbItems = [{ name: "Trang chủ", path: "/" }, { name: uiLabels[kind].back, path: backHref }, { name: entry.title, path: detailPath }];
  const projectProfile =
    kind === "project"
      ? [
          ["Chủ đầu tư", entry.investor],
          ["Địa điểm", entry.location],
          ["Quy mô", entry.scale],
          ["Gói thầu", entry.contractPackage],
          ["Hoàn thành", entry.expectedCompletion ?? entry.year],
          ["Trạng thái", entry.status],
        ].filter((item): item is [string, string] => Boolean(item[1]))
      : [];
  const courseProfile =
    kind === "course"
      ? [
          ["Thời lượng", entry.duration],
          ["Trình độ", entry.level],
          ["Học phí", entry.price],
          ["Giảng viên", entry.instructor],
        ].filter((item): item is [string, string] => Boolean(item[1]))
      : [];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbItems), contentSchema(kind, entry, detailPath)]} />
      <PageHero
        eyebrow={
          entry.meta ? `${entry.eyebrow} · ${entry.meta}` : entry.eyebrow
        }
        title={entry.title}
        description={entry.description}
        image={entry.image}
        breadcrumbs={breadcrumbItems.map((item, index) => ({ label: item.name, href: index < breadcrumbItems.length - 1 ? item.path : undefined }))}
      />
      <article className="bg-background py-16 lg:py-24">
        <div className="site-container">
          <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
            <Button asChild variant="ghost" className="px-0">
              <Link href={backHref}>
                <ArrowLeft /> {backLabel}
              </Link>
            </Button>
            {(entry.authorName || entry.publishedAt) && (
              <p className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                {entry.publishedAt && <time dateTime={entry.publishedAt}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(entry.publishedAt))}</time>}
                {entry.authorName && <span>
                Tác giả:{" "}
                <strong className="text-foreground">{entry.authorName}</strong>
                </span>}
              </p>
            )}
          </div>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
            <div className="min-w-0">
              <ContentBlockRenderer blocks={blocks} />
            </div>
            <Card className="gap-0 overflow-hidden rounded-3xl bg-brand-ink p-0 text-white ring-0 lg:sticky lg:top-28">
              <CardHeader className="border-b border-white/10 p-6">
                <Badge className="mb-3 w-fit bg-white/10 text-white">
                  {uiLabels[kind].aside}
                </Badge>
                <CardTitle className="text-2xl text-white">
                  {entry.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {projectProfile.length > 0 && (
                  <dl className="mb-6">
                    {projectProfile.map(([label, value]) => (
                      <div
                        className="border-b border-white/10 py-3"
                        key={label}
                      >
                        <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                          {label}
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-white/85">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {courseProfile.length > 0 && (
                  <dl className="mb-6">
                    {courseProfile.map(([label, value]) => (
                      <div
                        className="border-b border-white/10 py-3"
                        key={label}
                      >
                        <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                          {label}
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-white/85">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
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
                ) : (
                  <ConsultationForm
                    compact
                    subject={`${uiLabels[kind].back}: ${entry.title}`}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {kind === "project" && entry.gallery?.length ? (
          <section className="site-container mt-16" aria-label="Thư viện dự án">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entry.gallery.map((image, index) => (
                <figure
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
              Nội dung chương trình
            </h2>
            <ol className="divide-y rounded-2xl border">
              {entry.curriculum.map((module, index) => (
                <li
                  className="grid gap-3 p-5 sm:grid-cols-[3rem_1fr]"
                  key={module.id ?? `${module.title}-${index}`}
                >
                  <span className="font-mono text-sm text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold">{module.title}</h3>
                    {module.description && (
                      <p className="mt-2 leading-7 text-muted-foreground">
                        {module.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        {related.length > 0 && (
          <section className="mt-20 border-t bg-muted/40 py-16">
            <div className="site-container">
              <header className="mb-8 flex items-end justify-between gap-5">
                <div>
                  <p className="eyebrow">Khám phá thêm</p>
                  <h2 className="text-3xl font-semibold tracking-[-.035em]">
                    Nội dung liên quan
                  </h2>
                </div>
                <Button asChild variant="outline">
                  <Link href={backHref}>
                    Xem tất cả <ArrowUpRight />
                  </Link>
                </Button>
              </header>
              <div className="grid gap-6 md:grid-cols-3">
                {related.slice(0, 3).map((item) => (
                  <article className="group relative" key={item.slug}>
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
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-snug">
                      {item.title}
                    </h3>
                    <Link
                      className="absolute inset-0"
                      href={`${backHref}/${item.slug}`}
                      aria-label={`Xem ${item.title}`}
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
