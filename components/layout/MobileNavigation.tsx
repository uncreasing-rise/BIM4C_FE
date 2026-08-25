"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <div className="mobile-navigation">
    <button className="menu-toggle" type="button" aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open} onClick={() => setOpen(!open)}><span/><span/><span/></button>
    {open && <nav className="mobile-menu" aria-label="Điều hướng di động">{MAIN_NAVIGATION.map((item) => {const active=pathname===item.href||pathname.startsWith(`${item.href}/`);return <Link className={active?"active":""} aria-current={active?"page":undefined} href={item.href} key={item.label} onClick={() => setOpen(false)}>{item.label}</Link>})}<Link href={ROUTES.contact} onClick={() => setOpen(false)}>Get a quote</Link></nav>}
  </div>;
}
