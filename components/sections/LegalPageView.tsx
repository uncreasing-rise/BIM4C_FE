"use client";

import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { getLegalDocuments } from "@/constants/legal-content";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";

export function LegalPageView() {
  const { t, locale } = useLanguage();
  const documents = getLegalDocuments(locale);

  return (
    <main>
      <PageHero
        eyebrow={t.legalPage.eyebrow}
        title={t.legalPage.heroTitle}
        description={t.legalPage.heroDesc}
        image="/images/news-project-coordination.webp"
      />
      <section className="bg-muted py-16 lg:py-24">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1220px] md:w-[calc(100%_-_48px)]">
          <header className="mb-10 max-w-[760px]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
              {t.legalPage.sectionEyebrow}
            </p>
            <h2 className="text-4xl font-semibold text-foreground">
              {t.legalPage.sectionTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t.legalPage.sectionDesc}
            </p>
          </header>
          <div className="grid grid-cols-1 border-l border-t border-border md:grid-cols-3">
            {documents.map((document, index) => (
              <article
                className="flex min-h-[300px] flex-col border-b border-r border-border bg-background p-7"
                key={document.slug}
              >
                <span className="text-xs font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mb-3 mt-12 text-2xl font-semibold text-foreground">
                  {document.title}
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {document.summary}
                </p>
                <Link
                  className="mt-auto text-xs font-semibold uppercase text-primary"
                  href={ROUTES.legalDetail(document.slug)}
                >
                  {t.legalPage.readDocument} <b>→</b>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
