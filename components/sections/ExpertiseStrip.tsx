"use client";

import { useLanguage } from "@/lib/i18n/context";

export function ExpertiseStrip() {
  const { t } = useLanguage();
  const stats = t.aboutPage.trackRecord.metrics.map((metric) => ({
    num: metric.value,
    label: metric.label,
    sub: metric.subtext,
  }));
  return (
    <section
      className="border-y border-border/70 bg-card/75 backdrop-blur-md relative overflow-hidden"
      aria-label={t.aboutPage.trackRecord.title}
    >
      <div className="site-container py-7">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-border/60">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex flex-col justify-center ${idx !== 0 ? "md:pl-6" : ""}`}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight text-primary sm:text-3xl lg:text-4xl">
                  {stat.num}
                </span>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-foreground/90 sm:text-sm">
                {stat.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/80 font-normal">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
