"use client";

import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function ServiceFaq() {
  const { t } = useLanguage();

  return (
    <section
      className="border-t bg-muted/20 py-16 lg:py-24"
      aria-labelledby="service-faq-title"
    >
      <div className="site-container grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
        <div>
          <p className="eyebrow">{t.servicesPage.faqEyebrow}</p>
          <h2 id="service-faq-title" className="section-title">
            {t.servicesPage.faqTitle}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {t.servicesPage.faqDesc}
          </p>
        </div>
        <div className="space-y-4">
          {t.servicesPage.faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground">
                <span>{question}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted transition-colors group-open:bg-primary group-open:text-white">
                  <Plus
                    className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <p className="mt-4 border-t pt-4 text-sm leading-7 text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
