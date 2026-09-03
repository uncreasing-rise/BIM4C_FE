"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function MotionSystem() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const scope = gsap.context(() => {
      gsap.fromTo(
        "[data-motion='hero'] > *",
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" },
      );

      gsap.utils
        .toArray<HTMLElement>("main > section:not(:first-child)")
        .forEach((section) => {
          const targets = section.querySelectorAll<HTMLElement>(
            "[data-motion='reveal'], [data-slot='card'], article",
          );
          gsap.fromTo(
            targets.length ? targets : section,
            { autoAlpha: 0, y: 34 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.07,
              ease: "power3.out",
              scrollTrigger: { trigger: section, start: "top 84%", once: true },
            },
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-motion='parallax']")
        .forEach((image) => {
          gsap.fromTo(
            image,
            { yPercent: -3, scale: 1.05 },
            {
              yPercent: 3,
              ease: "none",
              scrollTrigger: {
                trigger: image.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });
    });

    return () => scope.revert();
  }, [pathname]);

  return null;
}
