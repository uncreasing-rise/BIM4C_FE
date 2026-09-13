"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT_EMAIL, ROUTES } from "@/constants/routes";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";
import { useLanguage } from "@/lib/i18n/context";

export function Footer() {
  const { t, locale } = useLanguage();
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
    <footer className="site-footer bg-brand-ink text-slate-300">
      <div className="site-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_.7fr_1fr] lg:gap-16 lg:py-20">
        <div>
          <Link
            href={ROUTES.home}
            className="text-3xl font-semibold tracking-tight text-white"
          >
            BIM<span className="text-teal-300">4C</span>
            <span className="ml-3 text-xs font-normal tracking-wide text-slate-400">
              Digital Construction
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7">
            {t.footer.enterpriseInfo.companyName}
          </p>
          <div className="mt-6 grid gap-4 text-sm leading-6">
            <p className="flex gap-3">
              <MapPin className="mt-1 size-4 shrink-0 text-teal-300" />
              <span>{t.footer.enterpriseInfo.headquarters}</span>
            </p>
            <a
              href={ROUTES.contactEmail}
              className="flex min-h-8 items-center gap-3 hover:text-white"
            >
              <Mail className="size-4 text-teal-300" />
              {CONTACT_EMAIL}
            </a>
            <a
              href="tel:+842873004068"
              className="flex min-h-8 items-center gap-3 hover:text-white"
            >
              <Phone className="size-4 text-teal-300" />
              +84 28 7300 4068
            </a>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-300">
            {t.footer.exploreTitle}
          </h2>
          <nav
            className="mt-5 grid gap-1"
            aria-label={
              locale === "vi" ? "Điều hướng cuối trang" : "Footer navigation"
            }
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex w-fit items-center gap-3 py-1 hover:text-white"
              >
                {item.label}
                <ArrowUpRight className="size-3.5 text-teal-300 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">
            {t.footer.newsletterTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            {t.footer.newsletterDesc}
          </p>
          <div className="mt-5">
            <NewsletterForm />
          </div>
          <Link
            href={ROUTES.contact}
            className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-medium text-teal-300 hover:text-white"
          >
            {t.common.discussProject}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="site-container flex flex-col justify-between gap-4 py-6 text-xs leading-6 text-slate-400 lg:flex-row">
          <span>
            {t.footer.copyright}
            <span className="ml-3">MST: 0402225839</span>
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href={ROUTES.legalDetail("dieu-khoan-su-dung")}
              className="hover:text-white"
            >
              {t.footer.termsLink}
            </Link>
            <Link
              href={ROUTES.legalDetail("chinh-sach-bao-mat")}
              className="hover:text-white"
            >
              {t.footer.privacyPolicyLink}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
