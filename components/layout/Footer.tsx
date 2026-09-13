"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone, ShieldCheck, Award, Globe, Building } from "lucide-react";
import { toast } from "sonner";
import { CONTACT_EMAIL, ROUTES } from "@/constants/routes";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";
import { useLanguage } from "@/lib/i18n/context";

export function Footer() {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  const navigation = [
    { label: t.navigation.about, href: ROUTES.about },
    { label: t.navigation.services, href: ROUTES.services },
    { label: t.navigation.projects, href: ROUTES.projects },
    { label: t.navigation.courses, href: ROUTES.courses },
    { label: t.navigation.blog, href: ROUTES.blog },
    { label: t.navigation.bimViewer, href: ROUTES.bimViewer },
    { label: t.navigation.contact, href: ROUTES.contact },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/15 bg-brand-ink text-zinc-100">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 size-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-96 rounded-full bg-teal-500/10 blur-3xl" />

      {/* Main Enterprise Footer Grid */}
      <div className="site-container relative z-10 grid gap-10 py-16 lg:grid-cols-[1.3fr_.8fr_1fr] lg:gap-14 lg:py-20">
        {/* Column 1: Company Credentials & Contact */}
        <div>
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2.5 text-2xl font-black tracking-[.14em]"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-700 shadow-sm">
              <svg viewBox="0 0 32 32" fill="none" className="size-5 text-white" aria-hidden="true">
                <path d="M16 3L28 10V22L16 29L4 22V10L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M16 3V16M28 10L16 16M4 10L16 16M16 16V29" stroke="currentColor" strokeWidth="1.75" />
                <circle cx="16" cy="16" r="2.5" fill="#5eead4" />
              </svg>
            </div>
            <span>
              BIM<span className="text-teal-400">4C</span>
            </span>
          </Link>

          {/* Corporate Legal Identity Badge */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.footer.enterpriseInfo.taxStatus}
              </span>
              <a
                href="https://masothue.com/0402225839-cong-ty-co-phan-xay-dung-cong-nghe-bim4c"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-teal-300 hover:text-white transition-colors"
                title={isVi ? "Xem hồ sơ thuế quốc gia" : "View national tax record"}
              >
                <span>{isVi ? "Tra cứu hồ sơ" : "Verify Registry"}</span>
                <ArrowUpRight className="size-3" />
              </a>
            </div>

            <p className="mt-2 text-xs font-bold text-white tracking-wide leading-snug">
              {t.footer.enterpriseInfo.companyName}
            </p>
            <p className="text-[11px] text-zinc-400">
              {t.footer.enterpriseInfo.internationalName} ({t.footer.enterpriseInfo.shortName})
            </p>

            {/* 1-Click Copy MST */}
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5 text-xs">
              <span className="font-mono text-[11px] text-zinc-300">
                MST: <strong className="text-teal-300 tracking-wider font-bold">0402225839</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("0402225839");
                  toast.success(
                    isVi
                      ? "Đã sao chép mã số thuế: 0402225839"
                      : "Copied Tax ID: 0402225839 to clipboard"
                  );
                }}
                className="flex items-center gap-1 rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-200 transition-colors hover:bg-teal-500/30 hover:text-white"
              >
                <span>{isVi ? "Sao chép" : "Copy"}</span>
              </button>
            </div>

            <div className="mt-2 text-[11px] text-zinc-400 space-y-0.5">
              <p>
                <span className="text-zinc-500">{isVi ? "Người đại diện:" : "Representative:"}</span>{" "}
                <span className="text-zinc-300 font-medium">{t.footer.enterpriseInfo.legalRepresentative}</span>
              </p>
              <p className="text-[10.5px] text-zinc-400">
                <span className="text-zinc-500">{isVi ? "Địa chỉ thuế:" : "Tax address:"}</span>{" "}
                {t.footer.enterpriseInfo.taxAddress}
              </p>
            </div>
          </div>

          <p className="mt-3 max-w-md text-xs leading-5 text-zinc-300">
            {t.footer.description}
          </p>

          {/* Office Locations */}
          <div className="mt-4 space-y-2 text-xs text-zinc-300 border-t border-white/10 pt-4">
            <p className="flex items-start gap-2.5 leading-5">
              <Building className="size-4 shrink-0 text-teal-400 mt-0.5" />
              <span>{t.footer.enterpriseInfo.headquarters}</span>
            </p>
            <p className="flex items-start gap-2.5 leading-5">
              <MapPin className="size-4 shrink-0 text-teal-400 mt-0.5" />
              <span>{t.footer.enterpriseInfo.branchOffice}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-teal-400" />
              <a
                className="underline-offset-4 hover:text-white hover:underline font-medium text-teal-200"
                href={ROUTES.contactEmail}
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-teal-400" />
              <a
                className="underline-offset-4 hover:text-white hover:underline font-medium text-teal-200"
                href="tel:+842873004068"
              >
                +84 28 7300 4068
              </a>
            </p>
          </div>
        </div>

        {/* Column 2: Navigation & International Certifications */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[.16em] text-teal-300">
            {t.footer.exploreTitle}
          </h2>
          <nav className="mt-4 grid gap-2.5">
            {navigation.map((item) => (
              <Link
                className="group flex w-fit items-center gap-1 text-xs text-zinc-300 hover:text-white transition-colors"
                href={item.href}
                key={item.href}
              >
                <span>{item.label}</span>
                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100 text-teal-400" />
              </Link>
            ))}
          </nav>

          {/* Accreditation Badges */}
          <div className="mt-8 border-t border-white/10 pt-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-300 mb-3">
              {t.footer.enterpriseInfo.certificationsTitle}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-1.5 text-[11px] text-zinc-200">
                <ShieldCheck className="size-4 text-teal-400 shrink-0" />
                <span>{t.footer.enterpriseInfo.isoCert}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-1.5 text-[11px] text-zinc-200">
                <Globe className="size-4 text-teal-400 shrink-0" />
                <span>{t.footer.enterpriseInfo.buildingSmartCert}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-1.5 text-[11px] text-zinc-200">
                <Award className="size-4 text-teal-400 shrink-0" />
                <span>{t.footer.enterpriseInfo.autodeskCert}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Newsletter & Confidentiality */}
        <div>
          <h2 className="text-lg font-bold text-white">{t.footer.newsletterTitle}</h2>
          <p className="mt-2 text-xs leading-6 text-zinc-300">
            {t.footer.newsletterDesc}
          </p>
          <div className="mt-5">
            <NewsletterForm />
          </div>

          <div className="mt-6 rounded-xl border border-teal-500/20 bg-teal-500/[0.04] p-3.5">
            <p className="text-[11px] font-semibold text-teal-300 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              <span>{isVi ? "Cam kết bảo mật dự án (NDA)" : "NDA Project Security Guaranteed"}</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
              {isVi
                ? "Dữ liệu bản vẽ, mô hình và hồ sơ kỹ thuật được bảo mật tuyệt đối theo tiêu chuẩn ISO 27001."
                : "All project models, CAD drawings and specifications are protected under strict enterprise NDA."}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Footer Copyright & Legal Links */}
      <div className="border-t border-white/10 bg-black/40">
        <div className="site-container flex flex-col gap-3 py-5 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <span>{t.footer.copyright}</span>
          <div className="flex gap-6">
            <Link
              className="transition-colors hover:text-teal-300"
              href={ROUTES.legalDetail("dieu-khoan-su-dung")}
            >
              {t.footer.termsLink}
            </Link>
            <Link
              className="transition-colors hover:text-teal-300"
              href={ROUTES.legalDetail("chinh-sach-bao-mat")}
            >
              {t.footer.privacyPolicyLink}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
