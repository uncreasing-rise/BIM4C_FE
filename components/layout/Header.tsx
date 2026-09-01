"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "Giải Pháp", href: ROUTES.services },
    { label: "Dự Án", href: ROUTES.projects },
    { label: "Năng Lực", href: ROUTES.about },
    { label: "Đào Tạo", href: ROUTES.courses },
    { label: "Tin Tức", href: ROUTES.blog },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950 text-white">
      {/* Top bar */}
      <div className="border-b border-slate-800/80 bg-slate-950 text-[11px] text-slate-400">
        <div className="enterprise-container flex h-9 items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#09a7a5]" />
              ISO 19650-1 &amp; 19650-2 CERTIFIED
            </span>
            <span className="hidden text-slate-700 sm:inline">|</span>
            <span className="hidden sm:inline tracking-wide">
              GLOBAL BIM &amp; VDC CONSULTING
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href={ROUTES.about}
              className="hidden transition-colors hover:text-white sm:inline"
            >
              Tải Hồ Sơ Năng Lực
            </Link>
            <span className="hidden text-slate-700 sm:inline">|</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-[#09a7a5]">VN</span>
              <span>+84 (0) 28 3900 8888</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-slate-800/60 bg-slate-950/95 backdrop-blur-md">
        <div className="enterprise-container flex h-[68px] items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#09a7a5] text-lg font-bold text-white">
              B
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[17px] font-extrabold tracking-wider text-white">
                BIM4C <span className="text-[#09a7a5]">GROUP</span>
              </span>
              <span className="tech-spec mt-0.5 text-[9px] text-slate-500">
                Enterprise BIM Solutions
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => {
              const active =
                pathname.startsWith(item.href) && item.href !== "/";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-[13px] font-semibold tracking-wide transition-colors ${
                    active
                      ? "text-[#09a7a5]"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden lg:block">
            <Link
              href={ROUTES.contact}
              className="btn-enterprise-primary !h-10 !px-5 !text-xs"
            >
              Yêu Cầu Tư Vấn B2B
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
