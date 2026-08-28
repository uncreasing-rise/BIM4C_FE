"use client";

import { useState } from "react";

const tabs = [
  ["company-overview", "Tổng quan"],
  ["ways-of-working", "Cách làm việc"],
  ["technology", "Công nghệ"],
  ["vision", "Tầm nhìn"],
] as const;

export function AboutSectionTabs() {
  const [active, setActive] = useState("company-overview");
  return <nav className="grid grid-cols-2 border-l border-t border-[#dbe7e5] sm:grid-cols-4" aria-label="Các phần giới thiệu">
    {tabs.map(([id, label], index) => <a key={id} className={`flex min-h-14 items-center border-b border-r px-3 text-xs transition-colors sm:px-5 sm:text-sm ${active === id ? "border-[#09a7a5] bg-[#09a7a5] font-bold text-white" : "border-[#dbe7e5] font-semibold text-[#667775] hover:bg-[#eaf8f7] hover:text-[#087f7d]"}`} href={`#${id}`} onClick={() => setActive(id)}><span className="mr-2 font-mono opacity-70 sm:mr-3">{String(index + 1).padStart(2, "0")}</span><span>{label}</span></a>)}
  </nav>;
}
