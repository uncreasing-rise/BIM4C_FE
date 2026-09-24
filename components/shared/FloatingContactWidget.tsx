"use client";

import { useLanguage } from "@/lib/i18n/context";
import { MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";

import { ui } from "@/lib/i18n/ui";
const HOTLINE_NUMBER = "+84932468099";
const HOTLINE_DISPLAY = "093 2468 099";

export function FloatingContactWidget() {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label={
        ui(locale).floatingContactWidget.quickContactChannels
      }
      className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2.5 select-none"
    >
      {/* EXPANDED MENU */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* HOTLINE CALL */}
          <a
            href={`tel:${HOTLINE_NUMBER}`}
            className="group flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-slate-900/90 py-2 pl-2.5 pr-4 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
            title={
              ui(locale).floatingContactWidget.callConsultationHotline
            }
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xs">
              <Phone className="size-3.5 fill-current" />
            </span>
            <span>Hotline: {HOTLINE_DISPLAY}</span>
          </a>

          <a
            href="mailto:Bim4c.lab@gmail.com"
            className="rounded-full bg-slate-900 px-4 py-3 text-sm text-white"
          >
            Email: Bim4c.lab@gmail.com
          </a>
        </div>
      )}

      {/* MAIN FLOATING TRIGGER BUTTON & ZALO DIRECT SHORTCUT */}
      <div className="flex items-center gap-2">
        {/* QUICK MENU TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={
            isOpen
              ? ui(locale).floatingContactWidget.closeContactMenu
              : ui(locale).floatingContactWidget.openContactMenu
          }
          className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-slate-300 shadow-md backdrop-blur-sm transition-all hover:bg-slate-800 hover:text-white"
        >
          {isOpen ? (
            <X className="size-4" />
          ) : (
            <MessageCircle className="size-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
