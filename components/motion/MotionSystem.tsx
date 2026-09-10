"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionSystem() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          animations.push(
            entry.target.animate(
              [
                { opacity: 0.75, transform: "translateY(12px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 400, easing: "cubic-bezier(.2,.7,.3,1)" },
            ),
          );
        }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("main [data-motion='reveal']")
      .forEach((element) => observer.observe(element));
    const stop = () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
    preference.addEventListener("change", stop);
    return () => {
      stop();
      preference.removeEventListener("change", stop);
    };
  }, [pathname]);
  return null;
}
