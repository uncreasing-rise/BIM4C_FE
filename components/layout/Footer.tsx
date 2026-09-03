import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { CONTACT_EMAIL, ROUTES } from "@/constants/routes";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-brand-ink text-zinc-100">
      <div className="pointer-events-none absolute -right-40 -top-40 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="site-container grid gap-12 py-16 lg:grid-cols-[1.3fr_.7fr_1fr] lg:py-24">
        <div>
          <Link
            href={ROUTES.home}
            className="text-2xl font-black tracking-[.14em]"
          >
            BIM<span className="text-primary">4C</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">
            Kết nối con người, quy trình và dữ liệu để kiến tạo những công trình
            chính xác, hiệu quả và bền vững.
          </p>
          <div className="mt-8 space-y-3 text-sm text-zinc-400">
            <p className="flex gap-3">
              <MapPin className="size-4 text-primary" />
              TP. Hồ Chí Minh, Việt Nam
            </p>
            <p className="flex gap-3">
              <Mail className="size-4 text-primary" />
              {CONTACT_EMAIL}
            </p>
            <p className="flex gap-3">
              <Phone className="size-4 text-primary" />
              +84 28 7300 4068
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[.16em] text-zinc-500">
            Khám phá
          </h2>
          <nav className="mt-5 grid gap-3">
            {MAIN_NAVIGATION.map((item) => (
              <Link
                className="group flex w-fit items-center gap-1 text-sm text-zinc-300 hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Nhận BIM Insights</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Tin tức dự án và kiến thức chuyển đổi số xây dựng gửi đến email của
            bạn.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-3 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 BIM4C Construction.</span>
          <div className="flex gap-5">
            <Link
              className="transition-colors hover:text-white"
              href={ROUTES.legalDetail("dieu-khoan-su-dung")}
            >
              Điều khoản
            </Link>
            <Link
              className="transition-colors hover:text-white"
              href={ROUTES.legalDetail("chinh-sach-bao-mat")}
            >
              Bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
