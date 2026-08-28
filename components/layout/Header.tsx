"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER_MENUS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { MobileNavigation } from "./MobileNavigation";

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavMenu({ label, href, items, pathname }: { label: string; href: string; items: ReadonlyArray<{ label: string; href: string }>; pathname: string }) {
  const active = isCurrent(pathname, href);
  return <div className="group relative flex h-full items-center">
    <Link className={`relative flex h-full items-center whitespace-nowrap after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-[#09a7a5] after:transition-transform hover:text-[#087f7d] hover:after:scale-x-100 ${active ? "text-[#163b3a] after:scale-x-100" : ""}`} href={href} aria-current={active ? "page" : undefined}>{label}</Link>
    <div className="invisible absolute left-0 top-[50px] w-[280px] translate-y-3 border-t-[3px] border-[#09a7a5] bg-white p-3 opacity-0 shadow-[0_12px_30px_rgb(3_68_67_/_18%)] transition-[opacity,transform,visibility] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
      {items.map((item) => <Link className="flex min-h-11 items-center justify-between border-b border-[#dbe7e5] px-3 py-2.5 text-xs font-medium normal-case text-[#163b3a] last:border-0 hover:bg-[#eaf8f7] hover:text-[#087f7d]" href={item.href} key={item.label}>{item.label}<span className="text-[#087f7d] transition-transform group-hover:translate-x-1">→</span></Link>)}
    </div>
  </div>;
}

export function Header() {
  const pathname = usePathname();
  const linkClass = (href: string) => `relative flex h-full items-center whitespace-nowrap after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-[#09a7a5] after:transition-transform hover:text-[#087f7d] hover:after:scale-x-100 ${isCurrent(pathname, href) ? "text-[#163b3a] after:scale-x-100" : ""}`;
  return <header className="sticky top-0 z-50 h-[68px] w-full bg-white shadow-[0_1px_0_rgb(4_95_94_/_15%)] lg:h-[85px]">
    <div className="hidden h-[35px] bg-[#063f46] font-normal text-white lg:block" style={{ fontSize: "12px" }}><div className="mx-auto grid h-full w-[calc(100%_-_48px)] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-6"><span className="truncate">CÔNG TY CỔ PHẦN ĐẦU TƯ XÂY DỰNG RICONS</span><span className="whitespace-nowrap text-white/70">ONE TEAM - GREAT SOLUTION</span><nav className="flex h-full items-center justify-self-end" aria-label="Liên kết tiện ích"><Link className="border-l border-white/15 px-4 transition-colors hover:text-[#09a7a5]" href={ROUTES.courses}>Tuyển dụng</Link><Link className="border-l border-white/15 px-4 transition-colors hover:text-[#09a7a5]" href={ROUTES.contact}>Liên hệ</Link><div className="group relative flex h-full cursor-pointer items-center border-l border-white/15 px-4"><span className="flex items-center gap-1">VN <span>⌄</span></span><div className="invisible absolute right-0 top-full w-[120px] translate-y-1.5 bg-[#063f46] p-1.5 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">{["Tiếng Việt", "English"].map((language) => <a className="block px-2.5 py-1.5 hover:bg-white/10" href="#" key={language}>{language}</a>)}</div></div></nav></div></div>
    <div className="flex h-[68px] items-center px-5 lg:h-[50px] lg:grid lg:grid-cols-[auto_auto_auto] lg:justify-center lg:gap-12 lg:px-[clamp(28px,4vw,68px)]">
      <nav className="hidden h-full items-center gap-[clamp(14px,1.5vw,26px)] text-[15px] font-bold tracking-[.03em] lg:flex" aria-label="Điều hướng chính"><NavMenu label="GIỚI THIỆU" href={ROUTES.about} items={HEADER_MENUS.about} pathname={pathname} /><NavMenu label="DỊCH VỤ" href={ROUTES.services} items={HEADER_MENUS.services} pathname={pathname} /><NavMenu label="DỰ ÁN" href={ROUTES.projects} items={HEADER_MENUS.projects} pathname={pathname} /></nav>
      <Link className="mr-auto justify-self-center text-[32px] font-bold leading-none tracking-[-.03em] text-[#063f46] lg:mr-0" href={ROUTES.home}>BIM<span className="text-[#09a7a5]">4C</span></Link>
      <nav className="hidden h-full items-center justify-self-auto gap-[clamp(14px,1.5vw,26px)] text-[15px] font-bold tracking-[.03em] lg:flex" aria-label="Điều hướng bổ sung"><Link className={linkClass(ROUTES.courses)} aria-current={isCurrent(pathname, ROUTES.courses) ? "page" : undefined} href={ROUTES.courses}>KHÓA HỌC</Link><Link className={linkClass(ROUTES.blog)} aria-current={isCurrent(pathname, ROUTES.blog) ? "page" : undefined} href={ROUTES.blog}>TIN TỨC</Link><Link className={linkClass(ROUTES.contact)} href={ROUTES.contact}>LIÊN HỆ</Link></nav>
      <MobileNavigation />
    </div>
  </header>;
}
