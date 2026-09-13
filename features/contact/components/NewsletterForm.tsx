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

import { toast } from "sonner";

type FormStatus = "idle" | "submitting" | "success" | "error";
type NewsletterField = "email" | "consent";

export function NewsletterForm() {
  const formId = useId();
  const { t, locale } = useLanguage();
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
      toast.success(
        result.message ||
          (locale === "vi"
            ? "Cảm ơn bạn đã đăng ký nhận tin từ BIM4C!"
            : "Thank you for subscribing to BIM4C updates!"),
      );
      form.reset();
      setConsent(false);
    } catch (error) {
      setStatus("error");
      if (error instanceof z.ZodError) {
        setFieldErrors(getZodFieldErrors<NewsletterField>(error, locale));
        const field = error.issues[0]?.path[0];
        if (field === "email")
          document.getElementById(`${formId}-newsletter-email`)?.focus();
        if (field === "consent")
          document.getElementById(`${formId}-newsletter-consent`)?.focus();
        return;
      }
      const errText =
        error instanceof ApiError
          ? error.message
          : locale === "vi"
            ? "Không thể đăng ký lúc này. Vui lòng thử lại sau."
            : "We could not subscribe you right now.";
      setMessage(errText);
      toast.error(errText);
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
          {status === "submitting" ? (
            <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "→"
          )}
        </Button>
      </div>
      {fieldErrors.email && (
        <p
          id={`${formId}-newsletter-email-error`}
          className="mt-2 text-xs font-medium text-rose-400"
          role="alert"
        >
          {fieldErrors.email}
        </p>
      )}
      <Label
        className="mt-3 flex items-start gap-2 text-xs leading-normal text-white/70 cursor-pointer"
        htmlFor={`${formId}-newsletter-consent`}
      >
        <Checkbox
          id={`${formId}-newsletter-consent`}
          className="mt-0.5 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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
          className="mt-2 text-xs font-medium text-rose-400"
          role="alert"
        >
          {fieldErrors.consent}
        </p>
      )}
      {message && (
        <p
          className={`mt-3 text-xs p-2 rounded-lg ${status === "error" ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
