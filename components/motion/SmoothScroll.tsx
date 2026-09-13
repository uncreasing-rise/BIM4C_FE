"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Lenis smooth scroll active on all public pages with 60/120fps responsiveness
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference) and (pointer: fine)",
      () => {
        const scroll = new Lenis({
          lerp: 0.085,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.5,
          anchors: { duration: 1.0 },
          prevent: (node) =>
            !!node.closest(
              '[role="dialog"], [data-lenis-prevent], [data-radix-popper-content-wrapper], .overflow-y-auto, .overflow-y-scroll',
            ),
        });

        scroll.on("scroll", ScrollTrigger.update);

        const tick = (time: number) => {
          scroll.raf(time * 1000);
        };

        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // Radix / Modal scroll-lock observer
        const observer = new MutationObserver(() => {
          if (document.body.hasAttribute("data-scroll-locked")) {
            scroll.stop();
          } else {
            scroll.start();
          }
        });

        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ["data-scroll-locked"],
        });

        // Ensure ScrollTrigger positions are re-calculated after Lenis mounts
        const refreshTimer = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);

        return () => {
          clearTimeout(refreshTimer);
          observer.disconnect();
          gsap.ticker.remove(tick);
          scroll.destroy();
        };
      },
    );

    return () => media.revert();
  }, [pathname]);

  return null;
}

