"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionSystem() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let dispose = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
    const gsap = gsapModule.default;
    const { ScrollTrigger } = scrollTriggerModule;

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(500, 33);
    const removeInteractions: Array<() => void> = [];
    const scope = gsap.context(() => {
      gsap.fromTo(
        "header > div",
        { autoAlpha: 0, y: -18 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );

      if (pathname === "/") {
        const heroTimeline = gsap.timeline({
          defaults: { ease: "power3.out" },
        });
        heroTimeline
          .fromTo(
            "[data-home-section='hero'] [data-motion='hero'] > *",
            { autoAlpha: 0, y: 42 },
            { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09 },
            0.12,
          )
          .fromTo(
            "[data-home-section='hero'] [data-motion='hero']:last-child",
            { autoAlpha: 0, x: 34 },
            { autoAlpha: 1, x: 0, duration: 0.8 },
            0.45,
          );

        gsap.utils
          .toArray<HTMLElement>(
            "[data-home-section]:not([data-home-section='hero'])",
          )
          .forEach((section) => {
            const intro = section.querySelectorAll<HTMLElement>(".eyebrow, h2");
            const items = section.querySelectorAll<HTMLElement>(
              "article, [data-slot='card'], [data-home-item]",
            );

            if (intro.length) {
              gsap.fromTo(
                intro,
                { autoAlpha: 0, y: 38 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.8,
                  stagger: 0.08,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: section,
                    start: "top 82%",
                    toggleActions: "play reverse play reverse",
                  },
                },
              );
            }

            if (items.length) {
              gsap.fromTo(
                items,
                { autoAlpha: 0, y: 54, scale: 0.985 },
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.85,
                  stagger: 0.1,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: items[0],
                    start: "top 88%",
                    toggleActions: "play reverse play reverse",
                  },
                },
              );
            }
          });

        gsap.utils
          .toArray<HTMLElement>("[data-home-section='projects'] article img")
          .forEach((image) => {
            gsap.fromTo(
              image,
              { scale: 1.08 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: image.closest("article"),
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.7,
                },
              },
            );
          });
      } else {
        gsap.fromTo(
          "[data-motion='hero'] > *",
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
          },
        );
      }

      if (pathname === "/gioi-thieu") {
        const teamCards = gsap.utils.toArray<HTMLElement>("[data-team-card]");
        if (teamCards.length) {
          gsap.fromTo(
            teamCards,
            { autoAlpha: 0, y: 56, clipPath: "inset(0 0 18% 0 round 24px)" },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0 round 24px)",
              duration: 0.95,
              stagger: 0.11,
              ease: "power4.out",
              scrollTrigger: {
                trigger: "[data-about-section='team']",
                start: "top 78%",
                toggleActions: "play reverse play reverse",
              },
            },
          );

          gsap.fromTo(
            "[data-team-card] img",
            { scale: 1.14 },
            {
              scale: 1,
              duration: 1.2,
              stagger: 0.11,
              ease: "power3.out",
              scrollTrigger: {
                trigger: "[data-about-section='team']",
                start: "top 78%",
                toggleActions: "play reverse play reverse",
              },
            },
          );
        }
      }

      gsap.utils
        .toArray<HTMLElement>(
          "main > section:not(:first-child):not([data-home-section]):not([data-about-section])",
        )
        .forEach((section) => {
          const intro = section.querySelectorAll<HTMLElement>(
            ".eyebrow, h2, header > p:last-child",
          );
          const targets = section.querySelectorAll<HTMLElement>(
            "[data-motion='reveal'], [data-slot='card'], article",
          );

          if (intro.length) {
            gsap.fromTo(
              intro,
              { autoAlpha: 0, y: 30 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.78,
                stagger: 0.07,
                ease: "power3.out",
                clearProps: "willChange",
                scrollTrigger: {
                  trigger: section,
                  start: "top 86%",
                  toggleActions: "play reverse play reverse",
                },
              },
            );
          }

          gsap.fromTo(
            targets.length ? targets : section,
            { autoAlpha: 0, y: 40, scale: 0.992 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.82,
              stagger: 0.08,
              ease: "power4.out",
              clearProps: "willChange",
              scrollTrigger: {
                trigger: section,
                start: "top 88%",
                toggleActions: "play reverse play reverse",
              },
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

      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        gsap.utils
          .toArray<HTMLElement>("[data-slot='button']")
          .forEach((element) => {
            const move = (event: PointerEvent) => {
              const bounds = element.getBoundingClientRect();
              const x = (event.clientX - bounds.left - bounds.width / 2) * 0.1;
              const y = (event.clientY - bounds.top - bounds.height / 2) * 0.14;
              gsap.to(element, {
                x,
                y,
                duration: 0.35,
                ease: "power3.out",
                overwrite: "auto",
              });
            };
            const reset = () =>
              gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.55,
                ease: "elastic.out(1, 0.45)",
                overwrite: "auto",
              });

            element.addEventListener("pointermove", move);
            element.addEventListener("pointerleave", reset);
            removeInteractions.push(() => {
              element.removeEventListener("pointermove", move);
              element.removeEventListener("pointerleave", reset);
            });
          });
      }

      ScrollTrigger.refresh();
    });

    let refreshFrame = 0;
    const main = document.querySelector("main");
    const resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(refreshFrame);
      refreshFrame = window.requestAnimationFrame(() =>
        ScrollTrigger.refresh(),
      );
    });
    if (main) resizeObserver.observe(main);

    dispose = () => {
      window.cancelAnimationFrame(refreshFrame);
      resizeObserver.disconnect();
      removeInteractions.forEach((remove) => remove());
      scope.revert();
    };
      },
    );
    return () => dispose();
  }, [pathname]);

  return null;
}
