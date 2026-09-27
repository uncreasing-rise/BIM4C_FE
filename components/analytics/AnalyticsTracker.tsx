"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { installTracker, trackPageview } from "@/lib/analytics/tracker";

/** Records a page view on every navigation (see lib/analytics/tracker). */
export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    installTracker();
  }, []);
  useEffect(() => {
    // The browser path keeps the locale prefix that the proxy rewrites away.
    trackPageview(window.location.pathname);
  }, [pathname]);
  return null;
}
