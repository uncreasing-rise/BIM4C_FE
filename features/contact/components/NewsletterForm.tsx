"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { subscribeNewsletter } from "../api/mutations";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function NewsletterForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => () => abortController.current?.abort(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    abortController.current?.abort();
    abortController.current = new AbortController();
    setStatus("submitting");
    setMessage("");
    try {
      const consent = formData.get("consent") === "on";
      const result = await subscribeNewsletter({ email: String(formData.get("email") ?? ""), consent }, abortController.current.signal);
      setStatus("success");
      setMessage(result.message);
      form.reset();
    } catch (error) {
      setStatus("error");
      if (error instanceof z.ZodError) setMessage(error.issues[0]?.message ?? "Thông tin chưa hợp lệ.");
      else setMessage(error instanceof ApiError ? error.message : "Không thể đăng ký lúc này.");
    }
  }

  return <form onSubmit={handleSubmit} noValidate>
    <label htmlFor="newsletter-email">Email của bạn</label>
    <div><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="name@company.com" required aria-invalid={status === "error"}/><button type="submit" disabled={status === "submitting"} aria-label="Đăng ký">{status === "submitting" ? "…" : "→"}</button></div>
    <label className="consent"><input name="consent" type="checkbox" required/> Tôi đồng ý nhận thông tin từ BIM4C.</label>
    {message && <p className={`form-feedback is-${status}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
  </form>;
}
