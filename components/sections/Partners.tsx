"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";

const defaultPartners = [
  {
    name: "Masterise Homes",
    src: "/images/partners/transparent/masterise.png",
  },
  { name: "Gamuda Land", src: "/images/partners/transparent/gamuda.png" },
  { name: "Ecopark", src: "/images/partners/transparent/ecopark.png" },
  { name: "Nam Long", src: "/images/partners/transparent/namlong.png" },
  { name: "MIK Group", src: "/images/partners/mik.png" },
  { name: "Bitexco Group", src: "/images/partners/bitexco.png" },
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
  const partners = customPartners?.length
    ? customPartners.map((p) => ({
        name: p.name,
        src: p.src || p.logo || "/images/partners/transparent/masterise.png",
      }))
    : defaultPartners;
  return (
    <section
      data-home-section="partners"
      className={`partners-section border-y border-border bg-card ${compact ? "py-12" : "py-16 lg:py-20"}`}
      aria-label={t.partners.title}
    >
      <div className="site-container">
        <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t.partners.eyebrow}</p>
            <h2 className="section-title">{t.partners.title}</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            {t.partners.description}
          </p>
        </header>
        <div className="partner-grid">
          {partners.map((partner) => (
            <div key={partner.name} className="partner-cell" data-motion="tile">
              <div className="relative h-14 w-full max-w-40">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
