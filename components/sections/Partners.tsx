"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";

const partners = [
  { name: "Masterise Homes", src: "/images/partners/transparent/masterise.png", tag: "Strategic Client" },
  { name: "Gamuda Land", src: "/images/partners/transparent/gamuda.png", tag: "International Developer" },
  { name: "Ecopark", src: "/images/partners/transparent/ecopark.png", tag: "Eco-Urban Developer" },
  { name: "Nam Long", src: "/images/partners/transparent/namlong.png", tag: "Major Developer" },
  { name: "MIK Group", src: "/images/partners/mik.png", tag: "High-Rise Development" },
  { name: "Bitexco Group", src: "/images/partners/bitexco.png", tag: "Infrastructure & Commercial" },
] as const;

export function Partners({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  // Duplicate for smooth seamless loop
  const marqueeItems = [...partners, ...partners];

  return (
    <section
      className="relative overflow-hidden bg-brand-ink py-14 text-white lg:py-18 border-y border-white/10"
      aria-label="Selected partners"
    >
      <div className="site-container relative z-10 mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-teal-300">{t.partners.eyebrow}</p>
          <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl text-white">
            {t.partners.title}
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-zinc-300 sm:text-sm">
          {t.partners.description}
        </p>
      </div>

      {/* Marquee Container with Left & Right Gradient Fades */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left Fade Mask */}
        <div className="pointer-events-none absolute left-0 inset-y-0 z-20 w-8 sm:w-20 md:w-36 lg:w-44 bg-gradient-to-r from-brand-ink via-brand-ink/80 to-transparent" />
        {/* Right Fade Mask */}
        <div className="pointer-events-none absolute right-0 inset-y-0 z-20 w-8 sm:w-20 md:w-36 lg:w-44 bg-gradient-to-l from-brand-ink via-brand-ink/80 to-transparent" />

        <div className="animate-marquee flex items-center gap-6">
          {marqueeItems.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="group flex h-24 w-52 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] p-4 backdrop-blur-md transition-all duration-300 hover:border-teal-400/50 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-teal-900/20"
            >
              <div className="relative h-10 w-36 grayscale opacity-75 contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
              <span className="mt-1.5 text-[10px] font-medium text-teal-300/80 group-hover:text-teal-200">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
