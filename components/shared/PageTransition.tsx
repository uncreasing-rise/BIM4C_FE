"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <PageEntrance key={pathname}>{children}</PageEntrance>;
}

function PageEntrance({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return <div className={`page-transition transform-gpu transition-[opacity,transform,filter] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transform-none motion-reduce:filter-none motion-reduce:transition-none ${visible ? "translate-y-0 blur-0 opacity-100" : "translate-y-3 blur-[2px] opacity-0"}`}>{children}</div>;
}
