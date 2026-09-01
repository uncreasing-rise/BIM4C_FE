"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedStat({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const number = Number(value.replace(/[^0-9]/g, ""));
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setActive(false);
          setDisplay("0");
          return;
        }
        setActive(true);
        const started = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - started) / 1200, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(number * eased).toLocaleString("vi-VN"));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [number]);

  return (
    <span
      ref={ref}
      className={`inline-block transform-gpu transition-[opacity,transform,filter] duration-700 ease-out ${active ? "scale-100 opacity-100 blur-0" : "scale-90 opacity-30 blur-[3px]"}`}
    >
      {display}
      {suffix}
    </span>
  );
}
