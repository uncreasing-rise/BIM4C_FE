"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="ml-auto lg:hidden">
      <button
        className="flex size-11 flex-col justify-center gap-1.5 bg-transparent p-2.5"
        type="button"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="h-0.5 w-full bg-[#163b3a]" />
        <span className="h-0.5 w-full bg-[#163b3a]" />
        <span className="h-0.5 w-full bg-[#163b3a]" />
      </button>
      {open && (
        <nav
          className="absolute inset-x-0 top-[68px] flex flex-col border-b-[3px] border-[#09a7a5] bg-white px-5 pb-5 pt-3 shadow-[0_12px_30px_rgb(3_68_67_/_18%)]"
          aria-label="Điều hướng di động"
        >
          {MAIN_NAVIGATION.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={`border-b border-[#dbe7e5] px-1 py-3.5 text-sm font-semibold ${active ? "text-[#09a7a5]" : "text-[#163b3a]"}`}
                aria-current={active ? "page" : undefined}
                href={item.href}
                key={item.label}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            className="button-primary mt-3"
            href={ROUTES.contact}
            onClick={() => setOpen(false)}
          >
            Liên hệ tư vấn
          </Link>
        </nav>
      )}
    </div>
  );
}
