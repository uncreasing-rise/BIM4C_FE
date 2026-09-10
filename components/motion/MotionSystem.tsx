"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function MotionSystem() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const root = document.getElementById("main-content");
    if (!root) return;
    const motionMedia = gsap.matchMedia();
    const cleanups: Array<() => void> = [];
    const context = gsap.context(() => {
      motionMedia.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll("[data-motion]"), { clearProps: "all" });
      });
      motionMedia.add("(prefers-reduced-motion: no-preference)", () => {
        const hero = root.querySelector<HTMLElement>("[data-motion='hero']");
        const heroItems = hero ? hero.querySelectorAll<HTMLElement>(":scope > *") : [];
        if (heroItems.length) gsap.fromTo(heroItems, { y: 16 }, { y: 0, duration: 0.55, stagger: 0.06, delay: 0.04, ease: "power2.out", clearProps: "transform" });
        root.querySelectorAll<HTMLElement>("[data-motion='parallax']").forEach((element) => gsap.fromTo(element, { scale: 1.03, yPercent: -1 }, { scale: 1, yPercent: 1, ease: "none", scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 1.2 } }));
        root.querySelectorAll<HTMLElement>("[data-motion='reveal']").forEach((element) => gsap.fromTo(element, { y: 18 }, { y: 0, duration: 0.55, ease: "power2.out", clearProps: "transform", scrollTrigger: { trigger: element, start: "top 86%", once: true } }));
        const tileElements = [
          ...Array.from(root.querySelectorAll<HTMLElement>("[data-motion='tile']")),
          ...Array.from(root.querySelectorAll<HTMLElement>("main article:not([data-motion]), main figure:not([data-motion])")),
        ];
        tileElements.forEach((tile, index) => gsap.fromTo(tile, { y: 14 }, { y: 0, duration: 0.42, delay: (index % 4) * 0.035, ease: "power2.out", clearProps: "transform", scrollTrigger: { trigger: tile, start: "top 91%", once: true } }));
        root.querySelectorAll<HTMLElement>("main > section > .site-container > header, main > section > header").forEach((header) => {
          if (header.hasAttribute("data-motion")) return;
          gsap.fromTo(header, { y: 14 }, { y: 0, duration: 0.5, ease: "power2.out", clearProps: "transform", scrollTrigger: { trigger: header, start: "top 90%", once: true } });
        });
        root.querySelectorAll<HTMLElement>("[data-motion='magnetic']").forEach((element) => {
          const move = (event: PointerEvent) => { const bounds = element.getBoundingClientRect(); gsap.to(element, { x: (event.clientX - bounds.left - bounds.width / 2) * 0.12, y: (event.clientY - bounds.top - bounds.height / 2) * 0.12, duration: 0.35, ease: "power2.out" }); };
          const leave = () => gsap.to(element, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.45)" });
          element.addEventListener("pointermove", move); element.addEventListener("pointerleave", leave);
          cleanups.push(() => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave); });
        });
      });
    }, root);
    context.add(() => cleanups.forEach((cleanup) => cleanup()));
    return () => {
      context?.revert();
      motionMedia.revert();
    };
  }, [pathname]);
  return null;
}
