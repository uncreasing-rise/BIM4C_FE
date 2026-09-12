"use client";

import { CheckCircle2, Clock3, Mail, Phone } from "lucide-react";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { CONTACT_EMAIL, ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";

export function ConsultationSection() {
  const { t } = useLanguage();

  return (
    <section
      id="contact"
      data-consultation
      className="relative overflow-hidden bg-brand-ink py-12 text-white lg:py-16"
    >
      <div className="pointer-events-none absolute -left-40 top-1/2 size-96 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -top-48 size-[32rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="site-container relative grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:gap-20">
        <div data-consultation-copy className="lg:sticky lg:top-28">
          <p className="eyebrow">{t.contactPage.talkEyebrow}</p>
          <h2 className="max-w-xl text-balance text-3xl font-semibold leading-[1.12] tracking-[-.04em] sm:text-4xl">
            {t.contactPage.talkTitle}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/60">
            {t.contactPage.talkDesc}
          </p>

          <ul className="mt-9 hidden gap-4 border-t border-white/10 pt-7 lg:grid">
            {t.contactPage.commitments.map((item) => (
              <li
                className="flex items-center gap-3 text-sm text-white/75"
                key={item}
              >
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
              {t.contactPage.officesTitle}
            </p>
            <div className="mt-4 grid gap-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                <p className="font-semibold text-white">{t.contactPage.hanoiHq.title}</p>
                <p className="mt-1 text-white/70">{t.contactPage.hanoiHq.address}</p>
                <a className="mt-2 inline-flex items-center gap-1 text-teal-300 hover:underline" href={`tel:${t.contactPage.hanoiHq.phone}`}>
                  <Phone className="size-3" /> {t.contactPage.hanoiHq.phone}
                </a>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                <p className="font-semibold text-white">{t.contactPage.hcmcBranch.title}</p>
                <p className="mt-1 text-white/70">{t.contactPage.hcmcBranch.address}</p>
                <a className="mt-2 inline-flex items-center gap-1 text-teal-300 hover:underline" href={`tel:${t.contactPage.hcmcBranch.phone}`}>
                  <Phone className="size-3" /> {t.contactPage.hcmcBranch.phone}
                </a>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-white/50">
              {t.contactPage.taxInfo.label}: <strong className="text-white/80">{t.contactPage.taxInfo.code}</strong>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm">
            <a
              className="flex items-center gap-2 text-white/70 transition hover:text-white"
              href="tel:+842873004068"
            >
              <Phone className="size-4 text-primary" /> +84 28 7300 4068
            </a>
            <a
              className="flex items-center gap-2 text-white/70 transition hover:text-white"
              href={ROUTES.contactEmail}
            >
              <Mail className="size-4 text-primary" /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div
          data-consultation-form
          className="rounded-[2rem] border border-white/12 bg-white/[.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:p-10"
        >
          <div className="mb-7 flex items-start justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <p className="text-xl font-semibold">{t.contactPage.enquiryTitle}</p>
              <p className="mt-2 text-sm text-white/65">
                {t.contactPage.enquiryDesc}
              </p>
            </div>
            <span className="hidden items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary sm:flex">
              <Clock3 className="size-3.5" /> {t.contactPage.responseTime}
            </span>
          </div>
          <ConsultationForm />
        </div>
      </div>
    </section>
  );
}
