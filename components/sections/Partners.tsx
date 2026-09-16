"use client";

import { useLanguage } from "@/lib/i18n/context";
import Image from "next/image";

interface PartnersProps {
  compact?: boolean;
  customPartners?: Array<{
    name: string;
    logo?: string;
    src?: string;
    tag?: string;
  }>;
}

export function Partners({ compact = false, customPartners }: PartnersProps) {
  const { t } = useLanguage();
  const partners = (customPartners ?? [])
    .map((p) => ({ name: p.name, src: p.src || p.logo }))
    .filter((p): p is { name: string; src: string } => Boolean(p.src));
  if (!partners.length) return null;

  return (
    <section
      id="partners"
      data-home-section="partners"
      className={`partners-section border-y border-border bg-card/60 backdrop-blur-xs ${compact ? "py-12 lg:py-16" : "py-16 lg:py-24"}`}
      aria-label={t.partners.title}
    >
      <div className="site-container">
        <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t.partners.eyebrow}</p>
            <h2 className="section-title mt-1">{t.partners.title}</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {t.partners.description}
          </p>
        </header>

        <div className="partner-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="partner-cell group relative flex flex-col items-center justify-center min-h-[110px] sm:min-h-[124px] rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
              data-motion="tile"
            >
              <div className="relative h-12 w-full max-w-[130px] flex items-center justify-center">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-contain filter grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 dark:brightness-150 dark:opacity-80 dark:group-hover:opacity-100"
                />
              </div>
              <span className="sr-only">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
