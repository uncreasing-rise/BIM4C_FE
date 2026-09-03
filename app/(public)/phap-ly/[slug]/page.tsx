import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/PageHero";
import { getLegalDocument, legalDocuments } from "@/constants/legal-content";
import { ROUTES } from "@/constants/routes";

export function generateStaticParams() {
  return legalDocuments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const document = getLegalDocument((await params).slug);
  return document
    ? { title: `${document.title} | BIM4C`, description: document.summary }
    : {};
}

export default async function LegalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const document = getLegalDocument((await params).slug);
  if (!document) notFound();
  return (
    <main>
      <PageHero
        eyebrow="PHÁP LÝ BIM4C"
        title={document.title}
        description={document.summary}
        image="/images/news-project-coordination.webp"
      />
      <article className="bg-white py-16 lg:py-24">
        <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1220px] grid-cols-1 items-start gap-10 md:w-[calc(100%_-_48px)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <aside className="border-t-4 border-primary bg-muted p-6 lg:sticky lg:top-[110px]">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              CẬP NHẬT
            </p>
            <strong className="mt-1 block text-sm text-foreground">
              {document.updatedAt}
            </strong>
            <nav
              className="mt-6 border-t border-border"
              aria-label="Mục lục"
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
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-12 w-[calc(100%_-_32px)] max-w-[1220px] border-t border-border pt-6 md:w-[calc(100%_-_48px)]">
          <Link
            className="text-xs font-semibold uppercase text-primary"
            href={ROUTES.legal}
          >
            ← Tất cả thông tin pháp lý
          </Link>
        </div>
      </article>
    </main>
  );
}
