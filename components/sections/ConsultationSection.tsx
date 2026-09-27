"use client";

import { SocialLinks } from "@/components/shared/SocialLinks";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { AppointmentBooking } from "@/features/contact/components/AppointmentBooking";
import {
  usePageContent,
  useSiteSettings,
} from "@/features/page-content/context";
import { useLanguage } from "@/lib/i18n/context";
import { filled, telHref } from "@/lib/utils/contact";
import { ArrowUpRight, CheckCircle2, Clock3, Mail, Phone } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { ui } from "@/lib/i18n/ui";
const subscribeHash = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};
const readHash = () => window.location.hash;
const serverHash = () => "";
function OfficeCard() {
  const office = usePageContent("contact")?.office;
  if (!office?.title && !office?.address && !office?.note) return null;
  const noteHref = telHref(office.note);
  return (
    <div className="mt-8 border-t border-white/10 pt-6 space-y-3 text-sm">
      {office.title && <h3 className="font-semibold">{office.title}</h3>}
      {office.address && <p>{office.address}</p>}
      {office.note &&
        (noteHref ? (
          <a className="block text-teal-300" href={noteHref}>
            {office.note}
          </a>
        ) : (
          <p className="text-teal-300">{office.note}</p>
        ))}
    </div>
  );
}

export function ConsultationSection() {
  const { t, locale } = useLanguage();
  const settings = useSiteSettings();
  const commitments = filled(usePageContent("contact")?.commitments);
  const phoneHref = telHref(settings?.phone);
  const [mode, setMode] = useState<"inbox" | "appointment" | null>(null);
  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const isAppointment =
    mode === null ? hash === "#dat-lich" : mode === "appointment";
  useEffect(() => {
    if (hash === "#dat-lich" && isAppointment)
      document.getElementById("dat-lich")?.scrollIntoView({ block: "start" });
  }, [hash, isAppointment]);

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
            {ui(locale).consultationSection.discussAProject}
            <ArrowUpRight className="size-4" />
          </a>

          {(phoneHref || settings?.email) && (
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {phoneHref && (
                <a
                  className="flex items-center gap-2 text-teal-300 transition hover:text-white font-medium"
                  href={phoneHref}
                >
                  <Phone className="size-4 text-primary" /> {settings?.phone}
                </a>
              )}
              {settings?.email && (
                <a
                  className="flex items-center gap-2 text-teal-300 transition hover:text-white font-medium"
                  href={`mailto:${settings.email}`}
                >
                  <Mail className="size-4 text-primary" /> {settings.email}
                </a>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              {ui(locale).consultationSection.socials}
            </span>
            <SocialLinks variant="icons" />
          </div>

          {commitments.length > 0 && (
            <ul className="mt-6 hidden gap-3 border-t border-white/10 pt-5 lg:grid">
              {commitments.map((item) => (
                <li
                  className="flex items-center gap-3 text-sm text-white/75"
                  key={item}
                >
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* Desktop view for the office card */}
          <div className="hidden lg:block">
            <OfficeCard />
          </div>
        </div>

        {/* Form Container (Directly reachable on mobile under intro) */}
        <div
          data-consultation-form
          id="consultation-form"
          className="rounded-[2rem] border border-white/12 bg-white/[.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:p-10"
        >
          <div className="mb-6 border-b border-white/10 pb-6">
            <div
              className="grid grid-cols-2 rounded-xl border border-white/10 bg-black/10 p-1"
              role="tablist"
              aria-label={ui(locale).consultationSection.contactMethod}
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isAppointment}
                onClick={() => setMode("inbox")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${!isAppointment ? "bg-primary text-white shadow-sm" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
              >
                {ui(locale).consultationSection.sendAnEnquiry}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isAppointment}
                onClick={() => setMode("appointment")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${isAppointment ? "bg-primary text-white shadow-sm" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
              >
                {ui(locale).consultationSection.bookAnAppointment}
              </button>
            </div>
          </div>
          <div className="mb-7 flex items-start justify-between gap-6">
            <div>
              <p className="text-xl font-semibold">
                {isAppointment
                  ? ui(locale).consultationSection.bookAConsultation
                  : t.contactPage.enquiryTitle}
              </p>
              <p className="mt-2 text-sm text-white/65">
                {isAppointment
                  ? ui(locale).consultationSection.bookAConsultationDesc
                  : t.contactPage.enquiryDesc}
              </p>
            </div>
            <span className="hidden items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary sm:flex">
              <Clock3 className="size-3.5" /> {t.contactPage.responseTime}
            </span>
          </div>
          {!isAppointment ? <ConsultationForm /> : <AppointmentBooking />}
        </div>

        {/* Mobile view for the office card (appears below form) */}
        <div className="block lg:hidden">
          <OfficeCard />
        </div>
      </div>
    </section>
  );
}
