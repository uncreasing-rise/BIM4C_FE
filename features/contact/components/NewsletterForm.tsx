"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscribeNewsletter } from "../api/mutations";
import { getZodFieldErrors } from "../utils/zod-errors";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

type FormStatus = "idle" | "submitting" | "success" | "error";
type NewsletterField = "email" | "consent";

export function NewsletterForm() {
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
        if (field === "email") document.getElementById("newsletter-email")?.focus();
        if (field === "consent") document.getElementById("newsletter-consent")?.focus();
        return;
      }
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Không thể đăng ký lúc này.",
      );
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Label className="mb-2 block text-xs" htmlFor="newsletter-email">
        Email của bạn
      </Label>
      <div className="flex">
        <Input
          className="h-[46px] min-w-0 w-full border border-r-0 border-white/40 bg-transparent px-3 text-white outline-none placeholder:text-white/50 focus:border-white"
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "newsletter-email-error" : undefined}
        />
        <Button
          className="h-[46px] w-12 rounded-l-none"
          type="submit"
          disabled={status === "submitting"}
          aria-label="Đăng ký"
        >
          {status === "submitting" ? "…" : "→"}
        </Button>
      </div>
      {fieldErrors.email && <p id="newsletter-email-error" className="mt-2 text-xs text-red-200" role="alert">{fieldErrors.email}</p>}
      <Label className="mt-3 flex items-start gap-2 text-xs leading-normal text-white/70" htmlFor="newsletter-consent">
        <Checkbox
          id="newsletter-consent"
          className="mt-0.5"
          name="consent"
          required
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          aria-invalid={Boolean(fieldErrors.consent)}
          aria-describedby={fieldErrors.consent ? "newsletter-consent-error" : undefined}
        /> <span>Tôi đồng ý nhận thông tin từ BIM4C và với việc xử lý dữ liệu cá nhân theo <Link className="text-primary underline" href={ROUTES.legalDetail("chinh-sach-bao-mat")} target="_blank">Chính sách bảo mật</Link>.</span>
      </Label>
      {fieldErrors.consent && <p id="newsletter-consent-error" className="mt-2 text-xs text-red-200" role="alert">{fieldErrors.consent}</p>}
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
