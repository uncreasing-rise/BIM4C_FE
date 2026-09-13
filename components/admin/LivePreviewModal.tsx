"use client";

import { useState } from "react";
import Image from "next/image";
import { Monitor, Tablet, Smartphone, X, Eye, Calendar, User, CheckCircle2, Building, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminContent } from "@/features/admin/types";
import { ContentBlockRenderer } from "@/components/shared/ContentBlockRenderer";

interface LivePreviewModalProps {
  content: AdminContent;
  lang: "vi" | "en";
  isOpen: boolean;
  onClose: () => void;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export function LivePreviewModal({ content, lang, isOpen, onClose }: LivePreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");

  if (!isOpen) return null;

  const isVi = lang === "vi";
  const title = (isVi && content.title_vi) ? content.title_vi : content.title || "Tiêu đề chưa đặt";
  const description = (isVi && content.description_vi) ? content.description_vi : content.description || "";
  const eyebrow = (isVi && content.eyebrow_vi) ? content.eyebrow_vi : content.eyebrow || content.type;
  const highlights = (isVi && content.highlights_vi?.length) ? content.highlights_vi : content.highlights || [];
  const image = content.image || "/images/news-project-coordination.webp";

  const deviceWidthClass =
    device === "desktop"
      ? "max-w-5xl"
      : device === "tablet"
        ? "max-w-2xl"
        : "max-w-sm";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Top Device Bar */}
      <div className="flex w-full max-w-5xl items-center justify-between pb-3 text-white">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-teal-400" />
          <span className="text-sm font-semibold">Xem trước giao diện Public ({lang.toUpperCase()})</span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1 border border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDevice("desktop")}
            className={`h-8 px-3 text-xs gap-1.5 ${device === "desktop" ? "bg-white/20 text-teal-300 font-semibold" : "text-white/70 hover:text-white"}`}
          >
            <Monitor className="size-3.5" /> Desktop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDevice("tablet")}
            className={`h-8 px-3 text-xs gap-1.5 ${device === "tablet" ? "bg-white/20 text-teal-300 font-semibold" : "text-white/70 hover:text-white"}`}
          >
            <Tablet className="size-3.5" /> Tablet
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDevice("mobile")}
            className={`h-8 px-3 text-xs gap-1.5 ${device === "mobile" ? "bg-white/20 text-teal-300 font-semibold" : "text-white/70 hover:text-white"}`}
          >
            <Smartphone className="size-3.5" /> Mobile
          </Button>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 size-8 rounded-full">
          <X className="size-5" />
        </Button>
      </div>

      {/* Preview Viewport Frame */}
      <div className={`w-full ${deviceWidthClass} max-h-[82vh] overflow-y-auto rounded-2xl border border-white/20 bg-background shadow-2xl transition-all duration-300`}>
        {/* Simulated Hero */}
        <section className="relative overflow-hidden bg-brand-ink text-white pt-12 pb-10 px-6 sm:px-10">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover opacity-25 -z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-transparent to-brand-ink/80 -z-10" />

          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300 mb-4">
              <span className="size-1.5 rounded-full bg-teal-400" />
              <span>{eyebrow}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {title}
          </h1>

          {description && (
            <p className="mt-3 text-sm sm:text-base text-slate-200/90 leading-relaxed border-l-2 border-teal-400 pl-3">
              {description}
            </p>
          )}

          {/* Quick metadata strip */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-300 border-t border-white/10 pt-4">
            {content.authorName && (
              <div className="flex items-center gap-1">
                <User className="size-3.5 text-teal-400" />
                <span>{content.authorName}</span>
              </div>
            )}
            {content.duration && (
              <div className="flex items-center gap-1">
                <Clock className="size-3.5 text-teal-400" />
                <span>{content.duration}</span>
              </div>
            )}
            {content.location && (
              <div className="flex items-center gap-1">
                <Building className="size-3.5 text-teal-400" />
                <span>{content.location} · {content.year}</span>
              </div>
            )}
          </div>
        </section>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                {isVi ? "Điểm nổi bật trọng tâm" : "Key Highlights"}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-foreground">
                {highlights.map((hl, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-500 shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Structured Content Blocks */}
          {content.contentBlocks && content.contentBlocks.length > 0 ? (
            <div className="space-y-6">
              <ContentBlockRenderer blocks={content.contentBlocks} />
            </div>
          ) : content.sections && content.sections.length > 0 ? (
            <div className="space-y-6">
              {content.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">{sec.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{sec.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-6">
              {isVi ? "Chưa có khối nội dung chi tiết nào." : "No content blocks added yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
