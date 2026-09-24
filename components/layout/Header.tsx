"use client";

import Image from "next/image";
import { Box, ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { ABOUT_MENU_ITEMS as aboutItems } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { localePrefix } from "@/lib/i18n/path";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";

import { ui } from "@/lib/i18n/ui";
const text = (item: { vi: string; en: string }, locale: string) => (locale === "vi" ? item.vi : item.en);

export function Header() {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(true);
  const [openMenu, setOpenMenu] = useState<"about" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

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
              aria-label={ui(locale).header.openNavigationMenu}
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="flex w-[min(90vw,24rem)] flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <SheetTitle>{ui(locale).header.bIM4CNavigation}</SheetTitle>
              <button
                type="button"
                onClick={closeMobile}
                className="grid size-10 place-items-center rounded-lg hover:bg-muted"
                aria-label={ui(locale).header.closeMenu}
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-label={ui(locale).header.mainNavigation}>
              <div className="grid gap-1">
                <button
                  type="button"
                  onClick={() => setMobileAboutOpen((v) => !v)}
                  className="flex min-h-12 items-center justify-between rounded-lg px-3 text-left text-base font-semibold hover:bg-muted"
                  aria-expanded={mobileAboutOpen}
                >
                  {ui(locale).header.about}
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
                <Link
                  href={ROUTES.services}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.services) && "text-primary"
                  )}
                >
                  {ui(locale).header.services}
                </Link>
                <Link
                  href={ROUTES.projects}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.projects) && "text-primary"
                  )}
                >
                  {ui(locale).header.projects}
                </Link>
                <Link
                  href={ROUTES.courses}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.courses) && "text-primary"
                  )}
                >
                  {ui(locale).header.training}
                </Link>
                <Link
                  href={ROUTES.technical}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.technical) && "text-primary"
                  )}
                >
                  {ui(locale).header.technicalHub}
                </Link>
                <Link
                  href={ROUTES.news}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-semibold hover:bg-muted",
                    active(ROUTES.news) && "text-primary"
                  )}
                >
                  {ui(locale).header.newsEvents}
                </Link>
                <Link
                  href={ROUTES.contact}
                  onClick={closeMobile}
                  className="mt-3 flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 text-base font-bold text-white hover:bg-primary-hover"
                >
                  {ui(locale).header.contactUs} →
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

        <nav className="desktop-navigation ml-auto hidden items-center gap-1 lg:flex" aria-label={ui(locale).header.mainNavigation}>
          <div className="relative" onMouseEnter={() => setOpenMenu("about")} onMouseLeave={() => setOpenMenu(null)}>
            <button
              type="button"
              className={navClass(ROUTES.about)}
              onClick={() => setOpenMenu((v) => (v === "about" ? null : "about"))}
              aria-expanded={openMenu === "about"}
              aria-haspopup="true"
            >
              {ui(locale).header.about}
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
          <Link href={ROUTES.services} className={navClass(ROUTES.services)}>
            {ui(locale).header.services}
          </Link>
          <Link href={ROUTES.projects} className={navClass(ROUTES.projects)}>
            {ui(locale).header.projects}
          </Link>
          <Link href={ROUTES.courses} className={navClass(ROUTES.courses)}>
            {ui(locale).header.training}
          </Link>
          <Link href={ROUTES.technical} className={navClass(ROUTES.technical)}>
            {ui(locale).header.technical}
          </Link>
          <Link href={ROUTES.news} className={navClass(ROUTES.news)}>
            {ui(locale).header.news}
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
              {ui(locale).header.contactUs}
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
