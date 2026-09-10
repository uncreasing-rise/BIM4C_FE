"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

const partners = [
  ["Masterise Homes", "/images/partners/transparent/masterise.png"],
  ["Nam Long", "/images/partners/transparent/namlong.png"],
  ["Gamuda Land", "/images/partners/transparent/gamuda.png"],
  ["Ecopark", "/images/partners/transparent/ecopark.png"],
] as const;

export function Partners({ compact = false }: { compact?: boolean }) {
  const [paused, setPaused] = useState(false);
  return (
    <section className="relative overflow-hidden bg-brand-ink text-white">
      <div className="absolute -left-32 top-1/2 size-80 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div
        className={`site-container relative ${compact ? "py-14" : "py-20 lg:py-24"}`}
      >
        <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:gap-20">
          <div data-motion="reveal">
            <p className="eyebrow">Selected partners</p>
            <h2 className="max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-.05em] sm:text-5xl">
              Shared ambition. Long-term value.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-zinc-400">
              BIM4C works with leading owners and contractors to turn project
              data into measurable quality, progress and performance.
            </p>
            <div className="mt-9 flex items-end gap-4 border-t border-white/10 pt-6">
              <strong className="text-5xl font-semibold tracking-[-.05em] text-primary">
                120+
              </strong>
              <span className="max-w-32 pb-1 text-xs font-medium uppercase leading-5 tracking-[.12em] text-zinc-500">
                Trusted clients &amp; partners
              </span>
            </div>
          </div>
          <div className="partner-marquee py-3" data-motion="reveal">
            <div
              className="partner-track"
              style={{ animationPlayState: paused ? "paused" : "running" }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              {[...partners, ...partners].map(([name, src], index) => (
                <div
                  className="group grid h-36 w-56 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.06] p-7 transition-colors hover:border-primary/40 hover:bg-white/10 sm:w-64"
                  key={`${name}-${index}`}
                  aria-hidden={index >= partners.length}
                >
                  <Image
                    className="max-h-16 w-auto max-w-[85%] object-contain opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                    src={src}
                    alt={index < partners.length ? name : ""}
                    width={200}
                    height={80}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[.16em] text-zinc-500">
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 px-3 transition hover:border-primary hover:text-white"
                onClick={() => setPaused((value) => !value)}
                aria-pressed={paused}
              >
                {paused ? (
                  <Play className="size-3" />
                ) : (
                  <Pause className="size-3" />
                )}
                {paused ? "Play partners" : "Pause partners"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
