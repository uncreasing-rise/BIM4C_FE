"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { getLegalDocuments } from "@/constants/legal-content";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";

export function LegalPageView() {
  usePublicMotion();
  const { t, locale } = useLanguage();
  const documents = getLegalDocuments(locale);

  return (
    <main>
      <PageHero
        breadcrumbs={[{ label: t.navigation.legal }]}
        eyebrow={t.legalPage.eyebrow}
        title={t.legalPage.heroTitle}
        description={t.legalPage.heroDesc}
        image="/images/news-project-coordination.webp"
      />
      <section className="bg-muted/40 py-16 lg:py-24 border-t border-border/70">
        <div className="site-container">
          <header className="mb-10 max-w-2xl">
            <p className="eyebrow">
              {t.legalPage.sectionEyebrow}
            </p>
            <h2 className="section-title">
              {t.legalPage.sectionTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t.legalPage.sectionDesc}
            </p>
          </header>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {documents.map((document, index) => (
              <article
                className="group relative flex min-h-[300px] flex-col justify-between rounded-2xl border bg-card p-8 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-primary/40"
                key={document.slug}
                data-motion="tile"
              >
                <div>
                  <span className="inline-block font-mono text-xs font-bold text-primary rounded-md bg-primary/10 px-2.5 py-1">
                    DOC {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-3 mt-6 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {document.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {document.summary}
                  </p>
                </div>
                <Link
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary"
                  href={ROUTES.legalDetail(document.slug)}
                >
                  <span>{t.legalPage.readDocument}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
