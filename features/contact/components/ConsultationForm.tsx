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

type ContactField =
  "name" | "phone" | "email" | "company" | "message" | "consent";

export function ConsultationForm({
  compact = false,
  subject,
}: {
  compact?: boolean;
  subject?: string;
}) {
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
      setMessage(result.message);
    } catch (error) {
      setStatus("error");
      if (error instanceof ZodError) {
        setFieldErrors(getZodFieldErrors<ContactField>(error));
        const field = error.issues[0]?.path[0];
        if (typeof field === "string") {
          (form.elements.namedItem(field) as HTMLElement | null)?.focus();
        }
        return;
      }
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not send your enquiry right now.",
      );
    }
  }

  const labelClass = "grid gap-2";
  const captionClass = "text-xs font-medium text-white/85";
  const inputClass =
    "h-12 w-full min-w-0 rounded-xl border border-white/30 bg-white/[.06] px-4 text-base text-white shadow-none outline-none transition placeholder:text-white/65 hover:border-white/50 focus-visible:border-white focus-visible:ring-3 focus-visible:ring-white/30";
  if (status === "success") {
    return (
      <div
        className="rounded-xl border border-teal-200/25 bg-teal-200/10 p-6"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          className="mb-4 size-9 text-teal-200"
          aria-hidden="true"
        />
        <h3 className="text-xl font-semibold text-white">
          Thank you for getting in touch.
        </h3>
        <p className="mt-3 text-sm leading-7 text-white/85">{message}</p>
        <p className="mt-3 text-sm leading-7 text-white/75">
          Our team will review your enquiry and contact you using the details
          you provided.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
        >
          Send another enquiry
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
          <span className={captionClass}>Full name *</span>
          <Input
            id="consultation-name"
            className={inputClass}
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={
              fieldErrors.name ? "consultation-name-error" : undefined
            }
          />
          {fieldErrors.name && (
            <p
              id="consultation-name-error"
              className="text-xs text-red-100"
              role="alert"
            >
              {fieldErrors.name}
            </p>
          )}
        </label>
        <label className={labelClass} htmlFor="consultation-phone">
          <span className={captionClass}>Phone number (optional)</span>
          <Input
            id="consultation-phone"
            className={inputClass}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="090 000 0000"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={
              fieldErrors.phone ? "consultation-phone-error" : undefined
            }
          />
          {fieldErrors.phone && (
            <p
              id="consultation-phone-error"
              className="text-xs text-red-100"
              role="alert"
            >
              {fieldErrors.phone}
            </p>
          )}
        </label>
        <label className={labelClass} htmlFor="consultation-email">
          <span className={captionClass}>Email *</span>
          <Input
            id="consultation-email"
            className={inputClass}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "consultation-email-error" : undefined
            }
          />
          {fieldErrors.email && (
            <p
              id="consultation-email-error"
              className="text-xs text-red-100"
              role="alert"
            >
              {fieldErrors.email}
            </p>
          )}
        </label>
        {!compact && (
          <label className={labelClass} htmlFor="consultation-company">
            <span className={captionClass}>Company (optional)</span>
            <Input
              id="consultation-company"
              className={inputClass}
              name="company"
              autoComplete="organization"
              placeholder="Your organization"
              aria-invalid={Boolean(fieldErrors.company)}
              aria-describedby={
                fieldErrors.company ? "consultation-company-error" : undefined
              }
            />
            {fieldErrors.company && (
              <p
                id="consultation-company-error"
                className="text-xs text-red-100"
                role="alert"
              >
                {fieldErrors.company}
              </p>
            )}
          </label>
        )}
      </div>
      <label className={labelClass} htmlFor="consultation-message">
        <span className={captionClass}>How can we help? *</span>
        <Textarea
          id="consultation-message"
          className="min-h-32 w-full min-w-0 resize-y rounded-xl border border-white/30 bg-white/[.06] p-4 text-base leading-6 text-white shadow-none outline-none transition placeholder:text-white/65 hover:border-white/50 focus-visible:border-white focus-visible:ring-3 focus-visible:ring-white/30"
          name="message"
          rows={compact ? 3 : 4}
          required
          placeholder="What are you working on, and where would you like our help?"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={
            fieldErrors.message ? "consultation-message-error" : undefined
          }
        />
        {fieldErrors.message && (
          <p
            id="consultation-message-error"
            className="text-xs text-red-100"
            role="alert"
          >
            {fieldErrors.message}
          </p>
        )}
      </label>
      <label
        className="flex items-start gap-3 text-xs leading-5 text-white/75"
        htmlFor="consultation-consent"
      >
        <input
          id="consultation-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 size-4 accent-primary"
          aria-invalid={Boolean(fieldErrors.consent)}
          aria-describedby={
            fieldErrors.consent ? "consultation-consent-error" : undefined
          }
        />
        <span>
          I have read and agree to the{" "}
          <Link
            className="text-primary underline"
            href={ROUTES.legalDetail("chinh-sach-bao-mat")}
            target="_blank"
          >
            Privacy Policy
          </Link>{" "}
          and the processing of my personal data.
        </span>
      </label>
      {fieldErrors.consent && (
        <p
          id="consultation-consent-error"
          className="text-xs text-red-100"
          role="alert"
        >
          {fieldErrors.consent}
        </p>
      )}
      <div
        className={`flex flex-col gap-4 border-t border-white/10 pt-5 ${compact ? "" : "sm:items-start"}`}
      >
        <Button
          type="submit"
          size="lg"
          className={`min-h-12 max-w-full rounded-full ${compact ? "w-full" : "w-full sm:w-auto"}`}
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send project enquiry"}
          <span>→</span>
        </Button>
        <small className="text-xs leading-5 text-white/75">
          BIM4C only uses this information to respond to your enquiry.
        </small>
      </div>
      {message && (
        <p
          className="m-0 col-span-full rounded-lg bg-red-300/15 px-3 py-3 text-sm leading-6 text-red-100"
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
