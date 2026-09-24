"use client";

import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { Box, Compass, Home, Phone } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

import { ui } from "@/lib/i18n/ui";
export function NotFoundView() {
  const { locale } = useLanguage();

  return (
    <main className="relative isolate min-h-[85vh] flex items-center justify-center overflow-hidden bg-brand-ink text-white py-24">
      {/* Background Ambience & Tech Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(45, 212, 191, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(45, 212, 191, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[120px]"
      />

      <div className="site-container relative z-10 max-w-2xl text-center px-4">
        {/* Brand 3D Cube Icon */}
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 via-teal-500/10 to-transparent border border-teal-500/30 p-4 shadow-2xl shadow-teal-950/50">
          <Box className="size-10 text-teal-300 animate-pulse" />
        </div>

        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-teal-300">
          {ui(locale).notFoundView.t404ERRORPAGENOTFOUND}
        </p>

        <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
          {ui(locale).notFoundView.thisPageDoesNotExist}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
          {ui(locale).notFoundView.theLinkYouAccessedIs}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-teal-900/30"
          >
            <Link href={ROUTES.home}>
              <Home className="size-4 mr-2" />
              {ui(locale).notFoundView.returnToHomepage}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={ROUTES.services}>
              <Compass className="size-4 mr-2 text-teal-300" />
              {ui(locale).notFoundView.solutionsServices}
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Link href={ROUTES.contact}>
              <Phone className="size-4 mr-2 text-teal-300" />
              {ui(locale).notFoundView.contactSupport}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
