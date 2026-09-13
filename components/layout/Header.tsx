"use client";
import Link from "next/link";
import { ArrowUpRight, Menu, Search } from "lucide-react";
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
import { CommandMenu } from "@/components/shared/CommandMenu";

export function Header() {
  const pathname = usePathname();
  const [overHero, setOverHero] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const { t, locale } = useLanguage();

  const navigation = [
    { label: t.navigation.about, href: ROUTES.about },
    { label: t.navigation.services, href: ROUTES.services },
    { label: t.navigation.projects, href: ROUTES.projects },
    { label: t.navigation.courses, href: ROUTES.courses },
    { label: t.navigation.blog, href: ROUTES.blog },
    { label: t.navigation.bimViewer, href: ROUTES.bimViewer, is3D: true },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const updateHeader = () =>
      setOverHero(
        window.scrollY < 40 &&
          Boolean(
            document.querySelector(".page-hero") ||
              document.querySelector(".home-hero") ||
              document.querySelector("main > section:first-child.bg-brand-ink") ||
              document.querySelector("#main-content section:first-child.bg-brand-ink"),
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
        "site-header fixed inset-x-0 top-0 z-50 transition-all duration-300",
        overHero
          ? "border-b border-transparent bg-transparent text-white"
          : "border-b border-border bg-white/95 text-foreground backdrop-blur-xl shadow-xs",
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
            <strong
              className={cn(
                "block text-[17px] font-black tracking-[.14em]",
                overHero ? "text-white" : "text-slate-950",
              )}
            >
              BIM
              <span className={overHero ? "text-teal-400" : "text-teal-600"}>
                4C
              </span>
            </strong>
            <small
              className={cn(
                "mt-0.5 hidden text-[10px] font-medium tracking-[.12em] sm:block",
                overHero ? "text-white/65" : "text-slate-500",
              )}
            >
              {t.navigation.tagline}
            </small>
          </span>
        </Link>
        <nav
          className={cn(
            "desktop-navigation hidden items-center gap-1 xl:flex",
            overHero ? "text-white" : "text-foreground",
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
                  "nav-link px-3 py-3 text-[13px] font-medium transition-colors duration-200",
                  overHero
                    ? isCurrentPage
                      ? "text-teal-200"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                    : isCurrentPage
                      ? "text-primary"
                      : "text-slate-700 hover:bg-white hover:text-slate-950 font-medium",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="grid size-11 place-items-center rounded-lg hover:bg-primary/10"
            aria-label={locale === "vi" ? "Tìm kiếm" : "Search"}
          >
            <Search className="size-4" />
          </button>
          <LanguageSwitcher isOverHero={overHero} />
          <Button
            asChild
            className={cn(
              "rounded-lg px-5 font-semibold transition-colors duration-200 shadow-none",
              overHero
                ? "bg-white text-brand-ink hover:bg-teal-50 hover:text-brand-ink shadow-teal-900/30"
                : "bg-primary text-white hover:bg-primary-hover shadow-primary/30",
            )}
          >
            <Link href={ROUTES.contact}>
              {t.navigation.requestConsultation}{" "}
              <ArrowUpRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 xl:hidden">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-lg border transition-colors",
              overHero
                ? "border-white/20 bg-black/30 text-white hover:bg-white/15"
                : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200",
            )}
            aria-label={locale === "vi" ? "Tìm kiếm" : "Search"}
          >
            <Search className="size-4 text-teal-400" />
          </button>
          <LanguageSwitcher
            variant="compact"
            isOverHero={overHero}
            className="hidden sm:inline-flex"
          />
          <Link
            href={ROUTES.contact}
            className={cn(
              "inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold",
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
                  "size-11 xl:hidden",
                  overHero
                    ? "text-white hover:bg-white/10 hover:text-white"
                    : "text-slate-900 hover:bg-slate-100 hover:text-slate-950",
                )}
                aria-label={
                  locale === "vi"
                    ? "Mở menu điều hướng"
                    : "Open navigation menu"
                }
                aria-haspopup="dialog"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto p-6">
              <SheetTitle className="mb-2 text-left">
                {t.navigation.exploreBim4c}
              </SheetTitle>
              <p className="mb-5 text-sm leading-6 text-muted-foreground">
                {t.hero.badge}
              </p>
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <span className="text-xs font-medium text-muted-foreground">
                  Language / Ngôn ngữ:
                </span>
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
      <CommandMenu isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </header>
  );
}
