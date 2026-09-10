"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionSystem() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const animations: Animation[] = [];
    const observed = new WeakSet<Element>();
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
    const discover = () => {
      document
        .querySelectorAll(
          "main [data-motion='reveal'], main > section > .site-container > header",
        )
        .forEach((element) => {
          if (observed.has(element)) return;
          observed.add(element);
          observer.observe(element);
        });
      document
        .querySelectorAll("main:not([aria-busy='true'])")
        .forEach((main) => {
          if (observed.has(main)) return;
          observed.add(main);
          animations.push(
            main.animate([{ opacity: 0.65 }, { opacity: 1 }], {
              duration: 260,
              easing: "ease-out",
            }),
          );
        });
    };
    discover();
    // Streaming can replace the loading fallback after the pathname changes.
    const mutations = new MutationObserver(discover);
    const content = document.getElementById("main-content");
    if (content) mutations.observe(content, { childList: true, subtree: true });
    const stop = () => {
      observer.disconnect();
      mutations.disconnect();
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
