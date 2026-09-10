import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { legalDocuments } from "@/constants/legal-content";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";

export const metadata: Metadata = pageMetadata("Legal", "BIM4C privacy, terms of use and personal data protection information.", ROUTES.legal);

export default function LegalPage() {
  return (
    <main>
      <PageHero
        eyebrow="LEGAL INFORMATION"
        title="Transparency in every commitment"
        description="Policies and terms that apply when you visit, interact with and share information with BIM4C."
        image="/images/news-project-coordination.webp"
      />
      <section className="bg-muted py-16 lg:py-24">
        <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1220px] md:w-[calc(100%_-_48px)]">
          <header className="mb-10 max-w-[760px]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
              BIM4C LEGAL
            </p>
            <h2 className="text-4xl font-semibold text-foreground">
              Information you should know
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Choose a document below to learn how we operate this website and
              protect your rights as a user.
            </p>
          </header>
          <div className="grid grid-cols-1 border-l border-t border-border md:grid-cols-3">
            {legalDocuments.map((document, index) => (
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
                  Read document <b>→</b>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
