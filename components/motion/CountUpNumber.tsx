"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CountUpNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function CountUpNumber({
  value,
  duration = 1.8,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  ...props
}: CountUpNumberProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const counter = { val: 0 };

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        val: value,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
        onUpdate: () => {
          if (el) {
            const formatted =
              decimals > 0
                ? counter.val.toFixed(decimals)
                : Math.round(counter.val).toLocaleString();
            el.textContent = `${prefix}${formatted}${suffix}`;
          }
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value, duration, prefix, suffix, decimals]);

  return (
    <span
      ref={elementRef}
      className={cn("tabular-nums font-bold", className)}
      {...props}
    >
      {prefix}0{suffix}
    </span>
  );
}
