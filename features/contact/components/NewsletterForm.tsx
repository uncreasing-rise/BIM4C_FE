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
    <label className="mb-2 block text-xs" htmlFor="newsletter-email">Email của bạn</label>
    <div className="flex"><input className="h-[46px] min-w-0 w-full border border-r-0 border-white/40 bg-transparent px-3 text-white outline-none placeholder:text-white/50 focus:border-white" id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="name@company.com" required aria-invalid={status === "error"}/><button className="h-[46px] w-12 bg-[#09a7a5] text-xl font-bold text-[#063f46] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={status === "submitting"} aria-label="Đăng ký">{status === "submitting" ? "…" : "→"}</button></div>
    <label className="mt-3 flex items-start gap-2 text-micro leading-normal text-white/70"><input className="mt-0.5" name="consent" type="checkbox" required/> Tôi đồng ý nhận thông tin từ BIM4C.</label>
    {message && <p className={`mt-3 text-xs ${status === "error" ? "text-red-200" : "text-emerald-200"}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
  </form>;
}
