"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import Link from "next/link";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/lib/i18n/context";
import { subscribeNewsletter } from "../api/mutations";
import { getZodFieldErrors } from "../utils/zod-errors";

type FormStatus = "idle" | "submitting" | "success" | "error";
type NewsletterField = "email" | "consent";

export function NewsletterForm() {
  const formId = useId();
  const { t } = useLanguage();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<NewsletterField, string>>
  >({});
  const abortController = useRef<AbortController | null>(null);
  const submitting = useRef(false);

  useEffect(() => () => abortController.current?.abort(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const form = event.currentTarget;
    const formData = new FormData(form);
    abortController.current?.abort();
    abortController.current = new AbortController();
    setStatus("submitting");
    setMessage("");
    setFieldErrors({});
    try {
      const consent = formData.get("consent") === "on";
      const result = await subscribeNewsletter(
        { email: String(formData.get("email") ?? ""), consent },
        abortController.current.signal,
      );
      setStatus("success");
      setMessage(result.message);
      form.reset();
      setConsent(false);
    } catch (error) {
      setStatus("error");
      if (error instanceof z.ZodError) {
        setFieldErrors(getZodFieldErrors<NewsletterField>(error));
        const field = error.issues[0]?.path[0];
        if (field === "email")
          document.getElementById(`${formId}-newsletter-email`)?.focus();
        if (field === "consent")
          document.getElementById(`${formId}-newsletter-consent`)?.focus();
        return;
      }
      setMessage(
        error instanceof ApiError
          ? error.message
          : "We could not subscribe you right now.",
      );
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "submitting"}
    >
      <Label
        className="mb-2 block text-xs"
        htmlFor={`${formId}-newsletter-email`}
      >
        {t.consultation.emailLabel}
      </Label>
      <div className="flex">
        <Input
          className="h-[46px] min-w-0 w-full border border-r-0 border-white/40 bg-transparent px-3 text-base text-white outline-none placeholder:text-white/65 focus:border-white"
          id={`${formId}-newsletter-email`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t.footer.emailPlaceholder}
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? `${formId}-newsletter-email-error` : undefined
          }
        />
        <Button
          className="h-[46px] w-12 rounded-l-none"
          type="submit"
          disabled={status === "submitting"}
          aria-label={t.footer.subscribeButton}
        >
          {status === "submitting" ? "…" : "→"}
        </Button>
      </div>
      {fieldErrors.email && (
        <p
          id={`${formId}-newsletter-email-error`}
          className="mt-2 text-xs text-red-200"
          role="alert"
        >
          {fieldErrors.email}
        </p>
      )}
      <Label
        className="mt-3 flex items-start gap-2 text-xs leading-normal text-white/70"
        htmlFor={`${formId}-newsletter-consent`}
      >
        <Checkbox
          id={`${formId}-newsletter-consent`}
          className="mt-0.5"
          name="consent"
          required
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          aria-invalid={Boolean(fieldErrors.consent)}
          aria-describedby={
            fieldErrors.consent
              ? `${formId}-newsletter-consent-error`
              : undefined
          }
        />{" "}
        <span>
          {t.footer.consentText}{" "}
          <Link
            className="text-primary underline"
            href={ROUTES.legalDetail("chinh-sach-bao-mat")}
            target="_blank"
          >
            {t.footer.privacyLink}
          </Link>
          .
        </span>
      </Label>
      {fieldErrors.consent && (
        <p
          id={`${formId}-newsletter-consent-error`}
          className="mt-2 text-xs text-red-200"
          role="alert"
        >
          {fieldErrors.consent}
        </p>
      )}
      {message && (
        <p
          className={`mt-3 text-xs ${status === "error" ? "text-red-200" : "text-emerald-200"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
