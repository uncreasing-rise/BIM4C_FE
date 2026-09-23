"use client";

import { SocialLinks } from "@/components/shared/SocialLinks";
import { CONTACT_EMAIL, ROUTES } from "@/constants/routes";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { AppointmentBooking } from "@/features/contact/components/AppointmentBooking";
import { useLanguage } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/types";
import { ArrowUpRight, CheckCircle2, Clock3, Mail, Phone } from "lucide-react";
import { useState } from "react";

function OfficesAndVatCards({ t }: { t: Dictionary; locale: string }) {
  return (
    <div className="mt-8 border-t border-white/10 pt-6 space-y-3 text-sm">
      <h3 className="font-semibold">{t.contactPage.danangHq.title}</h3>
      <p>{t.contactPage.danangHq.address}</p>
      <a className="block text-teal-300" href="tel:+84796879899">
        {t.contactPage.danangHq.note}
      </a>
    </div>
  );
}

export function ConsultationSection() {
  const { t, locale } = useLanguage();
  const [mode, setMode] = useState<"inbox" | "appointment">("inbox");
  const isAppointment = mode === "appointment";

  return (
    <section
      id="contact"
      data-consultation
      className="relative overflow-hidden bg-brand-ink py-16 text-white lg:py-20"
    >
      <div className="site-container relative grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:gap-20">
        {/* Intro copy */}
        <div data-consultation-copy className="lg:sticky lg:top-28">
          <p className="eyebrow">{t.contactPage.talkEyebrow}</p>
          <h2 className="max-w-xl text-balance text-3xl font-semibold leading-[1.12] tracking-[-.04em] sm:text-4xl">
            {t.contactPage.talkTitle}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
            {t.contactPage.talkDesc}
          </p>

          <a
            href="#consultation-form"
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(8,126,125,.28)] transition hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            {locale === "vi" ? "Trao đổi dự án" : "Discuss a project"}
            <ArrowUpRight className="size-4" />
          </a>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a
              className="flex items-center gap-2 text-teal-300 transition hover:text-white font-medium"
              href="tel:+84932468099"
            >
              <Phone className="size-4 text-primary" /> +84 93 2468 099
            </a>
            <a
              className="flex items-center gap-2 text-teal-300 transition hover:text-white font-medium"
              href={ROUTES.contactEmail}
            >
              <Mail className="size-4 text-primary" /> {CONTACT_EMAIL}
            </a>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              {locale === "vi" ? "Mạng xã hội:" : "Socials:"}
            </span>
            <SocialLinks variant="icons" />
          </div>

          <ul className="mt-6 hidden gap-3 border-t border-white/10 pt-5 lg:grid">
            {t.contactPage.commitments.map((item) => (
              <li
                className="flex items-center gap-3 text-sm text-white/75"
                key={item}
              >
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          {/* Desktop view for offices and VAT */}
          <div className="hidden lg:block">
            <OfficesAndVatCards t={t} locale={locale} />
          </div>
        </div>

        {/* Form Container (Directly reachable on mobile under intro) */}
        <div
          data-consultation-form
          id="consultation-form"
          className="rounded-[2rem] border border-white/12 bg-white/[.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:p-10"
        >
          <div className="mb-6 border-b border-white/10 pb-6">
            <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-black/10 p-1" role="tablist" aria-label={locale === "vi" ? "Phương thức liên hệ" : "Contact method"}>
              <button
                type="button"
                role="tab"
                aria-selected={!isAppointment}
                onClick={() => setMode("inbox")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${!isAppointment ? "bg-primary text-white shadow-sm" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
              >
                {locale === "vi" ? "Gửi yêu cầu" : "Send an enquiry"}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isAppointment}
                onClick={() => setMode("appointment")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${isAppointment ? "bg-primary text-white shadow-sm" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
              >
                {locale === "vi" ? "Đặt lịch tư vấn" : "Book an appointment"}
              </button>
            </div>
          </div>
          <div className="mb-7 flex items-start justify-between gap-6">
            <div>
              <p className="text-xl font-semibold">
                {isAppointment
                  ? locale === "vi" ? "Đặt lịch tư vấn" : "Book a consultation"
                  : t.contactPage.enquiryTitle}
              </p>
              <p className="mt-2 text-sm text-white/65">
                {isAppointment
                  ? locale === "vi" ? "Chọn một khung giờ còn trống phù hợp với bạn." : "Choose an available time that works for you."
                  : t.contactPage.enquiryDesc}
              </p>
            </div>
            <span className="hidden items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary sm:flex">
              <Clock3 className="size-3.5" /> {t.contactPage.responseTime}
            </span>
          </div>
          {!isAppointment ? <ConsultationForm /> : <AppointmentBooking />}
        </div>

        {/* Mobile view for offices and VAT (Appears below form) */}
        <div className="block lg:hidden">
          <OfficesAndVatCards t={t} locale={locale} />
        </div>
      </div>
    </section>
  );
}
