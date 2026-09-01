"use client";

import { useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { registerCourse } from "../api/mutations";

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
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    try {
      const result = await registerCourse({
        courseId,
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
      });
      form.reset();
      setStatus("success");
      setMessage(result.message);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof ZodError
          ? (error.issues[0]?.message ?? "Thông tin chưa hợp lệ.")
          : error instanceof Error
            ? error.message
            : "Không thể đăng ký lúc này.",
      );
    }
  }
  const labelClass = "grid gap-[7px]";
  const inputClass =
    "h-[46px] w-full border border-white/25 bg-white/[.07] px-[13px] text-white outline-none focus:border-[#ffffff] focus:bg-white/10";
  return (
    <form className="grid gap-[18px]" onSubmit={submit} noValidate>
      <h3 className="text-2xl font-semibold text-white">Đăng ký khóa học</h3>
      <p className="text-white/70">{courseTitle}</p>
      <label className={labelClass}>
        <span className="text-micro font-semibold uppercase tracking-[.06em] text-white/70">
          Họ và tên *
        </span>
        <input
          className={inputClass}
          name="name"
          autoComplete="name"
          required
        />
      </label>
      <label className={labelClass}>
        <span className="text-micro font-semibold uppercase tracking-[.06em] text-white/70">
          Số điện thoại *
        </span>
        <input
          className={inputClass}
          name="phone"
          type="tel"
          autoComplete="tel"
          required
        />
      </label>
      <label className={labelClass}>
        <span className="text-micro font-semibold uppercase tracking-[.06em] text-white/70">
          Email *
        </span>
        <input
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <button
        className="min-h-[46px] bg-[#09a7a5] px-[18px] text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-55"
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Đang gửi…" : "Đăng ký ngay"}
        <span className="ml-[18px]">→</span>
      </button>
      {message && (
        <p
          className={`m-0 px-[11px] py-[9px] text-xs ${status === "success" ? "bg-emerald-300/15 text-emerald-100" : "bg-red-300/15 text-red-100"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
