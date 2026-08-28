"use client";

import { useState, type FormEvent } from "react";
import { ZodError } from "zod";
import { submitContactForm } from "../api/mutations";

export function ConsultationForm({ compact = false, subject }: { compact?: boolean; subject?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
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
      setMessage(error instanceof ZodError ? error.issues[0]?.message ?? "Thông tin chưa hợp lệ." : error instanceof Error ? error.message : "Không thể gửi yêu cầu lúc này.");
    }
  }

  const labelClass = "grid gap-[7px]";
  const captionClass = "text-micro font-semibold uppercase tracking-[.06em] text-white/70";
  const inputClass = "h-12 w-full border border-white/25 bg-white/[.07] px-[13px] text-[16px] text-white outline-none transition focus:border-[#ffffff] focus:bg-white/10";
  return <form className="grid grid-cols-1 gap-[18px]" onSubmit={submit} noValidate>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className={labelClass}><span className={captionClass}>Họ và tên *</span><input className={inputClass} name="name" autoComplete="name" required /></label><label className={labelClass}><span className={captionClass}>Số điện thoại</span><input className={inputClass} name="phone" type="tel" autoComplete="tel" /></label><label className={labelClass}><span className={captionClass}>Email *</span><input className={inputClass} name="email" type="email" autoComplete="email" required /></label>{!compact && <label className={labelClass}><span className={captionClass}>Công ty</span><input className={inputClass} name="company" autoComplete="organization" /></label>}</div>
    <label className={labelClass}><span className={captionClass}>Nội dung cần tư vấn *</span><textarea className="w-full resize-y border border-white/25 bg-white/[.07] p-[13px] text-white outline-none transition placeholder:text-white/45 focus:border-[#ffffff] focus:bg-white/10" name="message" rows={compact ? 3 : 4} required placeholder="Mô tả ngắn nhu cầu hoặc dự án của bạn" /></label>
    <div className="flex flex-col items-start gap-[18px] sm:flex-row sm:items-center"><button className="min-h-[46px] bg-[#09a7a5] px-5 text-[16px] font-semibold text-white disabled:cursor-wait disabled:opacity-55" type="submit" disabled={status === "sending"}>{status === "sending" ? "Đang gửi…" : "Gửi yêu cầu tư vấn"}<span className="ml-[18px]">→</span></button><small className="text-micro text-white/55">BIM4C sẽ liên hệ trong thời gian sớm nhất.</small></div>
    {message && <p className={`m-0 col-span-full px-[11px] py-[9px] text-xs leading-[1.45] ${status === "success" ? "bg-emerald-300/15 text-emerald-100" : "bg-red-300/15 text-red-100"}`} role="status">{message}</p>}
  </form>;
}
