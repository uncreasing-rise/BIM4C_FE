"use client";

import { Building2, HardHat, PencilRuler, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function ExpertiseStrip() {
  const { locale } = useLanguage();
  const isVi = locale === "vi";

  const stats = [
    {
      num: "150+",
      label: isVi ? "Dự án BIM đã bàn giao" : "BIM Projects Delivered",
      sub: isVi ? "Đô thị & Cao tầng" : "High-rise & Complex",
    },
    {
      num: "99.8%",
      label: isVi ? "Độ chính xác mô hình" : "Model Accuracy",
      sub: isVi ? "Chuẩn LOD 300 - 500" : "LOD 300 - 500 Specs",
    },
    {
      num: "5,000+",
      label: isVi ? "Kỹ sư & Quản lý đào tạo" : "Engineers Certified",
      sub: isVi ? "Academy chuẩn quốc tế" : "International Curriculum",
    },
    {
      num: "100%",
      label: isVi ? "Chuẩn OpenBIM ISO 19650" : "ISO 19650 Compliant",
      sub: isVi ? "Không phụ thuộc phần mềm" : "Software Agnostic",
    },
  ];

  return (
    <section className="border-y border-border/80 bg-card/60 backdrop-blur-md relative overflow-hidden" aria-label="Key Performance Indicators">
      {/* Subtle blueprint grid line */}
      <div className="site-container py-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-border/60">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex flex-col justify-center ${idx !== 0 ? "md:pl-6" : ""}`}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl bg-gradient-to-r from-primary via-teal-600 to-teal-400 bg-clip-text text-transparent">
                  {stat.num}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-foreground/90 sm:text-sm">
                {stat.label}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
