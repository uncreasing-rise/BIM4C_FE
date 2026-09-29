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
  // Partners come only from the admin list; an empty list hides the section.
  const seen = new Set<string>();
  const partners = (customPartners ?? [])
    .map((item) => ({
      name: item.name?.trim() ?? "",
      src: (item.src || item.logo || "").trim(),
    }))
    .filter((p) => {
      const key = p.name.toLowerCase();
      if (!p.name || !p.src || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

        {/* Cells of a fixed size, centred: a short partner list stays balanced. */}
        <div className="partner-grid grid grid-cols-2 justify-center gap-4 sm:grid-cols-[repeat(auto-fit,minmax(200px,240px))] sm:gap-5">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="partner-cell group relative flex flex-col items-center justify-center min-h-[130px] sm:min-h-[160px] rounded-2xl border border-border/80 bg-white dark:bg-card p-4 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1"
              data-motion="tile"
              title={partner.name}
            >
              <div className="relative h-20 w-full max-w-[170px] flex items-center justify-center sm:h-24 sm:max-w-[210px]">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 210px"
                  className="object-contain brightness-100 opacity-100 transition-all duration-300 group-hover:scale-110 dark:brightness-110"
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
