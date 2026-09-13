"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  Share2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";
import type { ContentEntry } from "@/types/content";
import { ContentBlockRenderer } from "@/components/shared/ContentBlockRenderer";
import { PageHero } from "@/components/shared/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, contentSchema } from "@/lib/seo/structured-data";
import { toLocalizedLabel } from "@/lib/utils/public-labels";
import { useLanguage } from "@/lib/i18n/context";
import { localizeContent, localizeContentList } from "@/lib/i18n/localize";
import { legacyBlocks } from "@/lib/utils/legacy-blocks";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

interface BlogDetailViewProps {
  entry: ContentEntry;
  related?: ContentEntry[];
  backHref?: string;
}

export function BlogDetailView({
  entry: rawEntry,
  related: rawRelated = [],
  backHref = ROUTES.blog,
}: BlogDetailViewProps) {
  usePublicMotion();
  const { t, locale } = useLanguage();
  const entry = localizeContent(rawEntry, locale);
  const related = localizeContentList(rawRelated, locale);

  const isVi = locale === "vi";
  const detailPath = `${backHref}/${entry.slug}`;
  const breadcrumbItems = [
    { name: t.navigation.home, path: "/" },
    { name: t.detailPage.backBlog, path: backHref },
    { name: entry.title, path: detailPath },
  ];

  const blocks = entry.contentBlocks ?? legacyBlocks(entry);
  const headings = blocks.filter(
    (block) => block.type === "rich-text" && block.heading,
  );

  const formattedDate = entry.publishedAt
    ? new Intl.DateTimeFormat(isVi ? "vi-VN" : "en-GB", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(entry.publishedAt))
    : null;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success(
        isVi
          ? "Đã sao chép liên kết bài viết vào bộ nhớ tạm!"
          : "Article link copied to clipboard!",
      );
    }
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbItems),
          contentSchema("article", entry, detailPath),
        ]}
      />
      <PageHero
        eyebrow={toLocalizedLabel(entry.eyebrow, locale)}
        title={entry.title}
        description={entry.description}
        image={entry.image}
        breadcrumbs={breadcrumbItems.map((item, index) => ({
          label: item.name,
          href: index < breadcrumbItems.length - 1 ? item.path : undefined,
        }))}
      />
      <article className="bg-background py-8 lg:py-12 pb-24 lg:pb-16" data-motion="detail">
        <div className="site-container">
          {/* Editorial Meta Bar */}
          <div
            className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-5"
            data-motion="reveal"
          >
            <Button asChild variant="ghost" className="px-0">
              <Link href={backHref}>
                <ArrowLeft /> {t.detailPage.backBlog}
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {formattedDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  <span>{isVi ? "Xuất bản:" : "Published:"}</span>
                  <time dateTime={entry.publishedAt} className="font-medium text-foreground">
                    {formattedDate}
                  </time>
                </div>
              )}
              {entry.authorName && (
                <div className="flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  <span>{t.detailPage.byAuthor}</span>
                  <strong className="font-semibold text-foreground">
                    {entry.authorName}
                  </strong>
                </div>
              )}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                aria-label={isVi ? "Chia sẻ bài viết" : "Share article"}
              >
                <Share2 className="size-3" />
                <span>{isVi ? "Chia sẻ" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Table of contents - Only displayed if article has 2+ headings */}
          {headings.length >= 2 && (
            <div
              className="mb-10 rounded-2xl border border-border bg-card/60 backdrop-blur p-5 sm:p-6 shadow-xs"
              data-motion="reveal"
            >
              <nav aria-label={t.detailPage.onThisPage}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/70">
                  <BookOpen className="size-4 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {t.detailPage.onThisPage}
                  </p>
                </div>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {headings.map((block, idx) => {
                    const anchorId = block.id ? block.id.replace(/^block-/, "") : "";
                    return (
                      <li key={block.id}>
                        <a
                          className="group flex items-start gap-2.5 py-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          href={`#${anchorId}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(anchorId);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth" });
                              history.pushState(null, "", `#${anchorId}`);
                            }
                          }}
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {idx + 1}
                          </span>
                          <span className="underline-offset-4 group-hover:underline leading-snug">
                            {block.type === "rich-text" ? block.heading : ""}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          )}

          {/* 2-Column: Article Body + Newsletter Subscription */}
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            <div className="min-w-0" data-motion="reveal">
              <ContentBlockRenderer blocks={blocks} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              {/* Newsletter Subscription Card */}
              <Card
                className="gap-0 overflow-hidden rounded-2xl bg-brand-ink p-0 text-white ring-0 border border-white/10 shadow-xl"
                data-motion="tile"
              >
                <CardHeader className="border-b border-white/10 p-5 bg-white/[0.02]">
                  <CardTitle className="text-lg text-white">
                    {t.detailPage.getInsightsTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="mb-4 text-xs leading-relaxed text-white/70">
                    {t.detailPage.getInsightsDesc}
                  </p>
                  <NewsletterForm />
                </CardContent>
              </Card>

              {/* Author & Editorial note */}
              <div className="rounded-2xl border bg-card p-5 shadow-2xs text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-1">
                  {isVi ? "Về ban biên tập BIM4C" : "About BIM4C Editorial"}
                </p>
                <p>
                  {isVi
                    ? "Các bài viết chuyên môn được biên soạn bởi các chuyên gia và kỹ sư BIM của BIM4C nhằm chia sẻ kiến thức chuyển đổi số trong xây dựng."
                    : "Technical insights and case analysis authored by BIM4C specialists to advance digital construction practices."}
                </p>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <section className="site-container mt-16 border-t pt-12" aria-label="Related articles">
            <div>
              <header className="mb-8 flex items-center justify-between">
                <div>
                  <p className="eyebrow">{t.detailPage.keepExploring}</p>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                    {isVi ? "Bài viết cùng chủ đề" : "Related articles"}
                  </h2>
                </div>
                <Button asChild variant="outline">
                  <Link href={backHref}>
                    {t.detailPage.viewAll} <ArrowRight className="size-4 ml-1" />
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
