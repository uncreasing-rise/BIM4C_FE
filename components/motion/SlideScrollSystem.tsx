"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const presentationRoutes = new Set([
  "/",
  "/gioi-thieu",
  "/dich-vu",
  "/du-an",
  "/khoa-hoc",
  "/blog",
  "/lien-he",
]);

/**
 * Lightweight Chapter Navigation for presentation pages
 * Tracks current active section smoothly without hijacking scroll or distorting elements.
 */
export function SlideScrollSystem() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const [chapters, setChapters] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!presentationRoutes.has(pathname)) {
      setChapters([]);
      return;
    }

    const main = document.querySelector<HTMLElement>("#main-content main");
    if (!main) return;

    const scenes = Array.from(
      main.querySelectorAll<HTMLElement>(":scope > section"),
    );
    if (scenes.length < 2) return;

    const items = scenes.map((scene, index) => {
      scene.id ||= `chapter-${index + 1}`;
      const label =
        scene.querySelector("h1, h2")?.textContent?.trim() ||
        scene.getAttribute("aria-label") ||
        `${locale === "vi" ? "Phần" : "Chapter"} ${index + 1}`;
      return { id: scene.id, label };
    });

    setChapters(items);

    const triggers: ScrollTrigger[] = [];

    scenes.forEach((scene, index) => {
      const trigger = ScrollTrigger.create({
        trigger: scene,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => setActive(index),
        onEnterBack: () => setActive(index),
      });
      triggers.push(trigger);
    });

    const visibilityTrigger = ScrollTrigger.create({
      trigger: main,
      start: "top 30%",
      end: "bottom 80%",
      onEnter: () => setInView(true),
      onLeave: () => setInView(false),
      onEnterBack: () => setInView(true),
      onLeaveBack: () => setInView(false),
    });
    triggers.push(visibilityTrigger);

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [pathname, locale]);

  if (!presentationRoutes.has(pathname) || chapters.length < 2) return null;

  return (
    <nav
      className="chapter-navigation hidden lg:flex"
      aria-label={locale === "vi" ? "Các phần của trang" : "Page chapters"}
      data-visible={inView}
    >
      <span className="chapter-position" aria-hidden="true">
        {String(active + 1).padStart(2, "0")}
        <span>/ {String(chapters.length).padStart(2, "0")}</span>
      </span>
      {chapters.map((chapter, index) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          aria-label={chapter.label}
          aria-current={active === index ? "step" : undefined}
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById(chapter.id);
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <span className="chapter-tooltip">{chapter.label}</span>
          <span className="chapter-dot" />
        </a>
      ))}
    </nav>
  );
}

