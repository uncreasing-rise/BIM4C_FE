"use client";

import { useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerCourse } from "../api/mutations";
import { getZodFieldErrors } from "../utils/zod-errors";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

type CourseField = "name" | "phone" | "email" | "consent";

export function CourseRegistrationForm({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
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
      setMessage(result.message);
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
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể đăng ký lúc này.",
      );
    }
  }
  const labelClass = "grid gap-[7px]";
  const inputClass =
    "h-[46px] w-full border border-white/25 bg-background/[.07] px-[13px] text-white outline-none focus:border-white focus:bg-background/10";
  return (
    <form className="grid gap-[18px]" onSubmit={submit} noValidate>
      <h3 className="text-2xl font-semibold text-white">Đăng ký khóa học</h3>
      <p className="text-white/70">{courseTitle}</p>
      <label className={labelClass} htmlFor="course-registration-name">
        <span className="text-xs font-semibold uppercase tracking-[.06em] text-white/70">
          Họ và tên *
        </span>
        <Input
          id="course-registration-name"
          className={inputClass}
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "course-registration-name-error" : undefined}
        />
        {fieldErrors.name && <p id="course-registration-name-error" className="text-xs text-red-100" role="alert">{fieldErrors.name}</p>}
      </label>
      <label className="flex items-start gap-3 text-xs leading-5 text-white/75" htmlFor="course-registration-consent">
        <input id="course-registration-consent" name="consent" type="checkbox" required className="mt-1 size-4 accent-primary" aria-invalid={Boolean(fieldErrors.consent)} aria-describedby={fieldErrors.consent ? "course-registration-consent-error" : undefined} />
        <span>Tôi đã đọc và đồng ý với <Link className="text-primary underline" href={ROUTES.legalDetail("chinh-sach-bao-mat")} target="_blank">Chính sách bảo mật</Link> và việc xử lý dữ liệu cá nhân.</span>
      </label>
      {fieldErrors.consent && <p id="course-registration-consent-error" className="text-xs text-red-100" role="alert">{fieldErrors.consent}</p>}
      <label className={labelClass} htmlFor="course-registration-phone">
        <span className="text-xs font-semibold uppercase tracking-[.06em] text-white/70">
          Số điện thoại *
        </span>
        <Input
          id="course-registration-phone"
          className={inputClass}
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? "course-registration-phone-error" : undefined}
        />
        {fieldErrors.phone && <p id="course-registration-phone-error" className="text-xs text-red-100" role="alert">{fieldErrors.phone}</p>}
      </label>
      <label className={labelClass} htmlFor="course-registration-email">
        <span className="text-xs font-semibold uppercase tracking-[.06em] text-white/70">
          Email *
        </span>
        <Input
          id="course-registration-email"
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "course-registration-email-error" : undefined}
        />
        {fieldErrors.email && <p id="course-registration-email-error" className="text-xs text-red-100" role="alert">{fieldErrors.email}</p>}
      </label>
      <Button
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Đang gửi…" : "Đăng ký ngay"}
        <span className="ml-[18px]">→</span>
      </Button>
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
