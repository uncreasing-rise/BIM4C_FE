"use client";
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MAIN_NAVIGATION } from "@/constants/navigation";
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

export function Header() {
  const pathname = usePathname();
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const updateHeader = () => setOverHero(window.scrollY < 72);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
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
      <div className="site-container flex h-20 items-center justify-between">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-3"
          aria-label="BIM4C — Trang chủ"
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
                "mt-1.5 block text-[8px] font-semibold uppercase tracking-[.22em]",
                overHero ? "text-white/60" : "text-muted-foreground",
              )}
            >
              Digital Construction
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
          aria-label="Điều hướng chính"
        >
          {MAIN_NAVIGATION.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-semibold transition-all",
                overHero
                  ? "text-white/75 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
                pathname.startsWith(item.href) &&
                  (overHero
                    ? "bg-white text-brand-ink hover:bg-white hover:text-brand-ink"
                    : "bg-foreground text-background shadow-sm hover:bg-foreground hover:text-background"),
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          asChild
          className={cn(
            "hidden rounded-full px-5 lg:inline-flex",
            overHero && "bg-white text-brand-ink shadow-none hover:bg-white/90",
          )}
        >
          <Link href={ROUTES.contact}>
            Nhận tư vấn <ArrowUpRight />
          </Link>
        </Button>
        <Sheet key={pathname}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-11 lg:hidden",
                overHero && "text-white hover:bg-white/10 hover:text-white",
              )}
              aria-label="Mở menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-6">
            <SheetTitle className="mb-8 text-left">BIM4C</SheetTitle>
            <nav className="grid gap-2">
              {MAIN_NAVIGATION.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Button
                    asChild
                    variant="ghost"
                    className="min-h-11 justify-start text-base"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Button asChild className="mt-4 min-h-11">
                  <Link href={ROUTES.contact}>Nhận tư vấn</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
