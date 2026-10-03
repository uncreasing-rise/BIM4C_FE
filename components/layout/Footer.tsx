"use client";

import { ROUTES } from "@/constants/routes";
import {
  usePageContent,
  useSiteSettings,
} from "@/features/page-content/context";
import { telHref } from "@/lib/utils/contact";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";
import { useLanguage } from "@/lib/i18n/context";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { SocialLinks } from "@/components/shared/SocialLinks";

import { ui } from "@/lib/i18n/ui";
export function Footer() {
  const { t, locale } = useLanguage();
  const settings = useSiteSettings();
  const company = usePageContent("company");
  // Legal-entity details (registered name, copyright holder) are intentionally not shown.
  const address = settings?.address || company?.enterpriseInfo?.headquarters;
  const phoneHref = telHref(settings?.phone);
  const navigation = [
    { label: t.navigation.about, href: ROUTES.about },
    { label: t.navigation.services, href: ROUTES.services },
    { label: t.navigation.projects, href: ROUTES.projects },
    { label: t.navigation.courses, href: ROUTES.courses },
    { label: t.navigation.technical, href: ROUTES.technical },
    { label: t.navigation.news, href: ROUTES.news },
    { label: t.navigation.bimViewer, href: ROUTES.bimViewer },
    { label: t.navigation.contact, href: ROUTES.contact },
  ];
  return (
    <footer className="site-footer bg-brand-ink text-slate-300">
      <div className="site-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_.7fr_1fr] lg:gap-16 lg:py-20">
        <div>
          <Link
            href={ROUTES.home}
            className="group flex items-center gap-3 text-2xl sm:text-3xl font-bold tracking-tight text-white"
          >
            <div className="relative size-10 sm:size-12 overflow-hidden rounded-full border border-teal-500/30 bg-white/95 p-0.5 shadow-md transition-transform group-hover:scale-105">
              <Image
                src="/images/bim4c-logo.png"
                alt="BIM4C Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <div className="leading-none">
                BIM<span className="text-teal-300">4C</span>
              </div>
              <span className="mt-1 block text-xs font-medium tracking-wider text-slate-400">
                Digital Construction
              </span>
            </div>
          </Link>
          <div className="mt-6 grid gap-4 text-sm leading-6">
            {address && (
              <p className="flex gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-teal-300" />
                <span>{address}</span>
              </p>
            )}
            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="flex min-h-8 items-center gap-3 hover:text-white"
              >
                <Mail className="size-4 text-teal-300" />
                {settings.email}
              </a>
            )}
            {phoneHref && (
              <a
                href={phoneHref}
                className="flex min-h-8 items-center gap-3 hover:text-white"
              >
                <Phone className="size-4 text-teal-300" />
                {settings?.phone}
              </a>
            )}
            <div className="pt-2">
              <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400 block mb-2.5">
                {ui(locale).footer.connectWithUs}
              </span>
              <SocialLinks variant="icons" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-300">
            {t.footer.exploreTitle}
          </h2>
          <nav
            className="mt-5 grid gap-1"
            aria-label={ui(locale).footer.footerNavigation}
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
            © {new Date().getFullYear()} BIM4C.{" "}
            {ui(locale).footer.allRightsReserved}
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
