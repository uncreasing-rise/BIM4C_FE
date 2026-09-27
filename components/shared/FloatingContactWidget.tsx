"use client";

import { useLanguage } from "@/lib/i18n/context";
import { MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";

import { useSiteSettings } from "@/features/page-content/context";
import { telHref } from "@/lib/utils/contact";

import { ui } from "@/lib/i18n/ui";

/** Quick contact bubble; hidden entirely when admin settings have neither phone nor email. */
export function FloatingContactWidget() {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSiteSettings();
  const phoneHref = telHref(settings?.phone);
  const email = settings?.email;
  if (!phoneHref && !email) return null;

  return (
    <aside
      aria-label={ui(locale).floatingContactWidget.quickContactChannels}
      className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2.5 select-none"
    >
      {/* EXPANDED MENU */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* HOTLINE CALL */}
          {phoneHref && (
            <a
              href={phoneHref}
              className="group flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-slate-900/90 py-2 pl-2.5 pr-4 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
              title={ui(locale).floatingContactWidget.callConsultationHotline}
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xs">
                <Phone className="size-3.5 fill-current" />
              </span>
              <span>Hotline: {settings?.phone}</span>
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="rounded-full bg-slate-900 px-4 py-3 text-sm text-white"
            >
              Email: {email}
            </a>
          )}
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
