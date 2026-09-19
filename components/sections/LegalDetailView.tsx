"use client";

import { usePublicMotion } from "@/components/motion/hooks/use-public-motion";

import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/PageHero";
import { getLegalDocument } from "@/constants/legal-content";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";

export function LegalDetailView({ slug }: { slug: string }) {
  usePublicMotion();
  const { t, locale } = useLanguage();
  const document = getLegalDocument(slug, locale);
  if (!document) notFound();

  return (
    <main>
      <PageHero
        breadcrumbs={[
          { label: t.navigation.legal, href: ROUTES.legal },
          { label: document.title },
        ]}
        eyebrow={t.legalPage.sectionEyebrow}
        title={document.title}
        description={document.summary}
        image="/images/news-project-coordination.webp"
      />
      <article className="bg-background py-16 lg:py-24">
        <div className="site-container grid grid-cols-1 items-start gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <aside className="border-t-4 border-primary bg-muted/60 rounded-xl p-6 lg:sticky lg:top-[110px]">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {locale === "vi" ? "CẬP NHẬT LẦN CUỐI" : "LAST UPDATED"}
            </p>
            <strong className="mt-1 block text-sm text-foreground">
              {document.updatedAt}
            </strong>
            <nav
              className="mt-6 border-t border-border"
              aria-label={t.detailPage.onThisPage}
            >
              {document.sections.map((section, index) => (
                <a
                  className="flex gap-3 border-b border-border py-3 text-sm text-muted-foreground hover:text-primary"
                  key={section.title}
                  href={`#legal-section-${index + 1}`}
                >
                  <span className="text-xs font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>
          <div>
            {document.sections.map((section, index) => (
              <section
                className="mb-12 grid grid-cols-[36px_minmax(0,1fr)] gap-4 border-b border-border pb-10 md:grid-cols-[54px_minmax(0,1fr)]"
                id={`legal-section-${index + 1}`}
                key={section.title}
              >
                <span className="pt-1 text-xs font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="mb-5 text-2xl font-semibold text-foreground">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p
                      className="mb-4 leading-[1.8] text-muted-foreground"
                      key={paragraph}
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.items && (
                    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                      {section.items.map((item, idx) => (
                        <li key={`${section.title}-item-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="site-container mt-12 border-t border-border pt-6">
          <Link
            className="text-xs font-semibold uppercase text-primary"
            href={ROUTES.legal}
          >
            ← {locale === "vi" ? "Tất cả thông tin pháp lý" : "All legal information"}
          </Link>
        </div>
      </article>
    </main>
  );
}
