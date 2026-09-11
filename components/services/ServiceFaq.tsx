"use client";

import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function ServiceFaq() {
  const { t } = useLanguage();

  return (
    <section
      className="border-t bg-white py-12 lg:py-16"
      aria-labelledby="service-faq-title"
    >
      <div className="site-container grid gap-7 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div>
          <p className="eyebrow">{t.servicesPage.faqEyebrow}</p>
          <h2 id="service-faq-title" className="section-title">
            {t.servicesPage.faqTitle}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {t.servicesPage.faqDesc}
          </p>
        </div>
        <div className="divide-y border-y">
          {t.servicesPage.faqs.map(({ question, answer }) => (
            <details key={question} className="group py-1">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                {question}
                <Plus
                  className="size-5 shrink-0 text-primary transition-transform group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
