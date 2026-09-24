"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerCourse } from "../api/mutations";
import { getZodFieldErrors, isValidationError } from "../utils/zod-errors";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";

type CourseField = "name" | "phone" | "email" | "consent";

export function CourseRegistrationForm({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const { t, locale } = useLanguage();
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<CourseField, string>>
  >({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    setFieldErrors({});
    try {
      const result = await registerCourse({
        courseId,
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        consent: data.get("consent") === "on",
      });
      form.reset();
      setStatus("success");
      setMessage(result.message || t.forms.thankYouDesc);
      toast.success(result.message || t.forms.thankYouTitle);
    } catch (error) {
      setStatus("error");
      if (isValidationError(error)) {
        setFieldErrors(getZodFieldErrors<CourseField>(error, locale));
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
            ? "Đã có lỗi xảy ra khi gửi đăng ký khóa học. Vui lòng thử lại."
            : "An error occurred while submitting your registration.";
      setMessage(errText);
      toast.error(errText);
    }
  }

  const labelClass = "grid gap-2";
  const inputClass =
    "h-12 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-900/90 px-4 text-base text-white shadow-inner outline-none transition placeholder:text-slate-400 hover:border-slate-500 focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400/40";

  return (
    <form
      className="grid gap-5"
      onSubmit={submit}
      noValidate
      aria-busy={status === "sending"}
    >
      <div>
        <h3 className="text-xl font-bold text-white">
          {t.detailPage.enquireProgramme}
        </h3>
        <p className="text-sm font-semibold text-teal-300 mt-1">{courseTitle}</p>
      </div>

      <label className={labelClass} htmlFor="course-registration-name">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
          {t.forms.fullName}
        </span>
        <Input
          id="course-registration-name"
          className={inputClass}
          name="name"
          autoComplete="name"
          placeholder={t.forms.fullNamePlaceholder}
          required
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={
            fieldErrors.name ? "course-registration-name-error" : undefined
          }
        />
        {fieldErrors.name && (
          <p
            id="course-registration-name-error"
            className="text-xs font-medium text-rose-400"
            role="alert"
          >
            {fieldErrors.name}
          </p>
        )}
      </label>

      <label className={labelClass} htmlFor="course-registration-phone">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
          {t.forms.phone}
        </span>
        <Input
          id="course-registration-phone"
          className={inputClass}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={t.forms.phonePlaceholder}
          required
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={
            fieldErrors.phone ? "course-registration-phone-error" : undefined
          }
        />
        {fieldErrors.phone && (
          <p
            id="course-registration-phone-error"
            className="text-xs font-medium text-rose-400"
            role="alert"
          >
            {fieldErrors.phone}
          </p>
        )}
      </label>
      <label className={labelClass} htmlFor="course-registration-email">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
          {t.forms.workEmail}
        </span>
        <Input
          id="course-registration-email"
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t.forms.workEmailPlaceholder}
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "course-registration-email-error" : undefined
          }
        />
        {fieldErrors.email && (
          <p
            id="course-registration-email-error"
            className="text-xs font-medium text-rose-400"
            role="alert"
          >
            {fieldErrors.email}
          </p>
        )}
      </label>
      <label
        className="flex items-start gap-3 text-xs leading-5 text-slate-200 font-medium"
        htmlFor="course-registration-consent"
      >
        <input
          id="course-registration-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 size-4 accent-teal-400 rounded"
          aria-invalid={Boolean(fieldErrors.consent)}
          aria-describedby={
            fieldErrors.consent
              ? "course-registration-consent-error"
              : undefined
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
          id="course-registration-consent-error"
          className="text-xs font-medium text-rose-400"
          role="alert"
        >
          {fieldErrors.consent}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="min-h-12 w-full rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold shadow-lg shadow-teal-500/25 transition-all"
        disabled={status === "sending"}
      >
        {status === "sending"
          ? t.forms.submitting
          : t.forms.submitRegistration}
        <span>→</span>
      </Button>
      <small className="text-xs leading-5 text-slate-300 font-medium">
        {t.forms.dataProtectionNote}
      </small>
      {message && (
        <p
          className={`m-0 px-[11px] py-[9px] text-xs rounded-lg ${status === "success" ? "bg-emerald-300/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
