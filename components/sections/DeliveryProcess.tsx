"use client";

import { ClipboardList, Network, ScanLine, FolderCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function DeliveryProcess() {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  const steps = [
    {
      icon: ClipboardList,
      title: isVi ? "Xác định" : "Define",
      text: isVi
        ? "Thống nhất phạm vi, yêu cầu thông tin và phân định trách nhiệm."
        : "Agree the scope, information requirements and responsibilities.",
      output: isVi ? "Kế hoạch triển khai (BEP)" : "Delivery plan",
    },
    {
      icon: Network,
      title: isVi ? "Kết nối" : "Connect",
      text: isVi
        ? "Đưa các bộ môn, mô hình và tài liệu vào quy trình làm việc chung."
        : "Bring disciplines, models and documents into a shared workflow.",
      output: isVi ? "Thông tin phối hợp" : "Coordinated information",
    },
    {
      icon: ScanLine,
      title: isVi ? "Xử lý" : "Resolve",
      text: isVi
        ? "Kiểm soát chất lượng, gán việc và theo dõi xử lý xung đột triệt để."
        : "Review quality, assign issues and track decisions to closure.",
      output: isVi ? "Quyết định có thể truy vết" : "Traceable decisions",
    },
    {
      icon: FolderCheck,
      title: isVi ? "Bàn giao" : "Deliver",
      text: isVi
        ? "Kiểm tra sản phẩm bàn giao và chuẩn bị dữ liệu cho vận hành."
        : "Check the agreed outputs and prepare information for its next use.",
      output: isVi ? "Bàn giao có cấu trúc" : "Structured handover",
    },
  ];

  return (
    <section className="border-y bg-muted/60 py-14 lg:py-16" id="our-process">
      <div className="site-container">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t.deliveryProcess.eyebrow}</p>
            <h2 className="section-title">{t.deliveryProcess.title}</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            {t.deliveryProcess.description}
          </p>
        </header>
        <ol className="grid gap-0 overflow-hidden rounded-2xl border bg-card sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text, output }, index) => (
            <li
              key={title}
              className="relative border-b border-r p-6 last:border-r-0 lg:border-b-0"
              data-motion="tile"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">
                  0{index + 1} / 04
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
              <p className="mt-5 border-t pt-3 text-xs font-medium text-primary">
                {output}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
