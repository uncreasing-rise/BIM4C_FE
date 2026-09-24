"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  X,
  Eye,
  Sparkles,
  Wifi,
  Battery,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminContent } from "@/features/admin/types";
import { parseContentBlocks } from "@/features/shared/schemas/content-block.schema";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { CourseDetailView } from "@/components/courses/CourseDetailView";
import { ServiceDetailView } from "@/components/services/ServiceDetailView";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import { enDictionary } from "@/lib/i18n/dictionaries/en";
import { viDictionary } from "@/lib/i18n/dictionaries/vi";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary, LanguageContextType } from "@/lib/i18n/types";
import { LanguageContext } from "@/lib/i18n/context";

const dictionaries: Record<Locale, Dictionary> = {
  en: enDictionary,
  vi: viDictionary,
};

function PreviewLanguageScope({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = dictionaries[locale] || dictionaries.vi;
  const contextValue: LanguageContextType = {
    locale,
    setLocale: () => {},
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

interface LivePreviewModalProps {
  content: AdminContent;
  lang: "vi" | "en";
  isOpen: boolean;
  onClose: () => void;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export function LivePreviewModal({
  content,
  lang: initialLang,
  isOpen,
  onClose,
}: LivePreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [previewLang, setPreviewLang] = useState<Locale>(initialLang || "vi");

  // Sync initial language if changed externally
  useEffect(() => {
    if (!initialLang) return;
    const timer = window.setTimeout(() => setPreviewLang(initialLang), 0);
    return () => window.clearTimeout(timer);
  }, [initialLang]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Construct 100% accurate public content model for detail views
  const previewEntry = useMemo(() => {
    const rawBlocks = content.contentBlocks || [];
    const rawBlocksVi = content.contentBlocks_vi || [];

    const parsedBlocks = parseContentBlocks(rawBlocks);
    const parsedBlocksVi = parseContentBlocks(rawBlocksVi);

    const defaultImage =
      content.type === "Dịch vụ"
        ? "/images/service-bim.jpg"
        : content.type === "Dự án"
          ? "/images/project-matrix.jpg"
          : content.type === "Khóa học"
            ? "/images/service-training.jpg"
            : "/images/news-project-coordination.webp";

    const entry = {
      ...content,
      id: content.id || "preview-temp-id",
      slug: content.slug || "preview-slug",
      type: content.type,
      title: content.title || content.title_vi || "Untitled Content",
      title_vi: content.title_vi || content.title || "Chưa đặt tiêu đề",
      description: content.description || content.description_vi || "",
      description_vi: content.description_vi || content.description || "",
      image: content.image || defaultImage,
      eyebrow:
        content.eyebrow ||
        content.eyebrow_vi ||
        (content.type === "Dự án" ? "PROJECT PROFILE" : content.type),
      eyebrow_vi:
        content.eyebrow_vi ||
        content.eyebrow ||
        (content.type === "Dự án" ? "HỒ SƠ DỰ ÁN" : content.type),
      meta: content.meta || null,
      meta_vi: content.meta_vi || content.meta || null,
      highlights: content.highlights || [],
      highlights_vi: content.highlights_vi || [],
      sections: content.sections || [],
      sections_vi: content.sections_vi || [],
      contentBlocks: parsedBlocks.length ? parsedBlocks : parsedBlocksVi,
      contentBlocks_vi: parsedBlocksVi.length ? parsedBlocksVi : parsedBlocks,
      publishedAt: content.publishedAt || new Date().toISOString(),
      updatedAt: content.updatedAt || new Date().toISOString(),
      createdAt:
        (content as AdminContent & { createdAt?: string }).createdAt ||
        new Date().toISOString(),
      status: (content.status || "PUBLISHED").toLowerCase(),
    };

    return entry;
  }, [content]);

  // Intercept navigation clicks inside preview so user stays in preview studio
  const handlePreviewClickCapture = (e: React.MouseEvent) => {
    const link = (e.target as HTMLElement).closest("a");
    if (link) {
      const href = link.getAttribute("href");
      if (href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  if (!isOpen) return null;

  const isVi = previewLang === "vi";
  const displayTitle = isVi
    ? previewEntry.title_vi || previewEntry.title
    : previewEntry.title || previewEntry.title_vi;

  const typeSlugMap: Record<string, string> = {
    "Dự án": "du-an",
    "Khóa học": "khoa-hoc",
    "Dịch vụ": "dich-vu",
    "Tin tức": "tin-tuc",
    "Chuyên môn": "tin-tuc",
  };
  const sectionSlug = typeSlugMap[content.type] || "noi-dung";
  const simulatedUrl = `https://bim4c.com/${previewLang}/${sectionSlug}/${content.slug || "slug-du-an"}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-xl p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Top Studio Control Bar */}
      <header className="flex w-full max-w-7xl items-center justify-between border-b border-white/10 pb-3 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-inner">
            <Eye className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/30 flex items-center gap-1">
                <Sparkles className="size-3 text-teal-300 animate-pulse" />
                LIVE PREVIEW STUDIO
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                {content.type}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md lg:max-w-lg mt-0.5">
              {displayTitle}
            </h3>
          </div>
        </div>

        {/* Center: Device Switcher */}
        <div className="hidden md:flex items-center rounded-xl bg-slate-900/90 p-1 border border-white/15 shadow-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDevice("desktop")}
            className={`h-8 px-3 text-xs gap-1.5 rounded-lg transition-all ${
              device === "desktop"
                ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Monitor className="size-3.5" /> Desktop (1200px)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDevice("tablet")}
            className={`h-8 px-3 text-xs gap-1.5 rounded-lg transition-all ${
              device === "tablet"
                ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Tablet className="size-3.5" /> Tablet (768px)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDevice("mobile")}
            className={`h-8 px-3 text-xs gap-1.5 rounded-lg transition-all ${
              device === "mobile"
                ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Smartphone className="size-3.5" /> Mobile (390px)
          </Button>
        </div>

        {/* Right: Language Switcher & Close */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-white/15 shadow-md">
            <button
              type="button"
              onClick={() => setPreviewLang("vi")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                previewLang === "vi"
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang("en")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                previewLang === "en"
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 size-9 rounded-xl border border-white/10 ml-1"
            title="Đóng xem trước (ESC)"
          >
            <X className="size-5" />
          </Button>
        </div>
      </header>

      {/* Main Preview Container with Realistic Device Framing */}
      <main className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        
        {/* Device Wrapper */}
        {device === "desktop" && (
          <div className="w-full max-w-6xl h-[84vh] flex flex-col rounded-xl border border-white/20 bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300">
            {/* Browser Top Navigation Bar */}
            <div className="h-10 bg-slate-900 border-b border-white/10 px-4 flex items-center gap-3 shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-rose-500/80" />
                <div className="size-3 rounded-full bg-amber-500/80" />
                <div className="size-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 flex justify-center max-w-xl mx-auto">
                <div className="w-full h-6.5 rounded-lg bg-slate-950/80 border border-white/10 flex items-center px-3 text-[11px] font-mono text-slate-300 gap-2 truncate">
                  <Lock className="size-3 text-teal-400 shrink-0" />
                  <span className="truncate">{simulatedUrl}</span>
                </div>
              </div>
            </div>

            {/* Public Content Viewport */}
            <div
              onClickCapture={handlePreviewClickCapture}
              className="flex-1 overflow-y-auto bg-background text-foreground scroll-smooth"
            >
              <PreviewLanguageScope locale={previewLang}>
                {content.type === "Dự án" && (
                  <ProjectDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/du-an" : "/en/du-an"}
                  />
                )}
                {content.type === "Khóa học" && (
                  <CourseDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/khoa-hoc" : "/en/khoa-hoc"}
                  />
                )}
                {content.type === "Dịch vụ" && (
                  <ServiceDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/dich-vu" : "/en/dich-vu"}
                  />
                )}
                {(content.type === "Tin tức" || content.type === "Chuyên môn") && (
                  <BlogDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/tin-tuc" : "/en/tin-tuc"}
                  />
                )}
              </PreviewLanguageScope>
            </div>
          </div>
        )}

        {device === "tablet" && (
          <div className="w-full max-w-[768px] h-[84vh] flex flex-col rounded-[32px] border-[10px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300">
            {/* Tablet Top Bar */}
            <div className="h-8 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between text-[11px] text-slate-400 font-medium shrink-0">
              <span className="font-mono text-xs text-white">9:41</span>
              <div className="h-5 px-3 rounded-md bg-slate-950 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                <Lock className="size-2.5 text-teal-400" />
                <span className="truncate max-w-[280px]">bim4c.com/{previewLang}/{sectionSlug}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="size-3.5 text-white" />
                <Battery className="size-4 text-white" />
              </div>
            </div>

            {/* Tablet Viewport */}
            <div
              onClickCapture={handlePreviewClickCapture}
              className="flex-1 overflow-y-auto bg-background text-foreground scroll-smooth"
            >
              <PreviewLanguageScope locale={previewLang}>
                {content.type === "Dự án" && (
                  <ProjectDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/du-an" : "/en/du-an"}
                  />
                )}
                {content.type === "Khóa học" && (
                  <CourseDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/khoa-hoc" : "/en/khoa-hoc"}
                  />
                )}
                {content.type === "Dịch vụ" && (
                  <ServiceDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/dich-vu" : "/en/dich-vu"}
                  />
                )}
                {(content.type === "Tin tức" || content.type === "Chuyên môn") && (
                  <BlogDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/tin-tuc" : "/en/tin-tuc"}
                  />
                )}
              </PreviewLanguageScope>
            </div>
          </div>
        )}

        {device === "mobile" && (
          <div className="w-full max-w-[390px] h-[84vh] flex flex-col rounded-[44px] border-[10px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300 relative">
            {/* Smartphone Dynamic Island / Notch + Status Bar */}
            <div className="h-10 bg-slate-950 px-6 flex items-center justify-between text-[12px] text-white font-semibold shrink-0 select-none">
              <span>9:41</span>
              <div className="h-4.5 w-24 bg-black rounded-full border border-white/15" />
              <div className="flex items-center gap-1.5">
                <Wifi className="size-3.5" />
                <Battery className="size-4" />
              </div>
            </div>

            {/* Mobile Viewport */}
            <div
              onClickCapture={handlePreviewClickCapture}
              className="flex-1 overflow-y-auto bg-background text-foreground scroll-smooth"
            >
              <PreviewLanguageScope locale={previewLang}>
                {content.type === "Dự án" && (
                  <ProjectDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/du-an" : "/en/du-an"}
                  />
                )}
                {content.type === "Khóa học" && (
                  <CourseDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/khoa-hoc" : "/en/khoa-hoc"}
                  />
                )}
                {content.type === "Dịch vụ" && (
                  <ServiceDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/dich-vu" : "/en/dich-vu"}
                  />
                )}
                {(content.type === "Tin tức" || content.type === "Chuyên môn") && (
                  <BlogDetailView
                    entry={previewEntry as never}
                    backHref={isVi ? "/vi/tin-tuc" : "/en/tin-tuc"}
                  />
                )}
              </PreviewLanguageScope>
            </div>

            {/* Mobile Home Bar Indicator */}
            <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
              <div className="h-1 w-32 bg-white/40 rounded-full" />
            </div>
          </div>
        )}

      </main>

      {/* Bottom Status Footer */}
      <footer className="w-full max-w-7xl flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Mô phỏng trực tiếp từ thành phần giao diện chuẩn người dùng (Production Component Parity).</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            Khối nội dung: {previewLang === "vi" ? (content.contentBlocks_vi?.length || 0) : (content.contentBlocks?.length || 0)} blocks
          </span>
        </div>
      </footer>

    </div>
  );
}
