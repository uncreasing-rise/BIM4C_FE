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
        className="relative h-[460px] sm:h-[540px] lg:h-[640px] w-full"
      />
    ),
  },
);

export function BimInteractiveHeroVisual() {
  return <BimHero3DCanvas />;
}
