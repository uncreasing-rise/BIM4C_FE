"use client";

import { useLanguage } from "@/lib/i18n/context";
import Image from "next/image";

export const DEFAULT_PARTNERS = [
  { name: "ATool", src: "/images/partners/logo-atool.png" },
  { name: "BSI", src: "/images/partners/logo-bsi.jpg" },
  { name: "BTF", src: "/images/partners/logo-btf.png" },
  { name: "By Royal Charter", src: "/images/partners/logo-royal-charter.jpg" },
  { name: "Công ty Kiến trúc AVA", src: "/images/partners/logo-ava.png" },
  { name: "Dacinco", src: "/images/partners/logo-dacinco.png" },
  { name: "Viện Quy Hoạch Đô Thị", src: "/images/partners/logo-dothi.png" },
  { name: "Office of Cities & Architecture", src: "/images/partners/logo-office-of-cities.png" },
  { name: "OneBIM", src: "/images/partners/logo-onebim.png" },
  { name: "Strader", src: "/images/partners/logo-strader.png" },
  { name: "TCM", src: "/images/partners/logo-tcm.png" },
  { name: "TDIC", src: "/images/partners/logo-tdic.png" },
  { name: "Tecco 5", src: "/images/partners/logo-tecco5.png" },
  { name: "ZFenix", src: "/images/partners/logo-zfenix.png" },
];

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
  const rawList = customPartners && customPartners.length > 0 ? customPartners : DEFAULT_PARTNERS;
  const partners = rawList
    .map((p) => {
      const item = p as { name: string; src?: string; logo?: string };
      return { name: item.name, src: item.src || item.logo || "" };
    })
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

        <div className="partner-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="partner-cell group relative flex flex-col items-center justify-center min-h-[96px] sm:min-h-[110px] rounded-2xl border border-border/80 bg-white dark:bg-card p-4 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
              data-motion="tile"
              title={partner.name}
            >
              <div className="relative h-11 w-full max-w-[120px] flex items-center justify-center">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 14vw"
                  className="object-contain filter grayscale opacity-75 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 dark:brightness-125 dark:opacity-85 dark:group-hover:opacity-100"
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

