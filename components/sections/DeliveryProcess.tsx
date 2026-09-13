"use client";

import {
  ClipboardList,
  Network,
  ScanLine,
  FolderCheck,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function DeliveryProcess() {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  const steps = [
    {
      icon: ClipboardList,
      phase: "01",
      title: isVi ? "Xác định & Lập BEP" : "Define & BEP Setup",
      text: isVi
        ? "Thống nhất phạm vi, yêu cầu thông tin EIR, ma trận LOD và phân định trách nhiệm CDE."
        : "Agree scope, EIR information requirements, LOD matrix and CDE responsibilities.",
      output: isVi ? "BIM Execution Plan (BEP)" : "BIM Execution Plan",
      tag: "ISO 19650-1",
    },
    {
      icon: Network,
      phase: "02",
      title: isVi ? "Mô hình & Kết nối" : "Modeling & Integration",
      text: isVi
        ? "Đưa các bộ môn Kiến trúc, Kết cấu, MEP và tài liệu vào quy trình làm việc phối hợp chung."
        : "Bring Architecture, Structure, MEP models and specs into a unified federated CDE workflow.",
      output: isVi ? "Mô hình phối hợp đa bộ môn" : "Federated Model",
      tag: "OpenBIM IFC4",
    },
    {
      icon: ScanLine,
      phase: "03",
      title: isVi ? "Xử lý xung đột (Clash)" : "Clash Resolution",
      text: isVi
        ? "Kiểm soát chất lượng tự động, phát hiện và điều phối giải quyết triệt để 100% xung đột."
        : "Automated clash detection, issue matrix tracking and multi-discipline coordination sign-off.",
      output: isVi ? "Báo cáo BCF & Không xung đột" : "Zero Clash BCF Report",
      tag: "BCF / Navisworks",
    },
    {
      icon: FolderCheck,
      phase: "04",
      title: isVi ? "Bàn giao & Vận hành" : "Digital Handover",
      text: isVi
        ? "Kiểm tra sản phẩm bàn giao, trích xuất khối lượng QTO và chuẩn bị dữ liệu COBie cho Digital Twin."
        : "Verify outputs, extract accurate QTO quantities and assemble COBie data for Digital Twin/FM.",
      output: isVi ? "Dữ liệu COBie & As-Built" : "COBie & As-Built Twin",
      tag: "COBie / 7D FM",
    },
  ];

  return (
    <section
      className="delivery-section border-y border-border bg-muted/20 py-16 lg:py-20"
      data-home-section="process"
      id="our-process"
    >
      <div className="site-container">
        <header className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t.deliveryProcess.eyebrow}</p>
            <h2 className="section-title">{t.deliveryProcess.title}</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {t.deliveryProcess.description}
          </p>
        </header>

        <div
          className="delivery-line"
          data-motion="draw-line"
          aria-hidden="true"
        />
        <p className="mb-4 text-xs text-muted-foreground sm:hidden">
          {isVi
            ? "Vuốt để khám phá 4 bước →"
            : "Swipe to explore the 4 steps →"}
        </p>
        <div className="delivery-steps">
          {steps.map(({ icon: Icon, phase, title, text, output, tag }) => (
            <div
              key={title}
              className="delivery-step group flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-4.5" />
                  </div>
                  <span className="process-number">{phase}</span>
                </div>

                <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  {tag}
                </p>

                <h3 className="mt-1 text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>

              {/* Deliverable Box */}
              <div className="mt-6 rounded-xl border border-border bg-card/80 p-3.5 shadow-xs">
                <span className="block text-xs font-semibold text-muted-foreground">
                  {isVi ? "Sản phẩm đầu ra:" : "Key deliverable:"}
                </span>
                <p className="mt-1 text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary shrink-0" />
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
