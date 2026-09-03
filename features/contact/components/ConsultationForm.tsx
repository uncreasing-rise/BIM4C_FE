"use client";

import { useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "../api/mutations";
import { getZodFieldErrors } from "../utils/zod-errors";

type ContactField = "name" | "phone" | "email" | "company" | "message";

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

  const labelClass = "grid gap-[7px]";
  const captionClass =
    "text-xs font-semibold uppercase tracking-[.06em] text-white/70";
  const inputClass =
    "h-12 w-full border border-white/25 bg-background/[.07] px-[13px] text-[16px] text-white outline-none transition focus:border-white focus:bg-background/10";
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
          className="w-full resize-y border border-white/25 bg-background/[.07] p-[13px] text-white outline-none transition placeholder:text-white/45 focus:border-white focus:bg-background/10"
          name="message"
          rows={compact ? 3 : 4}
          required
          placeholder="Mô tả ngắn nhu cầu hoặc dự án của bạn"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "consultation-message-error" : undefined}
        />
        {fieldErrors.message && <p id="consultation-message-error" className="text-xs text-red-100" role="alert">{fieldErrors.message}</p>}
      </label>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Đang gửi…" : "Gửi yêu cầu tư vấn"}
          <span>→</span>
        </Button>
        <small className="text-xs text-white/55">
          BIM4C sẽ liên hệ trong thời gian sớm nhất.
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
