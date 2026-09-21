"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Monitor,
  Tablet,
  Smartphone,
  X,
  Eye,
  Calendar,
  User,
  CheckCircle2,
  Building,
  Clock,
  Layers,
  GraduationCap,
  Award,
  ShieldCheck,
  Send,
  Share2,
  BookOpen,
  ArrowRight,
  Sparkles,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminContent } from "@/features/admin/types";
import { ContentBlockRenderer } from "@/components/shared/ContentBlockRenderer";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";

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
  const [previewLang, setPreviewLang] = useState<"vi" | "en">(initialLang);

  if (!isOpen) return null;

  const isVi = previewLang === "vi";

  // Localized Values Extraction
  const title = isVi
    ? content.title_vi || content.title || "Tiêu đề dịch vụ / bài viết"
    : content.title || content.title_vi || "Untitled Content";

  const description = isVi
    ? content.description_vi || content.description || ""
    : content.description || content.description_vi || "";

  const eyebrow = isVi
    ? content.eyebrow_vi || content.eyebrow || content.type
    : content.eyebrow || content.eyebrow_vi || content.type;

  const highlights = isVi
    ? content.highlights_vi?.length
      ? content.highlights_vi
      : content.highlights || []
    : content.highlights?.length
      ? content.highlights
      : content.highlights_vi || [];

  const blocks: ContentBlock[] = isVi
    ? (content.contentBlocks_vi?.length ? content.contentBlocks_vi : content.contentBlocks) || []
    : (content.contentBlocks?.length ? content.contentBlocks : content.contentBlocks_vi) || [];

  const image =
    content.image ||
    (content.type === "Dịch vụ"
      ? "/images/service-bim.jpg"
      : content.type === "Dự án"
        ? "/images/project-lumi.jpg"
        : content.type === "Khóa học"
          ? "/images/service-training.jpg"
          : "/images/news-project-coordination.webp");

  const location = isVi
    ? content.location_vi || content.location || "Hà Nội, Việt Nam"
    : content.location || content.location_vi || "Hanoi, Vietnam";

  const investor = isVi
    ? content.investor_vi || content.investor || "Tập đoàn Phát triển Bất động sản"
    : content.investor || content.investor_vi || "Real Estate Development Group";

  const scale = isVi
    ? content.scale_vi || content.scale || "250.000 m² sàn xây dựng"
    : content.scale || content.scale_vi || "250,000 sqm GFA";

  const contractPackage = isVi
    ? content.contractPackage_vi || content.contractPackage || "Tư vấn Quản trị & Điều phối BIM"
    : content.contractPackage || content.contractPackage_vi || "BIM Consulting & Coordination";

  const duration = isVi
    ? content.duration_vi || content.duration || "8 tuần (24 giờ)"
    : content.duration || content.duration_vi || "8 weeks (24 hours)";

  const level = isVi
    ? content.level_vi || content.level || "Chuyên sâu"
    : content.level || content.level_vi || "Professional / Advanced";

  const price = isVi
    ? content.price_vi || content.price || "Liên hệ tư vấn"
    : content.price || content.price_vi || "Contact for pricing";

  const instructor = isVi
    ? content.instructor_vi || content.instructor || "BIM Manager & Chuyên gia BIM4C"
    : content.instructor || content.instructor_vi || "Senior BIM Manager & Specialists";

  const learningOutcomes = isVi
    ? content.learningOutcomes_vi?.length
      ? content.learningOutcomes_vi
      : content.learningOutcomes || []
    : content.learningOutcomes?.length
      ? content.learningOutcomes
      : content.learningOutcomes_vi || [];

  const curriculum = content.curriculum || [];
  const authorName = content.authorName || "BIM4C Editorial Board";
  const publishedDate = content.publishedAt
    ? new Date(content.publishedAt).toLocaleDateString(isVi ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString(isVi ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const baseRouteName =
    content.type === "Dịch vụ"
      ? isVi ? "Dịch vụ & Giải pháp" : "Services & Solutions"
      : content.type === "Dự án"
        ? isVi ? "Dự án tiêu biểu" : "Featured Projects"
        : content.type === "Khóa học"
          ? isVi ? "Đào tạo & Khóa học" : "Courses & Training"
          : isVi ? "Tin tức & Kiến thức" : "News & Insights";

  const deviceWidthClass =
    device === "desktop"
      ? "max-w-5xl"
      : device === "tablet"
        ? "max-w-2xl"
        : "max-w-sm";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Top Device & Language Control Bar */}
      <div className="flex w-full max-w-5xl items-center justify-between pb-3 text-white">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <Eye className="size-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Live Preview Studio
            </span>
            <h3 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
              {content.type} // {title}
            </h3>
          </div>
        </div>

        {/* Viewport & Lang Switchers */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-white/10 p-1 border border-white/15">
            <button
              type="button"
              onClick={() => setPreviewLang("vi")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                previewLang === "vi"
                  ? "bg-teal-500 text-slate-950 shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang("en")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                previewLang === "en"
                  ? "bg-teal-500 text-slate-950 shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {/* Viewport Switcher */}
          <div className="hidden sm:flex items-center rounded-xl bg-white/10 p-1 border border-white/15">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDevice("desktop")}
              className={`h-7 px-2.5 text-xs gap-1.5 ${
                device === "desktop"
                  ? "bg-white/20 text-teal-300 font-semibold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Monitor className="size-3.5" /> Desktop
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDevice("tablet")}
              className={`h-7 px-2.5 text-xs gap-1.5 ${
                device === "tablet"
                  ? "bg-white/20 text-teal-300 font-semibold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Tablet className="size-3.5" /> Tablet
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDevice("mobile")}
              className={`h-7 px-2.5 text-xs gap-1.5 ${
                device === "mobile"
                  ? "bg-white/20 text-teal-300 font-semibold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Smartphone className="size-3.5" /> Mobile
            </Button>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 size-8 rounded-full"
            title="Đóng xem trước"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Preview Viewport Frame */}
      <div
        className={`w-full ${deviceWidthClass} max-h-[85vh] overflow-y-auto rounded-2xl border border-white/20 bg-background text-foreground shadow-2xl transition-all duration-300 relative`}
      >
        {/* Simulated Breadcrumbs */}
        <nav className="bg-slate-950/90 text-slate-300 px-6 py-2.5 text-xs border-b border-white/10 flex items-center gap-2 overflow-x-auto select-none">
          <span className="hover:text-white cursor-pointer">{isVi ? "Trang chủ" : "Home"}</span>
          <ChevronRight className="size-3 text-slate-500 shrink-0" />
          <span className="hover:text-white cursor-pointer">{baseRouteName}</span>
          <ChevronRight className="size-3 text-slate-500 shrink-0" />
          <span className="text-teal-400 font-medium truncate">{title}</span>
        </nav>

        {/* ========================================================================= */}
        {/* 1. SIMULATED PAGE HERO */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-slate-950 text-white pt-10 pb-12 px-6 sm:px-10 border-b border-white/10">
          <Image
            src={image}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover opacity-20 -z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/90 -z-10" />

          {/* Eyebrow badge */}
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/40 bg-teal-950/80 px-3.5 py-1 text-xs font-bold text-teal-300 mb-4 shadow-sm">
              <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>{eyebrow}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {title}
          </h1>

          {description && (
            <p className="mt-4 text-sm sm:text-base text-slate-200/90 leading-relaxed border-l-2 border-teal-400 pl-4 max-w-3xl">
              {description}
            </p>
          )}

          {/* Type-specific Top Meta Strip */}
          {content.type === "Tin tức" && (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-teal-400" />
                <span>{isVi ? "Xuất bản:" : "Published:"} <strong>{publishedDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="size-3.5 text-teal-400" />
                <span>{isVi ? "Tác giả:" : "By:"} <strong>{authorName}</strong></span>
              </div>
            </div>
          )}

          {content.type === "Khóa học" && (
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <Clock className="size-3.5 text-teal-400" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <GraduationCap className="size-3.5 text-teal-400" />
                <span>{level}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <DollarSign className="size-3.5 text-teal-400" />
                <span>{price}</span>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. DỰ ÁN SPECIFICATIONS STRIP */}
        {/* ========================================================================= */}
        {content.type === "Dự án" && (
          <div className="bg-card border-b border-border px-6 py-5">
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isVi ? "Chủ đầu tư" : "Client"}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground truncate">{investor}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isVi ? "Địa điểm" : "Location"}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground truncate">{location}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isVi ? "Quy mô" : "Scale"}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground truncate">{scale}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isVi ? "Gói thầu" : "Contract"}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground truncate">{contractPackage}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isVi ? "Tiến độ / Năm" : "Completion"}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground truncate">
                  {content.expectedCompletion || content.year || 2026}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isVi ? "Trạng thái" : "Status"}
                </dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  {content.status === "COMPLETED" ? (isVi ? "Hoàn thành" : "Completed") : (isVi ? "Đang thi công" : "In Progress")}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. KHÓA HỌC QUICK FACTS STRIP */}
        {/* ========================================================================= */}
        {content.type === "Khóa học" && (
          <div className="bg-card border-b border-border px-6 py-5">
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isVi ? "Thời lượng" : "Duration"}</dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground">{duration}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isVi ? "Cấp độ" : "Level"}</dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground">{level}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isVi ? "Học phí" : "Tuition Fee"}</dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-primary">{price}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isVi ? "Hình thức" : "Format"}</dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground">{isVi ? "Online Lab / Hybrid" : "Online Lab / Hybrid"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isVi ? "Khai giảng" : "Schedule"}</dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground">{isVi ? "Hàng tháng" : "Monthly Intakes"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{isVi ? "Giảng viên" : "Instructor"}</dt>
                <dd className="mt-1 text-xs sm:text-sm font-extrabold text-foreground truncate">{instructor}</dd>
              </div>
            </dl>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. MAIN ARTICLE 2-COLUMN BODY */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-10 items-start">
            
            {/* Left Content Column */}
            <div className="min-w-0 space-y-8">
              
              {/* Learning Outcomes (For Courses) */}
              {content.type === "Khóa học" && learningOutcomes.length > 0 && (
                <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm uppercase tracking-wider">
                    <Award className="size-5" />
                    <span>{isVi ? "Mục tiêu & Chuẩn đầu ra khóa học" : "Course Learning Outcomes"}</span>
                  </div>
                  <ul className="grid grid-cols-1 gap-2.5 text-sm text-foreground pt-1">
                    {learningOutcomes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Course Curriculum Breakdown */}
              {content.type === "Khóa học" && curriculum.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <BookOpen className="size-5 text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      {isVi ? `Chương trình đào tạo chi tiết (${curriculum.length} Modules)` : `Curriculum Breakdown (${curriculum.length} Modules)`}
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {curriculum.map((mod, idx) => (
                      <div key={mod.id || idx} className="rounded-xl border border-border bg-card p-4 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary font-mono">MODULE 0{idx + 1}</span>
                          <span className="text-[11px] text-muted-foreground">{isVi ? "Thực hành thực chiến" : "Hands-on Workshop"}</span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">{mod.title}</h4>
                        {mod.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Content Blocks */}
              {blocks.length > 0 ? (
                <div className="space-y-6">
                  <ContentBlockRenderer blocks={blocks} />
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
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {isVi ? "Chưa có khối nội dung chi tiết nào được soạn thảo." : "No content blocks added yet."}
                </div>
              )}

              {/* Technical Framework & Service Delivery Commitments (For Services) */}
              {content.type === "Dịch vụ" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                    <Layers className="size-5" />
                    <span>{isVi ? "Quy chuẩn thực thi dịch vụ BIM4C" : "BIM4C Delivery Framework"}</span>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{isVi ? "Quản trị quy trình thông tin và môi trường CDE theo tiêu chuẩn ISO 19650." : "Information management & Common Data Environment (CDE) ISO 19650 compliance."}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{isVi ? "Hỗ trợ định dạng mở OpenBIM (IFC, BCF) tương thích đa nền tảng phần mềm." : "Full OpenBIM (IFC, BCF) standard compatibility across multi-vendor software."}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{isVi ? "Cam kết bảo mật dữ liệu công trình theo thỏa thuận NDA pháp lý chặt chẽ." : "Full legal NDA compliance safeguarding intellectual property and engineering data."}</span>
                    </li>
                  </ul>
                </div>
              )}

            </div>

            {/* Right Sidebar: Quick Inquiry & Highlights */}
            <aside className="space-y-6">
              
              {/* Highlights Widget (If any) */}
              {highlights.length > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="size-4" />
                    <span>{isVi ? "Điểm nổi bật chính" : "Key Highlights"}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-foreground">
                    {highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-teal-500 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Consultation / Action Card */}
              <div className="rounded-2xl border border-border bg-slate-950 p-6 text-white shadow-xl space-y-4">
                <div className="space-y-1.5">
                  <span className="inline-block rounded bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                    {isVi ? "Tư vấn trực tiếp" : "Direct Consultation"}
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {content.type === "Khóa học"
                      ? isVi ? "Đăng ký nhận lộ trình khóa học" : "Get Syllabus & Enrollment Info"
                      : content.type === "Dự án"
                        ? isVi ? "Hợp tác triển khai dự án" : "Partner for your project"
                        : isVi ? "Yêu cầu tư vấn dịch vụ này" : "Request a service proposal"}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isVi
                      ? "Đội ngũ chuyên gia BIM4C sẽ liên hệ giải đáp trong vòng 24 giờ làm việc."
                      : "Our senior BIM specialists will contact you within 24 working hours."}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <input
                    disabled
                    placeholder={isVi ? "Họ và tên của bạn..." : "Your full name..."}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-slate-400 outline-none"
                  />
                  <input
                    disabled
                    placeholder={isVi ? "Email doanh nghiệp..." : "Business email..."}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-slate-400 outline-none"
                  />
                  <input
                    disabled
                    placeholder={isVi ? "Số điện thoại liên hệ..." : "Phone number..."}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-slate-400 outline-none"
                  />
                  <Button
                    type="button"
                    disabled
                    className="w-full gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs py-2 shadow-md"
                  >
                    <span>{isVi ? "Gửi thông tin yêu cầu" : "Submit Request"}</span>
                    <Send className="size-3" />
                  </Button>
                </div>
              </div>

              {/* Safety & Quality Guarantee */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldCheck className="size-4 text-teal-600 dark:text-teal-400" />
                  <span>{isVi ? "Cam kết chất lượng BIM4C" : "BIM4C Quality Assurance"}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isVi
                    ? "Tuân thủ nghiêm ngặt tiêu chuẩn OpenBIM quốc tế và bảo mật dữ liệu tuyệt đối."
                    : "Strict adherence to international OpenBIM frameworks & zero data leak NDA."}
                </p>
              </div>

            </aside>

          </div>
        </div>

      </div>

    </div>
  );
}
