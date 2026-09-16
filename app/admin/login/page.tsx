"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Layers,
  Loader2,
  Lock,
  LockKeyhole,
  Mail,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(
          body?.message ??
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        );
      }

      const next = params.get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Glassmorphic Auth Card */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-slate-950/70 p-8 sm:p-10 shadow-2xl shadow-teal-950/50 backdrop-blur-2xl">
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-80" />

        {/* Ambient Corner Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300">
            <ShieldCheck className="size-3.5 text-teal-400" />
            <span>XÁC THỰC QUẢN TRỊ VIÊN</span>
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Đăng nhập hệ thống
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Vui lòng nhập tài khoản được cấp quyền để truy cập Control Panel.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="relative z-10 space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="admin-email"
              className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-300 uppercase"
            >
              <Mail className="size-3.5 text-teal-400" />
              <span>Email quản trị</span>
            </label>
            <div className="relative">
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bim4c.com"
                className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 hover:border-slate-600 focus:border-teal-400 focus:bg-slate-900 focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-password"
                className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-300 uppercase"
              >
                <Lock className="size-3.5 text-teal-400" />
                <span>Mật khẩu bảo mật</span>
              </label>
            </div>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={10}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 hover:border-slate-600 focus:border-teal-400 focus:bg-slate-900 focus:ring-2 focus:ring-teal-400/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition-colors hover:text-slate-200"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Security tip */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-400/20 focus:ring-offset-0 accent-teal-500 cursor-pointer"
              />
              <span className="hover:text-slate-300 transition-colors">
                Ghi nhớ thiết bị này
              </span>
            </label>
            <span
              title="Vui lòng liên hệ Super Administrator nếu bạn quên mật khẩu hoặc bị khóa tài khoản"
              className="text-teal-400 hover:text-teal-300 hover:underline cursor-help transition-colors"
            >
              Cần cấp lại quyền?
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs sm:text-sm text-red-200 shadow-inner">
              <ShieldAlert className="size-5 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={busy}
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition-all duration-200 hover:from-teal-400 hover:to-emerald-300 hover:shadow-teal-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin text-slate-950" />
                <span>Đang xác thực bảo mật…</span>
              </>
            ) : (
              <>
                <span>Đăng nhập trang quản trị</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-950/70 px-3 text-slate-500">hoặc</span>
            </div>
          </div>

          {/* Back to Homepage */}
          <Link
            href="/"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 text-xs font-medium text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Quay về website BIM4C</span>
          </Link>
        </form>

        {/* Security Footnote */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <LockKeyhole className="size-3 text-teal-400/70" />
            <span>Mã hóa AES-256 / Kết nối bảo mật SSL TLS 1.3</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <main className="admin-login relative min-h-screen w-full bg-[#04181f] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-teal-500/30 selection:text-teal-200">
      {/* Background Decorative Mesh & Grids */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Radial Ambient Glows */}
        <div className="absolute -top-[20%] left-1/4 h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -bottom-[10%] left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />

        {/* High-tech Engineering Dot Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 font-black text-slate-950 shadow-md shadow-teal-500/20 transition-transform duration-200 group-hover:scale-105">
              4C
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
                <span className="text-xl">
                  BIM<span className="text-teal-400">4C</span>
                </span>
                <span className="rounded bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300 border border-teal-500/20">
                  ENTERPRISE
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Hệ thống Quản trị & Điều phối Dữ liệu
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-medium">
                Hệ thống đang hoạt động
              </span>
            </div>
            <span className="text-slate-700">•</span>
            <span className="font-mono text-slate-500">v2.4.0</span>
          </div>
        </div>
      </header>

      {/* Main Content Showcase & Form Area */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16 flex-1 flex items-center">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Enterprise Presentation (Desktop & Tablet) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-8 pr-4">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-xs font-medium text-teal-300">
              <Sparkles className="size-3.5 text-teal-400" />
              <span>
                Nền Tảng Quản Lý Nội Dung Chuyên Nghiệp Cho Ngành Xây Dựng
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl xl:text-5xl xl:leading-[1.15]">
                Quản trị toàn diện hệ sinh thái{" "}
                <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-300 bg-clip-text text-transparent">
                  BIM & Chuyển đổi số
                </span>
              </h2>
              <p className="text-base text-slate-300/90 leading-relaxed max-w-2xl font-light">
                Trung tâm điều phối tập trung cho việc xuất bản dữ liệu dự án,
                số hóa mô hình 3D OpenBIM, quản trị học viện đào tạo và thiết
                lập các giải pháp công nghệ kỹ thuật số.
              </p>
            </div>

            {/* 3 Pillar Features */}
            <div className="grid gap-4 sm:grid-cols-1 xl:grid-cols-1 pt-2">
              <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-sm transition-colors hover:border-teal-500/30 hover:bg-slate-900/60">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Mô hình OpenBIM & Dữ liệu Dự án
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Kiểm soát dự án, cập nhật thông tin phối cảnh 3D và hồ sơ kỹ
                    thuật chuyên sâu theo chuẩn IFC.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-sm transition-colors hover:border-teal-500/30 hover:bg-slate-900/60">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Hệ thống Đào tạo & Học viên
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Điều phối các khóa học BIM/Revit/Dynamo, theo dõi danh sách
                    đăng ký và quản lý tài liệu chuyên ngành.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-sm transition-colors hover:border-teal-500/30 hover:bg-slate-900/60">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Server className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Kiểm soát Phân quyền & Nhật ký Kiểm toán
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Phân quyền vai trò RBAC chặt chẽ, tự động lưu vết mọi thao
                    tác quản trị nhằm bảo đảm toàn vẹn dữ liệu.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Quick Stats */}
            <div className="flex items-center gap-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Zero Trust Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Next-gen Architecture</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Auth Form */}
          <div className="lg:col-span-5 flex justify-center">
            <Suspense
              fallback={
                <div className="flex h-96 w-full items-center justify-center rounded-3xl border border-teal-500/20 bg-slate-950/70">
                  <Loader2 className="size-8 animate-spin text-teal-400" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 w-full border-t border-white/5 bg-slate-950/50 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} BIM4C Innovation. Tất cả các quyền
            được bảo lưu.
          </span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Bảo mật & Điều khoản</span>
            <span>•</span>
            <span>Hỗ trợ kỹ thuật: Bim4c.lab@gmail.com</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
