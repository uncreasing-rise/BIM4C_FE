"use client";

import { useEffect } from "react";

const selectors = [
  ".route-transition > section:not(.hero):not(.page-hero):not(.inner-banner)", ".company-stats > div", ".business article",
  ".partner-card", ".news article", ".feature-card", ".project-row", ".service-feature", ".process-grid > article", ".course-list > article", ".academy-outcomes article", ".featured-story", ".story-grid > article", ".metric-grid > div", ".split-content > div",
  ".project-tile", ".news-feature-card", ".news-list-card", ".governance-card", ".pillar-grid > article", ".timeline-track > article", ".detail-opening > *", ".detail-index", ".detail-main > section", ".detail-visual", ".detail-aside", ".detail-related article", ".contact-band > .page-shell > *", ".footer-grid > *",
].join(",");

function startReveal(element: Element, order: number): void {
  if (!(element instanceof HTMLElement) || typeof element.animate !== "function") return;
  const fromRight = element.matches(".service-feature:nth-child(even),.detail-aside");
  const fromLeft = element.matches(".service-feature:nth-child(odd),.detail-section-number");
  const compact = element.matches(".company-stats > div,.metric-grid > div,.partner-card");
  const translate = fromRight ? "48px,0,0" : fromLeft ? "-48px,0,0" : `0,${compact ? 30 : 44}px,0`;
  element.animate(
    [{ opacity: 0, transform: `translate3d(${translate})${compact ? " scale(.96)" : ""}` }, { opacity: 1, transform: "none" }],
    { duration: 720, delay: order * 70, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" },
  );
}

export function MotionObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observed = new WeakSet<Element>();
    const orders = new WeakMap<Element, number>();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      startReveal(entry.target, orders.get(entry.target) ?? 0);
      observer.unobserve(entry.target);
    }), { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });

    const connect = () => document.querySelectorAll(selectors).forEach((element, index) => {
      if (observed.has(element)) return;
      observed.add(element);
      orders.set(element, index % 4);
      observer.observe(element);
    });
    connect();
    const mutations = new MutationObserver(connect);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);
  return null;
}
