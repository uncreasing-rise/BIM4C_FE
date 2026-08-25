"use client";

import { useEffect } from "react";

const selectors = [
  ".route-transition > section:not(.hero):not(.page-hero)", ".company-stats > div", ".business article",
  ".partner-card", ".news article", ".feature-card", ".project-row", ".service-feature", ".process-grid > article", ".course-list > article", ".academy-outcomes article", ".featured-story", ".story-grid > article", ".metric-grid > div", ".split-content > div",
  ".project-tile", ".news-feature-card", ".news-list-card", ".governance-card", ".pillar-grid > article", ".timeline-track > article", ".detail-opening > *", ".detail-index", ".detail-main > section", ".detail-visual", ".detail-aside", ".detail-related article", ".contact-band > .page-shell > *", ".footer-grid > *",
].join(",");

export function MotionObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });

    const connect = () => document.querySelectorAll(selectors).forEach((element, index) => {
      if (observed.has(element)) return;
      observed.add(element);
      element.classList.add("reveal-target");
      if (element.matches("article,.company-stats > div,.metric-grid > div,.footer-grid > *")) element.setAttribute("style", `--reveal-order:${index % 4}`);
      if (element.matches(".service-feature:nth-child(even),.detail-aside")) element.classList.add("reveal-from-right");
      if (element.matches(".service-feature:nth-child(odd),.detail-section-number")) element.classList.add("reveal-from-left");
      observer.observe(element);
    });
    connect();
    const mutations = new MutationObserver(connect);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);
  return null;
}
