"use client";

import { useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerCourse } from "../api/mutations";
import { getZodFieldErrors } from "../utils/zod-errors";
import Link from "next/link";
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
  const { t } = useLanguage();
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
      if (error instanceof ZodError) {
        setFieldErrors(getZodFieldErrors<CourseField>(error));
        const field = error.issues[0]?.path[0];
        if (typeof field === "string") {
          (form.elements.namedItem(field) as HTMLElement | null)?.focus();
        }
        return;
      }
      const errText =
        error instanceof Error
          ? error.message
          : "An error occurred while submitting your registration.";
      setMessage(errText);
      toast.error(errText);
    }
  }

  const labelClass = "grid gap-[7px]";
  const inputClass =
    "h-[46px] w-full border border-white/25 bg-background/[.07] px-[13px] text-base text-white outline-none focus:border-white focus:bg-background/10";

  return (
    <form
      className="grid gap-[18px]"
      onSubmit={submit}
      noValidate
      aria-busy={status === "sending"}
    >
      <h3 className="text-2xl font-semibold text-white">
        {t.detailPage.enquireProgramme}
      </h3>
      <p className="text-white/70">{courseTitle}</p>
      <label className={labelClass} htmlFor="course-registration-name">
        <span className="text-xs font-semibold uppercase tracking-[.06em] text-white/70">
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
            className="text-xs text-red-100"
            role="alert"
          >
            {fieldErrors.name}
          </p>
        )}
      </label>

      <label className={labelClass} htmlFor="course-registration-phone">
        <span className="text-xs font-semibold uppercase tracking-[.06em] text-white/70">
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
            className="text-xs text-red-100"
            role="alert"
          >
            {fieldErrors.phone}
          </p>
        )}
      </label>
      <label className={labelClass} htmlFor="course-registration-email">
        <span className="text-xs font-semibold uppercase tracking-[.06em] text-white/70">
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
            className="text-xs text-red-100"
            role="alert"
          >
            {fieldErrors.email}
          </p>
        )}
      </label>
      <label
        className="flex items-start gap-3 text-xs leading-5 text-white/75"
        htmlFor="course-registration-consent"
      >
        <input
          id="course-registration-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 size-4 accent-primary"
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
            className="text-primary underline"
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
          className="text-xs text-red-100"
          role="alert"
        >
          {fieldErrors.consent}
        </p>
      )}
      <Button
        className="min-h-12 w-full rounded-xl"
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? t.forms.submitting : t.forms.submitRegistration}
        <span className="ml-[18px]">→</span>
      </Button>
      <p className="text-xs leading-5 text-white/75">
        {t.forms.registrationNotice}
      </p>
      {message && (
        <p
          className={`m-0 px-[11px] py-[9px] text-xs ${status === "success" ? "bg-emerald-300/15 text-emerald-100" : "bg-red-300/15 text-red-100"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
