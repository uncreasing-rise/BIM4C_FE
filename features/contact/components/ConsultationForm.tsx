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

  return <form className={`lead-form${compact ? " compact" : ""}`} onSubmit={submit} noValidate>
    <div className="lead-form-grid"><label><span>Họ và tên *</span><input name="name" autoComplete="name" required /></label><label><span>Số điện thoại</span><input name="phone" type="tel" autoComplete="tel" /></label><label><span>Email *</span><input name="email" type="email" autoComplete="email" required /></label>{!compact && <label><span>Công ty</span><input name="company" autoComplete="organization" /></label>}</div>
    <label><span>Nội dung cần tư vấn *</span><textarea name="message" rows={compact ? 3 : 4} required placeholder="Mô tả ngắn nhu cầu hoặc dự án của bạn" /></label>
    <div className="lead-form-submit"><button type="submit" disabled={status === "sending"}>{status === "sending" ? "Đang gửi…" : "Gửi yêu cầu tư vấn"}<span>→</span></button><small>BIM4C sẽ liên hệ trong thời gian sớm nhất.</small></div>
    {message && <p className={`lead-form-message ${status}`} role="status">{message}</p>}
  </form>;
}
