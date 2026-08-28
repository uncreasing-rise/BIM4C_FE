"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = element.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={element} style={{ transitionDelay: `${delay}ms` }} className={`${className} transform-gpu transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transform-none motion-reduce:filter-none motion-reduce:transition-none ${visible ? "translate-y-0 scale-100 blur-0 opacity-100" : "translate-y-8 scale-[.985] blur-[2px] opacity-0"}`}>{children}</div>;
}
