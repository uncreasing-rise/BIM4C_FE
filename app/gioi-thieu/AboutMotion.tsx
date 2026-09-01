"use client";

import { useEffect } from "react";

export function AboutMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".about-page");
    if (!root) return;

    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-about-reveal]"),
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    root.classList.add("about-motion-ready");
    items.forEach((item) => {
      const siblings = item.parentElement
        ? Array.from(item.parentElement.children).filter((child) =>
            child.hasAttribute("data-about-reveal"),
          )
        : [];
      const index = siblings.indexOf(item);
      item.style.setProperty(
        "--about-reveal-delay",
        `${Math.max(0, index) * 70}ms`,
      );
    });

    if (reduceMotion) {
      items.forEach((item) => item.classList.add("about-is-visible"));
      return () => root.classList.remove("about-motion-ready");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("about-is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return null;
}
