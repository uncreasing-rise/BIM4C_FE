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

type ContactField = "name" | "phone" | "email" | "company" | "message" | "consent";

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
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    setFieldErrors({});
    try {
      const result = await submitContactForm({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        company: String(data.get("company") ?? ""),
        message: `${subject ? `${subject}\n\n` : ""}${String(data.get("message") ?? "")}`,
        consent: data.get("consent") === "on",
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
          : "Không thể gửi yêu cầu lúc này.",
      );
    }
  }

  const labelClass = "grid gap-2";
  const captionClass =
    "text-[11px] font-semibold uppercase tracking-[.1em] text-white/65";
  const inputClass =
    "h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-4 text-[15px] text-white shadow-none outline-none transition placeholder:text-white/30 hover:border-white/25 focus-visible:border-primary focus-visible:bg-white/[.09] focus-visible:ring-3 focus-visible:ring-primary/15";
  return (
    <form className="grid grid-cols-1 gap-[18px]" onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass} htmlFor="consultation-name">
          <span className={captionClass}>Họ và tên *</span>
          <Input
            id="consultation-name"
            className={inputClass}
            name="name"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "consultation-name-error" : undefined}
          />
          {fieldErrors.name && <p id="consultation-name-error" className="text-xs text-red-100" role="alert">{fieldErrors.name}</p>}
        </label>
        <label className={labelClass} htmlFor="consultation-phone">
          <span className={captionClass}>Số điện thoại</span>
          <Input
            id="consultation-phone"
            className={inputClass}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="090 000 0000"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "consultation-phone-error" : undefined}
          />
          {fieldErrors.phone && <p id="consultation-phone-error" className="text-xs text-red-100" role="alert">{fieldErrors.phone}</p>}
        </label>
        <label className={labelClass} htmlFor="consultation-email">
          <span className={captionClass}>Email *</span>
          <Input
            id="consultation-email"
            className={inputClass}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "consultation-email-error" : undefined}
          />
          {fieldErrors.email && <p id="consultation-email-error" className="text-xs text-red-100" role="alert">{fieldErrors.email}</p>}
        </label>
        {!compact && (
          <label className={labelClass} htmlFor="consultation-company">
            <span className={captionClass}>Công ty</span>
            <Input
              id="consultation-company"
              className={inputClass}
              name="company"
              autoComplete="organization"
              placeholder="Tên doanh nghiệp"
              aria-invalid={Boolean(fieldErrors.company)}
              aria-describedby={fieldErrors.company ? "consultation-company-error" : undefined}
            />
            {fieldErrors.company && <p id="consultation-company-error" className="text-xs text-red-100" role="alert">{fieldErrors.company}</p>}
          </label>
        )}
      </div>
      <label className={labelClass} htmlFor="consultation-message">
        <span className={captionClass}>Nội dung cần tư vấn *</span>
        <Textarea
          id="consultation-message"
          className="min-h-32 w-full resize-y rounded-xl border border-white/15 bg-white/[.06] p-4 text-[15px] leading-6 text-white shadow-none outline-none transition placeholder:text-white/30 hover:border-white/25 focus-visible:border-primary focus-visible:bg-white/[.09] focus-visible:ring-3 focus-visible:ring-primary/15"
          name="message"
          rows={compact ? 3 : 4}
          required
          placeholder="Mô tả ngắn nhu cầu hoặc dự án của bạn"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "consultation-message-error" : undefined}
        />
        {fieldErrors.message && <p id="consultation-message-error" className="text-xs text-red-100" role="alert">{fieldErrors.message}</p>}
      </label>
      <label className="flex items-start gap-3 text-xs leading-5 text-white/75" htmlFor="consultation-consent">
        <input id="consultation-consent" name="consent" type="checkbox" required className="mt-1 size-4 accent-primary" aria-invalid={Boolean(fieldErrors.consent)} aria-describedby={fieldErrors.consent ? "consultation-consent-error" : undefined} />
        <span>Tôi đã đọc và đồng ý với <Link className="text-primary underline" href={ROUTES.legalDetail("chinh-sach-bao-mat")} target="_blank">Chính sách bảo mật</Link> và việc xử lý dữ liệu cá nhân.</span>
      </label>
      {fieldErrors.consent && <p id="consultation-consent-error" className="text-xs text-red-100" role="alert">{fieldErrors.consent}</p>}
      <div className="flex flex-col items-start gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          size="lg"
          className="min-w-48 rounded-full"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Đang gửi…" : "Gửi yêu cầu tư vấn"}
          <span>→</span>
        </Button>
        <small className="max-w-56 text-xs leading-5 text-white/45">
          BIM4C chỉ sử dụng thông tin để liên hệ tư vấn.
        </small>
      </div>
      {message && (
        <p
          className={`m-0 col-span-full px-[11px] py-[9px] text-xs leading-[1.45] ${status === "success" ? "bg-emerald-300/15 text-emerald-100" : "bg-red-300/15 text-red-100"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
