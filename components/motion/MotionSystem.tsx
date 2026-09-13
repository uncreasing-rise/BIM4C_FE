"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function MotionSystem() {
  const pathname = usePathname();

  useEffect(() => {
    // Accessibility check: respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const root = document.getElementById("main-content") ?? document.body;
    if (!root) return;

    let ctx: gsap.Context;

    ctx = gsap.context(() => {
      // 1. HERO ENTRANCE (Runs on page mount with high-end spring stagger)
      const hero = root.querySelector<HTMLElement>("[data-motion='hero'], .page-hero");
      if (hero) {
        const heroItems = Array.from(hero.querySelectorAll<HTMLElement>(
          ".eyebrow, h1, .display-title, p, .hero-actions, button, a.inline-flex, .hero-badge"
        )).filter((el) => el.offsetParent !== null);

        if (heroItems.length > 0) {
          gsap.from(heroItems, {
            y: 40,
            opacity: 0,
            scale: 0.98,
            duration: 0.85,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform,opacity,scale",
          });
        }
      }

      // Hero Right 3D Visual Slide-in
      const slideInElements = root.querySelectorAll<HTMLElement>("[data-motion='slide-in'], .hero-visual-container");
      if (slideInElements.length) {
        gsap.from(slideInElements, {
          x: 40,
          y: 20,
          opacity: 0,
          scale: 0.95,
          duration: 1,
          delay: 0.15,
          ease: "power3.out",
          clearProps: "transform,opacity,scale",
        });
      }

      // 2. UNIVERSAL SECTION REVEAL (Automatically discovers all sections on any page)
      const sections = root.querySelectorAll<HTMLElement>("section, [data-home-section], .site-container > header");
      
      sections.forEach((section) => {
        // Skip hero since it's already animated on load
        if (section.matches("[data-motion='hero'], .page-hero") || section.closest(".page-hero")) {
          return;
        }

        // Section header elements (Eyebrow, Title h2/h3, Description paragraph)
        const headerElements = section.querySelectorAll<HTMLElement>(
          ".eyebrow, h2, .section-title, header p, [data-motion='reveal']"
        );

        if (headerElements.length > 0) {
          gsap.from(headerElements, {
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              once: true,
            },
            y: 36,
            opacity: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform,opacity",
          });
        }
      });

      // 3. UNIVERSAL CARD & GRID STAGGERED ENTRANCES (Covers all pages, catalogs, bento grids, and teams)
      const cardContainers = root.querySelectorAll<HTMLElement>(
        ".grid, .delivery-steps, .partner-grid, #project-list, #service-list, [data-motion='grid'], .flex.flex-wrap.gap-6"
      );

      cardContainers.forEach((container) => {
        // Find direct cards or recognizable card elements within this container
        const cards = Array.from(
          container.querySelectorAll<HTMLElement>(
            ":scope > div, :scope > article, :scope > a, .service-card, .delivery-step, .partner-cell, .project-row, [data-motion='tile'], .card, .faq-item"
          )
        ).filter((el) => {
          // Avoid animating internal sub-elements if the parent is already a card
          return !el.parentElement?.closest(".service-card, .delivery-step, .partner-cell, .project-row, article");
        });

        if (cards.length > 0) {
          gsap.from(cards, {
            scrollTrigger: {
              trigger: container,
              start: "top 86%",
              once: true,
            },
            y: 48,
            scale: 0.96,
            opacity: 0,
            duration: 0.75,
            stagger: {
              each: 0.09,
              from: "start",
            },
            ease: "power3.out",
            clearProps: "transform,opacity,scale",
          });
        }
      });

      // 4. STATS & KPI NUMERIC COUNT-UP
      const statElements = root.querySelectorAll<HTMLElement>(
        "span.font-black, .text-primary.font-black, [data-motion='counter']"
      );

      statElements.forEach((el) => {
        const text = el.textContent?.trim() || "";
        // Match numbers like 150+, 99.8%, 5,000+, 100%, 44, 15+
        const match = text.match(/^([^\d]*)(\d+(?:[\.,]\d+)?)(.*)$/);
        if (!match) return;

        const prefix = match[1];
        const rawNumStr = match[2].replace(/,/g, "");
        const targetValue = parseFloat(rawNumStr);
        const suffix = match[3];
        const hasDecimals = match[2].includes(".");
        const decimalPlaces = hasDecimals ? match[2].split(".")[1].length : 0;

        if (isNaN(targetValue) || targetValue === 0) return;

        const counterObj = { val: 0 };

        gsap.to(counterObj, {
          val: targetValue,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
          onUpdate: () => {
            const formatted = hasDecimals
              ? counterObj.val.toFixed(decimalPlaces)
              : Math.round(counterObj.val).toLocaleString("en-US");
            el.textContent = `${prefix}${formatted}${suffix}`;
          },
        });
      });

      // 5. DETAIL PAGES (Sidebar cards, specs dl list, enquiry box)
      const detailCards = root.querySelectorAll<HTMLElement>(
        "[data-motion='detail'] dl, [data-motion='detail'] #service-enquiry, [data-motion='detail'] aside, aside.sticky, .specs-panel"
      );

      if (detailCards.length > 0) {
        gsap.from(detailCards, {
          scrollTrigger: {
            trigger: detailCards[0],
            start: "top 90%",
            once: true,
          },
          y: 35,
          opacity: 0,
          scale: 0.98,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "transform,opacity,scale",
        });
      }

      // 6. PROCESS CONNECTING LINES
      const drawLines = root.querySelectorAll<HTMLElement>("[data-motion='draw-line'], .process-line");
      drawLines.forEach((line) => {
        gsap.from(line, {
          scrollTrigger: {
            trigger: line,
            start: "top 85%",
            once: true,
          },
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "power2.inOut",
          clearProps: "transformOrigin",
        });
      });

      // 7. FLOATING DOCKS & CTA BANNERS
      const floatingDocks = root.querySelectorAll<HTMLElement>(".sticky.bottom-6, .home-cta-panel");
      floatingDocks.forEach((dock) => {
        gsap.from(dock, {
          scrollTrigger: {
            trigger: dock,
            start: "top 95%",
            once: true,
          },
          y: 30,
          scale: 0.96,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "transform,opacity,scale",
        });
      });
    }, root);

    // Refresh ScrollTrigger when dynamic route changes and assets settle
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 150);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 600);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
      if (ctx) ctx.revert();
    };
  }, [pathname]);

  return null;
}

