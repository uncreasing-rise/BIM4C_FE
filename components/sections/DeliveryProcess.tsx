"use client";

import { ClipboardList, Network, ScanLine, FolderCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function DeliveryProcess() {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  const steps = [
    {
      icon: ClipboardList,
      phase: "PHASE 01",
      title: isVi ? "Xác định & Lập BEP" : "Define & BEP Setup",
      text: isVi
        ? "Thống nhất phạm vi, yêu cầu thông tin EIR, ma trận LOD và phân định trách nhiệm CDE."
        : "Agree scope, EIR information requirements, LOD matrix and CDE responsibilities.",
      output: isVi ? "BIM Execution Plan (BEP)" : "BIM Execution Plan",
      tag: "ISO 19650-1",
    },
    {
      icon: Network,
      phase: "PHASE 02",
      title: isVi ? "Mô hình & Kết nối" : "Modeling & Integration",
      text: isVi
        ? "Đưa các bộ môn Kiến trúc, Kết cấu, MEP và tài liệu vào quy trình làm việc phối hợp chung."
        : "Bring Architecture, Structure, MEP models and specs into a unified federated CDE workflow.",
      output: isVi ? "Mô hình phối hợp đa bộ môn" : "Federated Model",
      tag: "OpenBIM IFC4",
    },
    {
      icon: ScanLine,
      phase: "PHASE 03",
      title: isVi ? "Xử lý xung đột (Clash)" : "Clash Resolution",
      text: isVi
        ? "Kiểm soát chất lượng tự động, phát hiện và điều phối giải quyết triệt để 100% xung đột."
        : "Automated clash detection, issue matrix tracking and multi-discipline coordination sign-off.",
      output: isVi ? "Báo cáo BCF & Không xung đột" : "Zero Clash BCF Report",
      tag: "BCF / Navisworks",
    },
    {
      icon: FolderCheck,
      phase: "PHASE 04",
      title: isVi ? "Bàn giao & Vận hành" : "Digital Handover",
      text: isVi
        ? "Kiểm tra sản phẩm bàn giao, trích xuất khối lượng QTO và chuẩn bị dữ liệu COBie cho Digital Twin."
        : "Verify outputs, extract accurate QTO quantities and assemble COBie data for Digital Twin/FM.",
      output: isVi ? "Dữ liệu COBie & As-Built" : "COBie & As-Built Twin",
      tag: "COBie / 7D FM",
    },
  ];

  return (
    <section className="border-y border-border/70 bg-gradient-to-b from-muted/40 via-background to-muted/20 py-16 lg:py-20 relative overflow-hidden" id="our-process">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute -left-20 top-1/2 size-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />

      <div className="site-container relative">
        <header className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <p className="eyebrow m-0">{t.deliveryProcess.eyebrow}</p>
            </div>
            <h2 className="section-title">{t.deliveryProcess.title}</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            {t.deliveryProcess.description}
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, phase, title, text, output, tag }) => (
            <div
              key={title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Step Top */}
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wide text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {phase}
                  </span>
                </div>

                <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2.5 py-1 text-[11px] font-medium text-foreground/80 border border-border/60">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span>{tag}</span>
                </div>

                <h3 className="mt-2.5 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>

              {/* Step Output Box */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5 transition-colors group-hover:border-primary/40 group-hover:bg-primary/[0.06]">
                <span className="block text-[11px] font-semibold text-primary">
                  {isVi ? "Sản phẩm đầu ra:" : "Key deliverable:"}
                </span>
                <p className="mt-1 text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary shrink-0" />
                  <span>{output}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
