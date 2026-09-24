"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { env } from "@/lib/config/env";
import { setAdminAccessToken } from "@/features/admin/auth";
import { CONTACT_EMAIL } from "@/constants/routes";

/** Backend messages are English; show admins a Vietnamese explanation. */
function loginErrorMessage(status: number): string {
  if (status === 401) return "Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.";
  if (status === 429) return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi một phút rồi thử lại.";
  if (status === 422) return "Vui lòng nhập email hợp lệ và mật khẩu tối thiểu 8 ký tự.";
  if (status >= 500) return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.";
  return "Không thể đăng nhập. Vui lòng thử lại.";
}

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${env.apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!response.ok) throw new Error(loginErrorMessage(response.status));
      const result = (await response.json()) as { token?: string };
      if (!result.token) throw new Error("Máy chủ không trả về phiên đăng nhập. Vui lòng thử lại.");
      setAdminAccessToken(result.token);
      const next = params.get("next");
      window.location.href = next?.startsWith("/admin") && next !== "/admin/login" ? next : "/admin";
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại."
          : e instanceof Error
            ? e.message
            : "Không thể đăng nhập. Vui lòng thử lại.",
      );
      setBusy(false);
    }
  }

  const input =
    "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50";

  return (
    <form onSubmit={submit} className="space-y-4" noValidate={false}>
      {error && (
        <div role="alert" className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="admin-email" className="text-[13px] font-medium text-slate-700">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          placeholder="ten@bim4c.vn"
          className={input}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="admin-password" className="text-[13px] font-medium text-slate-700">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className={`${input} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-400 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-teal-700 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-70"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
      <p className="text-center text-xs text-slate-500">
        Quên mật khẩu hoặc bị khóa tài khoản? Liên hệ quản trị viên cấp cao để được cấp lại.
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="relative mb-4 size-11 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
              <Image src="/images/bim4c-logo.png" alt="BIM4C" fill sizes="44px" className="object-contain p-1" priority />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Đăng nhập quản trị</h1>
            <p className="mt-1 text-sm text-slate-500">Hệ thống quản trị nội dung BIM4C</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <Suspense fallback={<div className="h-64" aria-busy="true" />}>
              <LoginForm />
            </Suspense>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-slate-800">
              <ArrowLeft className="size-3.5" />
              Về website
            </Link>
            <span>
              Hỗ trợ: <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-slate-800">{CONTACT_EMAIL}</a>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
