"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function MotionSystem() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.getElementById("main-content");
    if (!root) return;

    // Refresh ScrollTrigger calculations after next-route transition
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    const motionMedia = gsap.matchMedia();
    const cleanups: Array<() => void> = [];

    const context = gsap.context(() => {
      // 1. Accessibility: Prefers reduced motion
      motionMedia.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll("[data-motion]"), { clearProps: "all" });
      });

      // 2. Standard animation execution
      motionMedia.add("(prefers-reduced-motion: no-preference)", () => {
        // Hero entrance stagger
        const hero = root.querySelector<HTMLElement>("[data-motion='hero']");
        const heroItems = hero
          ? hero.querySelectorAll<HTMLElement>(":scope > *")
          : [];
        if (heroItems.length) {
          gsap.fromTo(
            heroItems,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.08,
              delay: 0.05,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
          );
        }

        // Parallax elements
        root
          .querySelectorAll<HTMLElement>("[data-motion='parallax']")
          .forEach((element) => {
            gsap.fromTo(
              element,
              { scale: 1.04, yPercent: -2 },
              {
                scale: 1,
                yPercent: 2,
                ease: "none",
                scrollTrigger: {
                  trigger: element,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
          });

        // Content block reveal (Cards, Sections)
        root
          .querySelectorAll<HTMLElement>("[data-motion='reveal']")
          .forEach((element) => {
            gsap.fromTo(
              element,
              { y: 24, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",
                clearProps: "transform,opacity",
                scrollTrigger: {
                  trigger: element,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          });

        // Grid tiles (Bento grid, catalogue items)
        const tileElements = [
          ...Array.from(
            root.querySelectorAll<HTMLElement>("[data-motion='tile']"),
          ),
          ...Array.from(
            root.querySelectorAll<HTMLElement>(
              "main article:not([data-motion]), main figure:not([data-motion])",
            ),
          ),
        ];

        tileElements.forEach((tile, index) => {
          gsap.fromTo(
            tile,
            { y: 18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              delay: (index % 4) * 0.05,
              ease: "power2.out",
              clearProps: "transform,opacity",
              scrollTrigger: {
                trigger: tile,
                start: "top 92%",
                once: true,
              },
            },
          );
        });

        // Section Headers
        root
          .querySelectorAll<HTMLElement>(
            "main > section > .site-container > header, main > section > header",
          )
          .forEach((header) => {
            if (header.hasAttribute("data-motion")) return;
            gsap.fromTo(
              header,
              { y: 16, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.55,
                ease: "power2.out",
                clearProps: "transform,opacity",
                scrollTrigger: {
                  trigger: header,
                  start: "top 90%",
                  once: true,
                },
              },
            );
          });

        // Magnetic element handlers
        root
          .querySelectorAll<HTMLElement>("[data-motion='magnetic']")
          .forEach((element) => {
            const move = (event: PointerEvent) => {
              const bounds = element.getBoundingClientRect();
              gsap.to(element, {
                x: (event.clientX - bounds.left - bounds.width / 2) * 0.2,
                y: (event.clientY - bounds.top - bounds.height / 2) * 0.2,
                duration: 0.3,
                ease: "power2.out",
              });
            };
            const leave = () =>
              gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.55,
                ease: "elastic.out(1, 0.4)",
              });

            element.addEventListener("pointermove", move);
            element.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              element.removeEventListener("pointermove", move);
              element.removeEventListener("pointerleave", leave);
            });
          });
      });
    }, root);

    context.add(() => cleanups.forEach((cleanup) => cleanup()));

    return () => {
      clearTimeout(timer);
      context?.revert();
      motionMedia.revert();
    };
  }, [pathname]);

  return null;
}
