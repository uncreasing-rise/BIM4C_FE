"use client";

import { useLanguage } from "@/lib/i18n/context";

export function ExpertiseStrip() {
  const { locale } = useLanguage();
  const isVi = locale === "vi";

  const stats = [
    {
      num: "150+",
      label: isVi ? "Dự án BIM đã bàn giao" : "BIM Projects Delivered",
      sub: isVi ? "Cao tầng & Hạ tầng kỹ thuật" : "High-rise & Infrastructure",
    },
    {
      num: "99.8%",
      label: isVi ? "Tỷ lệ xử lý xung đột mô hình" : "Clash Resolution Rate",
      sub: isVi ? "Xử lý va chạm trước thi công" : "Pre-construction coordination",
    },
    {
      num: "5,000+",
      label: isVi ? "Lượt kỹ sư & học viên đào tạo" : "Engineers & Trainees Trained",
      sub: isVi ? "Chương trình thực tế BIM4C" : "Hands-on BIM Curriculum",
    },
    {
      num: "100%",
      label: isVi ? "Quy trình chuẩn ISO 19650" : "ISO 19650 Standard Workflow",
      sub: isVi ? "OpenBIM & CDE phối hợp" : "OpenBIM & CDE Coordination",
    },
  ];

  return (
    <section className="border-y border-border/70 bg-card/75 backdrop-blur-md relative overflow-hidden" aria-label="Key Performance Indicators">
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
