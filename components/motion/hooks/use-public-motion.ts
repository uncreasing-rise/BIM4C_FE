"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

/** Signal from the hydrated page, never infer hydration from streamed DOM presence. */
export function usePublicMotion() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  useEffect(() => {
    const root = document.getElementById("main-content");
    if (!root) return;
    root.dataset.motionReady = pathname;
    document.dispatchEvent(new CustomEvent("bim4c:content-ready", { detail: pathname }));
    return () => {
      if (root.dataset.motionReady === pathname) delete root.dataset.motionReady;
    };
  }, [pathname, locale]);
}
