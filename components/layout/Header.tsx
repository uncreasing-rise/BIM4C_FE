"use client";
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const [overHero, setOverHero] = useState(true);
  const { t } = useLanguage();

  const navigation = [
    { label: t.navigation.about, href: ROUTES.about },
    { label: t.navigation.services, href: ROUTES.services },
    { label: t.navigation.projects, href: ROUTES.projects },
    { label: t.navigation.courses, href: ROUTES.courses },
    { label: t.navigation.blog, href: ROUTES.blog },
    { label: t.navigation.bimViewer, href: ROUTES.bimViewer, is3D: true },
  ];

  useEffect(() => {
    const updateHeader = () =>
      setOverHero(
        window.scrollY < 72 &&
          Boolean(
            document.querySelector("main > section:first-child.bg-brand-ink"),
          ),
      );
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    const observer = new MutationObserver(updateHeader);
    const main = document.getElementById("main-content");
    if (main) observer.observe(main, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", updateHeader);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        overHero
          ? "border-transparent bg-transparent text-white"
          : "border-b border-slate-200/80 bg-white/95 text-slate-900 shadow-md backdrop-blur-xl supports-[backdrop-filter]:bg-white/90",
      )}
    >
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-3 shrink-0 group"
          aria-label="BIM4C — Enterprise Construction Technology"
        >
          {/* Architectural 3D BIM Cube Brand Icon */}
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-800 p-0.5 shadow-md shadow-teal-900/20 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-6 text-white"
              aria-hidden="true"
            >
              {/* Isometric 3D BIM Node Structure */}
              <path
                d="M16 3L28 10V22L16 29L4 22V10L16 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-90"
              />
              <path
                d="M16 3V16M28 10L16 16M4 10L16 16"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 16V29"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="2.5" fill="#5eead4" />
              <circle cx="28" cy="10" r="1.5" fill="currentColor" />
              <circle cx="4" cy="10" r="1.5" fill="currentColor" />
              <circle cx="16" cy="29" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="leading-none">
            <span className="flex items-center gap-1">
              <strong
                className={cn(
                  "block text-[17px] font-black tracking-[.18em]",
                  overHero ? "text-white" : "text-slate-950",
                )}
              >
                BIM<span className={overHero ? "text-teal-400" : "text-teal-600"}>4C</span>
              </strong>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 font-mono text-[9px] font-bold",
                  overHero
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    : "bg-teal-500/15 text-teal-700 border border-teal-600/30",
                )}
              >
                PRO
              </span>
            </span>
            <small
              className={cn(
                "mt-1 block text-[9.5px] font-semibold tracking-[.12em]",
                overHero ? "text-white/75" : "text-slate-600",
              )}
            >
              {t.navigation.tagline}
            </small>
          </span>
        </Link>
        <nav
          className={cn(
            "hidden items-center gap-1 rounded-full border p-1 backdrop-blur-md lg:flex transition-all duration-300",
            overHero
              ? "border-white/15 bg-black/30 shadow-lg"
              : "border-slate-200/90 bg-slate-100/90 shadow-inner",
          )}
          aria-label="Main navigation"
        >
          {navigation.map((item) => {
            const isCurrentPage =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                href={item.href}
                key={item.href}
                aria-current={isCurrentPage ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200",
                  overHero
                    ? isCurrentPage
                      ? "bg-white text-brand-ink font-bold shadow-sm"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                    : isCurrentPage
                      ? "bg-primary text-white font-bold shadow-md shadow-primary/30"
                      : "text-slate-700 hover:bg-white hover:text-slate-950 font-medium",
                )}
              >
                {item.label}
                {"is3D" in item && item.is3D && (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.2 font-mono text-[9px] font-bold border",
                      isCurrentPage
                        ? "bg-white/20 text-white border-white/30"
                        : overHero
                          ? "bg-teal-500/25 text-teal-300 border-teal-500/40"
                          : "bg-teal-600/15 text-teal-700 border-teal-600/30",
                    )}
                  >
                    3D
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher isOverHero={overHero} />
          <Button
            asChild
            className={cn(
              "rounded-full px-5 font-bold transition-all duration-300 shadow-md",
              overHero
                ? "bg-white text-brand-ink hover:bg-teal-50 hover:text-brand-ink shadow-teal-900/30"
                : "bg-primary text-white hover:bg-primary-hover shadow-primary/30",
            )}
          >
            <Link href={ROUTES.contact}>
              {t.navigation.requestConsultation} <ArrowUpRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher variant="compact" isOverHero={overHero} />
          <Link
            href={ROUTES.contact}
            className={cn(
              "inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-bold",
              overHero
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-primary text-white hover:bg-primary-hover shadow-xs",
            )}
          >
            {t.common.contact}
          </Link>
          <Sheet key={pathname}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-10 lg:hidden",
                  overHero
                    ? "text-white hover:bg-white/10 hover:text-white"
                    : "text-slate-900 hover:bg-slate-100 hover:text-slate-950",
                )}
                aria-label="Open navigation menu"
                aria-haspopup="dialog"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto p-6">
              <SheetTitle className="mb-2 text-left">{t.navigation.exploreBim4c}</SheetTitle>
              <p className="mb-5 text-sm leading-6 text-muted-foreground">
                {t.hero.badge}
              </p>
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <span className="text-xs font-medium text-muted-foreground">Language / Ngôn ngữ:</span>
                <LanguageSwitcher />
              </div>
              <nav className="grid gap-2">
                <SheetClose asChild>
                  <Link
                    href={ROUTES.home}
                    className="flex min-h-11 items-center rounded-lg px-4 text-base font-medium hover:bg-muted"
                    aria-current={pathname === ROUTES.home ? "page" : undefined}
                  >
                    {t.navigation.home}
                  </Link>
                </SheetClose>
                {navigation.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Button
                      asChild
                      variant="ghost"
                      className="min-h-11 justify-start text-base"
                    >
                      <Link
                        href={item.href}
                        aria-current={
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`)
                            ? "page"
                            : undefined
                        }
                        className="aria-[current=page]:bg-muted aria-[current=page]:text-primary"
                      >
                        {item.label}
                      </Link>
                    </Button>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild className="mt-4 min-h-11 font-bold">
                    <Link href={ROUTES.contact}>{t.common.talkToExpert}</Link>
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
