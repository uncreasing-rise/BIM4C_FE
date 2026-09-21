"use client";

import { useLanguage } from "@/lib/i18n/context";
import Image from "next/image";

export const DEFAULT_PARTNERS = [
  { name: "Bitexco Group", src: "/images/partners/bitexco.png" },
  { name: "Ecopark", src: "/images/partners/ecopark.png" },
  { name: "Gamuda Land", src: "/images/partners/gamuda.png" },
  { name: "Masterise Homes", src: "/images/partners/masterise.png" },
  { name: "MIK Group", src: "/images/partners/mik.png" },
  { name: "Nam Long Group", src: "/images/partners/namlong.png" },
  { name: "Dacinco", src: "/images/partners/logo-dacinco.png" },
  { name: "Tecco 5", src: "/images/partners/logo-tecco5.png" },
  { name: "TDIC", src: "/images/partners/logo-tdic.png" },
  { name: "TCM", src: "/images/partners/logo-tcm.png" },
  { name: "Công ty Kiến trúc AVA", src: "/images/partners/logo-ava.png" },
  { name: "Viện Quy Hoạch Đô Thị", src: "/images/partners/logo-dothi.png" },
  { name: "Office of Cities & Architecture", src: "/images/partners/logo-office-of-cities.png" },
  { name: "Strader", src: "/images/partners/logo-strader.png" },
  { name: "ZFenix", src: "/images/partners/logo-zfenix.png" },
  { name: "OneBIM", src: "/images/partners/logo-onebim.png" },
  { name: "BTF", src: "/images/partners/logo-btf.png" },
  { name: "ATool", src: "/images/partners/logo-atool.png" },
  { name: "BSI", src: "/images/partners/logo-bsi.png" },
];

const LOGO_MAP: Record<string, string> = {
  "bitexco": "/images/partners/bitexco.png",
  "bitexco group": "/images/partners/bitexco.png",
  "ecopark": "/images/partners/ecopark.png",
  "gamuda": "/images/partners/gamuda.png",
  "gamuda land": "/images/partners/gamuda.png",
  "masterise": "/images/partners/masterise.png",
  "masterise homes": "/images/partners/masterise.png",
  "mik": "/images/partners/mik.png",
  "mik group": "/images/partners/mik.png",
  "nam long": "/images/partners/namlong.png",
  "nam long group": "/images/partners/namlong.png",
  "atool": "/images/partners/logo-atool.png",
  "a-tool": "/images/partners/logo-atool.png",
  "bsi": "/images/partners/logo-bsi.png",
  "btf": "/images/partners/logo-btf.png",
  "công ty kiến trúc ava": "/images/partners/logo-ava.png",
  "công ty ava": "/images/partners/logo-ava.png",
  "ava": "/images/partners/logo-ava.png",
  "dacinco": "/images/partners/logo-dacinco.png",
  "viện quy hoạch đô thị": "/images/partners/logo-dothi.png",
  "dothi": "/images/partners/logo-dothi.png",
  "dothico": "/images/partners/logo-dothi.png",
  "office of cities & architecture": "/images/partners/logo-office-of-cities.png",
  "office of cities_architecture": "/images/partners/logo-office-of-cities.png",
  "onebim": "/images/partners/logo-onebim.png",
  "strader": "/images/partners/logo-strader.png",
  "strader consult": "/images/partners/logo-strader.png",
  "tcm": "/images/partners/logo-tcm.png",
  "tcm construction": "/images/partners/logo-tcm.png",
  "tdic": "/images/partners/logo-tdic.png",
  "tecco 5": "/images/partners/logo-tecco5.png",
  "tecco5": "/images/partners/logo-tecco5.png",
  "zfenix": "/images/partners/logo-zfenix.png",
};

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
  const seenSrc = new Set<string>();
  const seenName = new Set<string>();

  const partners = rawList
    .map((p) => {
      const item = p as { name: string; src?: string; logo?: string };
      const normalizedName = item.name.toLowerCase().trim();
      const mappedLogo = LOGO_MAP[normalizedName];
      const directSrc = item.src || item.logo || "";
      const finalSrc = directSrc.startsWith("/images/partners/")
        ? directSrc
        : (mappedLogo || directSrc || "");
      return { name: item.name, src: finalSrc };
    })
    .filter((p): p is { name: string; src: string } => {
      if (!p.src || !p.name) return false;
      const normSrc = p.src.toLowerCase();
      const normName = p.name.toLowerCase().trim();
      if (seenSrc.has(normSrc) || seenName.has(normName)) return false;
      seenSrc.add(normSrc);
      seenName.add(normName);
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

        <div className="partner-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="partner-cell group relative flex flex-col items-center justify-center min-h-[96px] sm:min-h-[110px] rounded-2xl border border-border/80 bg-white dark:bg-card p-4 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1"
              data-motion="tile"
              title={partner.name}
            >
              <div className="relative h-11 w-full max-w-[120px] flex items-center justify-center">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 14vw"
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

