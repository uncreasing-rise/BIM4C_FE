"use client";

import { useState } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { ZaloIcon } from "./SocialLinks";
import { useLanguage } from "@/lib/i18n/context";

const ZALO_URL = "https://zalo.me/02873004068";
const HOTLINE_NUMBER = "+842873004068";
const HOTLINE_DISPLAY = "028 7300 4068";

export function FloatingContactWidget() {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label={locale === "vi" ? "Kênh liên hệ nhanh" : "Quick contact channels"}
      className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2.5 select-none"
    >
      {/* EXPANDED MENU */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* HOTLINE CALL */}
          <a
            href={`tel:${HOTLINE_NUMBER}`}
            className="group flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-slate-900/90 py-2 pl-2.5 pr-4 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
            title={locale === "vi" ? "Gọi Hotline tư vấn" : "Call consultation hotline"}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xs">
              <Phone className="size-3.5 fill-current" />
            </span>
            <span>Hotline: {HOTLINE_DISPLAY}</span>
          </a>

          {/* ZALO CHAT DIRECT */}
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 rounded-full border border-[#0068FF]/40 bg-slate-900/90 py-2 pl-2.5 pr-4 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#0068FF] hover:scale-105 active:scale-95"
            title={locale === "vi" ? "Chat Zalo với chuyên viên BIM4C" : "Chat on Zalo with BIM4C"}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-xs">
              <ZaloIcon className="size-4" />
            </span>
            <span>{locale === "vi" ? "Chat Zalo tư vấn 24/7" : "Chat on Zalo"}</span>
          </a>
        </div>
      )}

      {/* MAIN FLOATING TRIGGER BUTTON & ZALO DIRECT SHORTCUT */}
      <div className="flex items-center gap-2">
        {/* DIRECT 1-CLICK ZALO BUTTON */}
        <a
          href={ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={locale === "vi" ? "Chat Zalo ngay" : "Chat on Zalo"}
          className="group relative flex size-12 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-[#0068FF]/30 transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0068FF] focus-visible:ring-offset-2"
        >
          {/* Subtle pulse wave */}
          <span className="absolute -inset-1 animate-ping rounded-full bg-[#0068FF]/40 opacity-75 duration-1000" />
          <ZaloIcon className="relative size-6 transition-transform group-hover:scale-110" />

          {/* Floating Tooltip */}
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-slate-950/90 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm group-hover:inline-block">
            {locale === "vi" ? "Chat Zalo tư vấn ngay" : "Chat with us on Zalo"}
          </span>
        </a>

        {/* QUICK MENU TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={
            isOpen
              ? locale === "vi"
                ? "Đóng menu liên hệ"
                : "Close contact menu"
              : locale === "vi"
                ? "Mở menu liên hệ"
                : "Open contact menu"
          }
          className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-slate-300 shadow-md backdrop-blur-sm transition-all hover:bg-slate-800 hover:text-white"
        >
          {isOpen ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        </button>
      </div>
    </aside>
  );
}
