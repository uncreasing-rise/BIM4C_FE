"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
}

export function TextReveal({
  children,
  as: Component = "span",
  className,
  stagger = 0.03,
  duration = 0.6,
  delay = 0,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const words = children.split(" ");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wordElements = el.querySelectorAll(".reveal-word-inner");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordElements,
        {
          y: "110%",
          opacity: 0,
        },
        {
          y: "0%",
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [children, stagger, duration, delay]);

  return (
    <Component
      ref={containerRef as any}
      className={cn("inline-flex flex-wrap gap-x-1.5 gap-y-0.5", className)}
    >
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          className="inline-block overflow-hidden align-top leading-tight"
        >
          <span className="reveal-word-inner inline-block will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
}
