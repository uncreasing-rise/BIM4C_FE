"use client";

import dynamic from "next/dynamic";

// Three.js is ~125 KB gzipped; load it after hydration so it stays out of the
// homepage's initial bundle. The placeholder matches the canvas frame exactly
// to avoid layout shift.
const BimHero3DCanvas = dynamic(
  () => import("./BimHero3DCanvas").then((mod) => mod.BimHero3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="relative h-[380px] sm:h-[440px] lg:h-[480px] w-full overflow-hidden rounded-3xl border border-white/15 bg-slate-950/80 shadow-2xl backdrop-blur-2xl"
      />
    ),
  },
);

export function BimInteractiveHeroVisual() {
  return <BimHero3DCanvas />;
}
