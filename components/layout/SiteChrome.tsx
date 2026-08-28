"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageTransition } from "@/components/shared/PageTransition";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const isAdmin = usePathname().startsWith("/admin");
  if (isAdmin) return <main className="min-h-screen bg-[#f5fafa] text-[#163b3a]">{children}</main>;
  return <><Header/><main><PageTransition>{children}</PageTransition></main><Footer/></>;
}
