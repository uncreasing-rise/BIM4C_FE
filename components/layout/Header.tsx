"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { MobileNavigation } from "./MobileNavigation";

const navigation = [["Giới thiệu", ROUTES.about], ["Dịch vụ", ROUTES.services], ["Dự án", ROUTES.projects], ["Đào tạo", ROUTES.courses], ["Tin tức", ROUTES.blog]] as const;

export function Header() {
  const pathname = usePathname();
  return <header className="apple-site-header"><div className="apple-global-nav"><div className="apple-nav-inner"><Link className="apple-logo" href={ROUTES.home} aria-label="BIM4C — Trang chủ">BIM<span>4C</span></Link><nav aria-label="Điều hướng chính">{navigation.map(([label, href]) => <Link className={pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""} aria-current={pathname === href ? "page" : undefined} href={href} key={href}>{label}</Link>)}</nav><Link className="apple-nav-contact" href={ROUTES.contact}>Liên hệ</Link><MobileNavigation /></div></div></header>;
}
