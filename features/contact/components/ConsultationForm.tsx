"use client";

import { useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "../api/mutations";
import { getZodFieldErrors } from "../utils/zod-errors";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { contactSchema } from "../schemas/contact.schema";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

type ContactField =
  "name" | "phone" | "email" | "company" | "message" | "consent";

export function ConsultationForm({
  compact = false,
  subject,
}: {
  compact?: boolean;
  subject?: string;
}) {
  const { t, locale } = useLanguage();
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ContactField, string>>
  >({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    setFieldErrors({});
    try {
      const input = contactSchema.parse({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        company: String(data.get("company") ?? ""),
        message: String(data.get("message") ?? ""),
        consent: data.get("consent") === "on",
      });
      const result = await submitContactForm({
        ...input,
        message: `${subject ? `${subject}\n\n` : ""}${input.message}`,
      });
      form.reset();
      setStatus("success");
      setMessage(result.message || t.forms.thankYouDesc);
      toast.success(result.message || t.consultation.successMessage);
    } catch (error) {
      setStatus("error");
      if (error instanceof ZodError) {
        setFieldErrors(getZodFieldErrors<ContactField>(error, locale));
        const field = error.issues[0]?.path[0];
        if (typeof field === "string") {
          (form.elements.namedItem(field) as HTMLElement | null)?.focus();
        }
        return;
      }
      const errText =
        error instanceof Error
          ? error.message
          : locale === "vi"
            ? "Đã có lỗi xảy ra khi gửi thông tin của bạn."
            : "An error occurred while sending your enquiry.";
      setMessage(errText);
      toast.error(errText);
    }
  }

  const labelClass = "grid gap-2";
  const captionClass = "text-xs font-bold uppercase tracking-wider text-slate-200";
  const inputClass =
    "h-12 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-900/90 px-4 text-base text-white shadow-inner outline-none transition placeholder:text-slate-400 hover:border-slate-500 focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400/40";

  if (status === "success") {
    return (
      <div
        className="rounded-xl border border-teal-400/30 bg-teal-950/40 p-6"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          className="mb-4 size-9 text-teal-300"
          aria-hidden="true"
        />
        <h3 className="text-xl font-bold text-white">
          {t.forms.thankYouTitle}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-200">{message}</p>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {t.forms.thankYouDesc}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 border-teal-400/40 bg-teal-950/60 text-teal-200 hover:bg-teal-900/80 hover:text-white"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
        >
          {t.forms.sendAnother}
        </Button>
      </div>
    );
  }

  return (
    <form
      className="grid min-w-0 grid-cols-1 gap-[18px]"
      onSubmit={submit}
      noValidate
      aria-busy={status === "sending"}
    >
      <div
        className={`grid min-w-0 grid-cols-1 gap-4 ${compact ? "" : "sm:grid-cols-2"}`}
      >
        <label className={labelClass} htmlFor="consultation-name">
          <span className={captionClass}>{t.forms.fullName}</span>
          <Input
            id="consultation-name"
            className={inputClass}
            name="name"
            autoComplete="name"
            placeholder={t.forms.fullNamePlaceholder}
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={
              fieldErrors.name ? "consultation-name-error" : undefined
            }
          />
          {fieldErrors.name && (
            <p
              id="consultation-name-error"
              className="text-xs text-rose-400 font-medium"
              role="alert"
            >
              {fieldErrors.name}
            </p>
          )}
        </label>
        <label className={labelClass} htmlFor="consultation-phone">
          <span className={captionClass}>{t.forms.phone}</span>
          <Input
            id="consultation-phone"
            className={inputClass}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={t.forms.phonePlaceholder}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={
              fieldErrors.phone ? "consultation-phone-error" : undefined
            }
          />
          {fieldErrors.phone && (
            <p
              id="consultation-phone-error"
              className="text-xs text-rose-400 font-medium"
              role="alert"
            >
              {fieldErrors.phone}
            </p>
          )}
        </label>
        <label className={labelClass} htmlFor="consultation-email">
          <span className={captionClass}>{t.forms.workEmail}</span>
          <Input
            id="consultation-email"
            className={inputClass}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t.forms.workEmailPlaceholder}
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "consultation-email-error" : undefined
            }
          />
          {fieldErrors.email && (
            <p
              id="consultation-email-error"
              className="text-xs text-rose-400 font-medium"
              role="alert"
            >
              {fieldErrors.email}
            </p>
          )}
        </label>
        {!compact && (
          <label className={labelClass} htmlFor="consultation-company">
            <span className={captionClass}>{t.forms.company}</span>
            <Input
              id="consultation-company"
              className={inputClass}
              name="company"
              autoComplete="organization"
              placeholder={t.forms.companyPlaceholder}
              aria-invalid={Boolean(fieldErrors.company)}
              aria-describedby={
                fieldErrors.company ? "consultation-company-error" : undefined
              }
            />
            {fieldErrors.company && (
              <p
                id="consultation-company-error"
                className="text-xs text-rose-400 font-medium"
                role="alert"
              >
                {fieldErrors.company}
              </p>
            )}
          </label>
        )}
      </div>
      <label className={labelClass} htmlFor="consultation-message">
        <span className={captionClass}>{t.forms.message}</span>
        <Textarea
          id="consultation-message"
          className="min-h-28 w-full min-w-0 resize-y rounded-xl border border-slate-700 bg-slate-900/90 p-4 text-base leading-6 text-white shadow-inner outline-none transition placeholder:text-slate-400 hover:border-slate-500 focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400/40"
          name="message"
          rows={compact ? 3 : 4}
          required
          placeholder={t.forms.messagePlaceholder}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={
            fieldErrors.message ? "consultation-message-error" : undefined
          }
        />
        {fieldErrors.message && (
          <p
            id="consultation-message-error"
            className="text-xs text-rose-400 font-medium"
            role="alert"
          >
            {fieldErrors.message}
          </p>
        )}
      </label>
      <label
        className="flex items-start gap-3 text-xs leading-5 text-slate-200 font-medium"
        htmlFor="consultation-consent"
      >
        <input
          id="consultation-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 size-4 accent-teal-400 rounded"
          aria-invalid={Boolean(fieldErrors.consent)}
          aria-describedby={
            fieldErrors.consent ? "consultation-consent-error" : undefined
          }
        />
        <span>
          {t.forms.consentLabel}{" "}
          <Link
            className="text-teal-300 font-bold underline hover:text-teal-200"
            href={ROUTES.legalDetail("chinh-sach-bao-mat")}
            target="_blank"
          >
            {t.forms.privacyPolicy}
          </Link>{" "}
          {t.forms.consentSuffix}
        </span>
      </label>
      {fieldErrors.consent && (
        <p
          id="consultation-consent-error"
          className="text-xs text-rose-400 font-medium"
          role="alert"
        >
          {fieldErrors.consent}
        </p>
      )}
      <div
        className={`flex flex-col gap-3 border-t border-white/15 pt-5 ${compact ? "" : "sm:items-start"}`}
      >
        <Button
          type="submit"
          size="lg"
          className={`min-h-12 max-w-full rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold shadow-lg shadow-teal-500/25 transition-all ${compact ? "w-full" : "w-full sm:w-auto px-8"}`}
          disabled={status === "sending"}
        >
          {status === "sending" ? t.forms.submitting : t.forms.submitEnquiry}
          <span>→</span>
        </Button>
        <small className="text-xs leading-5 text-slate-300 font-medium">
          {t.forms.dataProtectionNote}
        </small>
      </div>
      {message && (
        <p
          className="m-0 col-span-full rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-3 text-sm leading-6 text-red-200 font-medium"
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
