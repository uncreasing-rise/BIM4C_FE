"use client";

import { Building2, HardHat, PencilRuler } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function ExpertiseStrip() {
  const { locale } = useLanguage();

  const isVi = locale === "vi";
  const partners = isVi
    ? [
        { icon: Building2, label: "Chủ đầu tư & Phát triển" },
        { icon: PencilRuler, label: "Tư vấn thiết kế" },
        { icon: HardHat, label: "Tổng thầu thi công" },
      ]
    : [
        { icon: Building2, label: "Owners & developers" },
        { icon: PencilRuler, label: "Design consultants" },
        { icon: HardHat, label: "Contractors" },
      ];

  return (
    <section className="border-b bg-white" aria-label="Who we work with">
      <div className="site-container flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
          {isVi
            ? "Một đối tác. Toàn diện cho đội ngũ dự án của bạn."
            : "One partner. Your whole project team."}
        </p>
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          {partners.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-xs font-medium sm:text-sm"
            >
              <Icon className="size-4 text-primary" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
