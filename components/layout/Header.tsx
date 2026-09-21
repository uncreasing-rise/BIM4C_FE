"use client";

import Image from "next/image";
import { Box, ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { ABOUT_MENU_ITEMS as aboutItems, SERVICE_MENU_GROUPS as serviceGroups } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { localePrefix } from "@/lib/i18n/path";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";

const text = (item: { vi: string; en: string }, locale: string) => (locale === "vi" ? item.vi : item.en);

export function Header() {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(true);
  const [openMenu, setOpenMenu] = useState<"about" | "services" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const isVi = locale === "vi";

  const active = (href: string) => {
    const locHref = localePrefix(locale, href);
    const homeLoc = localePrefix(locale, ROUTES.home);
    return pathname === locHref || (locHref !== homeLoc && pathname.startsWith(`${locHref}/`));
  };

  useEffect(() => {
    const update = () =>
      setOverHero(
        window.scrollY < 40 &&
          Boolean(document.querySelector(".page-hero, .home-hero, main > section:first-child.bg-brand-ink"))
      );
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpenMenu(null);
      setMobileOpen(false);
      setMobileAboutOpen(false);
      setMobileServicesOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    window.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const navClass = (href: string) =>
    cn(
      "inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-[13px] font-semibold transition-colors",
      overHero
        ? active(href)
          ? "text-teal-200"
          : "text-white/85 hover:bg-white/10 hover:text-white"
        : active(href)
          ? "bg-primary/10 text-primary"
          : "text-slate-700 hover:bg-muted hover:text-slate-950"
    );
  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      ref={rootRef}
      className={cn(
        "site-header fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200",
        overHero
          ? "border-transparent bg-transparent text-white"
          : "border-border bg-white/95 text-foreground shadow-xs backdrop-blur-xl"
      )}
    >
      <div className="site-container flex h-16 items-center gap-3 sm:h-20">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "order-first size-10 shrink-0 lg:hidden",
                overHero ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-muted"
              )}
              aria-label={isVi ? "Mở menu điều hướng" : "Open navigation menu"}
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="flex w-[min(90vw,24rem)] flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <SheetTitle>{isVi ? "Điều hướng BIM4C" : "BIM4C navigation"}</SheetTitle>
              <button
                type="button"
                onClick={closeMobile}
                className="grid size-10 place-items-center rounded-lg hover:bg-muted"
                aria-label={isVi ? "Đóng menu" : "Close menu"}
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-label={isVi ? "Điều hướng chính" : "Main navigation"}>
              <div className="grid gap-1">
                <button
                  type="button"
                  onClick={() => setMobileAboutOpen((v) => !v)}
                  className="flex min-h-12 items-center justify-between rounded-lg px-3 text-left text-base font-semibold hover:bg-muted"
                  aria-expanded={mobileAboutOpen}
                >
                  {isVi ? "Giới thiệu" : "About"}
                  <ChevronDown className={cn("size-4 transition-transform", mobileAboutOpen && "rotate-180")} />
                </button>
                {mobileAboutOpen && (
                  <div className="ml-3 grid border-l pl-3">
                    {aboutItems.map((item) => (
                      <Link
                        key={item.vi}
                        href={item.href}
                        onClick={closeMobile}
                        className="flex min-h-11 items-center rounded-lg px-3 text-sm hover:bg-muted"
                      >
                        {text(item, locale)}
                      </Link>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((v) => !v)}
                  className="flex min-h-12 items-center justify-between rounded-lg px-3 text-left text-base font-semibold hover:bg-muted"
                  aria-expanded={mobileServicesOpen}
                >
                  {isVi ? "Dịch vụ" : "Services"}
                  <ChevronDown className={cn("size-4 transition-transform", mobileServicesOpen && "rotate-180")} />
                </button>
                {mobileServicesOpen && (
                  <div className="ml-3 grid gap-3 border-l py-2 pl-3">
                    {serviceGroups.map((group) => (
                      <div key={group.vi}>
                        <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                          {text(group, locale)}
                        </p>
                        {group.items.map((item) => (
                          <Link
                            key={item.vi}
                            href={item.href}
                            onClick={closeMobile}
                            className="flex min-h-10 items-center rounded-lg px-3 text-sm hover:bg-muted"
                          >
                            {text(item, locale)}
                          </Link>
                        ))}
                      </div>
                    ))}
                    <Link
                      href={ROUTES.services}
                      onClick={closeMobile}
                      className="mt-1 flex min-h-10 items-center justify-between rounded-lg bg-primary/10 px-3 text-sm font-bold text-primary hover:bg-primary/20"
                    >
                      <span>{isVi ? "Xem tất cả dịch vụ" : "View all services"}</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
                <Link
                  href={ROUTES.projects}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.projects) && "text-primary"
                  )}
                >
                  {isVi ? "Dự án" : "Projects"}
                </Link>
                <Link
                  href={ROUTES.courses}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.courses) && "text-primary"
                  )}
                >
                  {isVi ? "Đào tạo" : "Training"}
                </Link>
                <Link
                  href={ROUTES.technical}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.technical) && "text-primary"
                  )}
                >
                  {isVi ? "Chuyên môn BIM" : "Technical Hub"}
                </Link>
                <Link
                  href={ROUTES.news}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.news) && "text-primary"
                  )}
                >
                  {isVi ? "Tin tức" : "News & Events"}
                </Link>
                <Link
                  href={ROUTES.contact}
                  onClick={closeMobile}
                  className="mt-3 flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 text-base font-bold text-white hover:bg-primary-hover"
                >
                  {isVi ? "Liên hệ tư vấn" : "Contact us"} →
                </Link>
              </div>
              <Link
                href={ROUTES.bimViewer}
                onClick={closeMobile}
                className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 text-base font-bold text-primary hover:bg-primary/10"
              >
                <Box className="size-4" />
                {t.navigation.bimViewer}
              </Link>
            </nav>
            <div className="border-t px-5 py-4">
              <LanguageSwitcher />
            </div>
          </SheetContent>
        </Sheet>

        <Link href={ROUTES.home} className="group flex shrink-0 items-center gap-2.5" aria-label="BIM4C">
          <div className="relative size-9 sm:size-10 overflow-hidden rounded-full border border-teal-500/30 bg-white/95 p-0.5 shadow-sm transition-transform group-hover:scale-105">
            <Image src="/images/bim4c-logo.png" alt="BIM4C Logo" fill className="object-contain" priority />
          </div>
          <span className="leading-none">
            <strong className={cn("block text-[17px] font-black tracking-[.14em]", overHero ? "text-white" : "text-slate-950")}>
              BIM<span className={overHero ? "text-teal-400" : "text-teal-600"}>4C</span>
            </strong>
            <small
              className={cn(
                "mt-0.5 hidden text-[10px] font-medium tracking-[.12em] sm:block",
                overHero ? "text-white/65" : "text-slate-500"
              )}
            >
              {t.navigation.tagline}
            </small>
          </span>
        </Link>

        <nav className="desktop-navigation ml-auto hidden items-center gap-1 lg:flex" aria-label={isVi ? "Điều hướng chính" : "Main navigation"}>
          <div className="relative" onMouseEnter={() => setOpenMenu("about")} onMouseLeave={() => setOpenMenu(null)}>
            <button
              type="button"
              className={navClass(ROUTES.about)}
              onClick={() => setOpenMenu((v) => (v === "about" ? null : "about"))}
              aria-expanded={openMenu === "about"}
              aria-haspopup="true"
            >
              {isVi ? "Giới thiệu" : "About"}
              <ChevronDown className="size-3.5" />
            </button>
            {openMenu === "about" && (
              <div className="absolute left-0 top-full w-64 pt-2">
                <div className="rounded-xl border border-border bg-white p-2 text-slate-800 shadow-xl">
                  {aboutItems.map((item) => (
                    <Link
                      key={item.vi}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium hover:bg-muted hover:text-primary"
                    >
                      {text(item, locale)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative" onMouseEnter={() => setOpenMenu("services")}>
            <button
              type="button"
              className={navClass(ROUTES.services)}
              onClick={() => setOpenMenu((v) => (v === "services" ? null : "services"))}
              aria-expanded={openMenu === "services"}
              aria-haspopup="true"
            >
              {isVi ? "Dịch vụ" : "Services"}
              <ChevronDown className="size-3.5" />
            </button>
            {openMenu === "services" && (
              <div className="fixed right-4 top-20 z-50 w-[min(62rem,calc(100vw-2rem))] max-h-[calc(100vh-6rem)] overflow-y-auto pt-2">
                <div className="rounded-xl border border-border bg-white p-4 text-slate-800 shadow-xl lg:p-5">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
                    {serviceGroups.map((group) => (
                      <div key={group.vi}>
                        <h3 className="border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-primary">
                          {text(group, locale)}
                        </h3>
                        <div className="mt-2 grid gap-1">
                          {group.items.map((item) => (
                            <Link
                              key={item.vi}
                              href={item.href}
                              onClick={() => setOpenMenu(null)}
                              className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-muted hover:text-primary"
                            >
                              {text(item, locale)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      {isVi ? "Giải pháp tư vấn và triển khai BIM toàn diện từ BIM4C" : "Comprehensive BIM consultancy and implementation solutions"}
                    </p>
                    <Link
                      href={ROUTES.services}
                      onClick={() => setOpenMenu(null)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      <span>{isVi ? "Xem tất cả dịch vụ" : "View all services"}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link href={ROUTES.projects} className={navClass(ROUTES.projects)}>
            {isVi ? "Dự án" : "Projects"}
          </Link>
          <Link href={ROUTES.courses} className={navClass(ROUTES.courses)}>
            {isVi ? "Đào tạo" : "Training"}
          </Link>
          <Link href={ROUTES.technical} className={navClass(ROUTES.technical)}>
            {isVi ? "Chuyên môn BIM" : "Technical"}
          </Link>
          <Link href={ROUTES.news} className={navClass(ROUTES.news)}>
            {isVi ? "Tin tức" : "News"}
          </Link>
          <Link href={ROUTES.bimViewer} className={cn(navClass(ROUTES.bimViewer), "border border-current/20")}>
            <Box className="size-4" />
            {t.navigation.bimViewer}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <LanguageSwitcher variant="compact" isOverHero={overHero} className="hidden sm:inline-flex" />
          <Button
            asChild
            className={cn(
              "hidden min-h-10 rounded-lg px-3 text-xs font-bold shadow-none sm:inline-flex sm:px-5 sm:text-sm",
              overHero ? "bg-white text-brand-ink hover:bg-teal-50" : "bg-primary text-white hover:bg-primary-hover"
            )}
          >
            <Link href={ROUTES.contact}>
              {isVi ? "Liên hệ tư vấn" : "Contact us"}
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
