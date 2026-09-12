"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollProgressProps {
  className?: string;
  gradient?: string;
}

export function ScrollProgress({
  className,
  gradient = "from-teal-400 via-teal-500 to-teal-300",
}: ScrollProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-transparent",
        className,
      )}
    >
      <div
        ref={barRef}
        className={cn(
          "h-full w-full origin-left bg-gradient-to-r shadow-xs shadow-teal-500/50",
          gradient,
        )}
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
