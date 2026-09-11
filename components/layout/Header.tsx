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
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        overHero
          ? "border-transparent bg-transparent text-white"
          : "border-b border-black/5 bg-background/85 text-foreground shadow-sm backdrop-blur-2xl supports-[backdrop-filter]:bg-background/75",
      )}
    >
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-3 shrink-0"
          aria-label="BIM4C — Home"
        >
          <span
            className={cn(
              "relative grid size-10 place-items-center overflow-hidden rounded-xl text-sm font-black after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-primary",
              overHero
                ? "bg-white text-brand-ink"
                : "bg-foreground text-background",
            )}
          >
            B4
          </span>
          <span className="leading-none">
            <strong className="block text-[15px] tracking-[.16em]">
              BIM4C
            </strong>
            <small
              className={cn(
                "mt-1.5 block text-[9px] font-semibold uppercase tracking-[.14em]",
                overHero ? "text-white/60" : "text-muted-foreground",
              )}
            >
              {t.navigation.tagline}
            </small>
          </span>
        </Link>
        <nav
          className={cn(
            "hidden items-center gap-1 rounded-full border p-1 backdrop-blur-md lg:flex",
            overHero
              ? "border-white/15 bg-black/15"
              : "border-border/70 bg-white/60",
          )}
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              aria-current={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "page"
                  : undefined
              }
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-semibold transition-all",
                overHero
                  ? "text-white/75 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
                (pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)) &&
                  (overHero
                    ? "bg-white text-brand-ink hover:bg-white hover:text-brand-ink"
                    : "bg-foreground text-background shadow-sm hover:bg-foreground hover:text-background"),
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher isOverHero={overHero} />
          <Button
            asChild
            className={cn(
              "rounded-full px-5",
              overHero && "bg-white text-brand-ink shadow-none hover:bg-white/90",
            )}
          >
            <Link href={ROUTES.contact}>
              {t.common.talkToExpert} <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher variant="compact" isOverHero={overHero} />
          <Link
            href={ROUTES.contact}
            className={cn(
              "inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-semibold",
              overHero
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-primary text-white hover:bg-primary-hover",
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
                  overHero && "text-white hover:bg-white/10 hover:text-white",
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
                  <Button asChild className="mt-4 min-h-11">
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
