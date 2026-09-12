"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

export function BackToTop() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t.common.backToTop}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full border border-white/20 bg-brand-ink/90 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-primary hover:scale-110 active:scale-95",
        "animate-in fade-in zoom-in-75 duration-200",
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
