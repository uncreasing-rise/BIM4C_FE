"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { HeroSlide } from "@/features/homepage/types";

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const touch = useRef(0);
  const move = (step: number) => setActive((value) => (value + step + slides.length) % slides.length);

  useEffect(() => {
    if (!slides.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % slides.length), 6500);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!slides.length) return null;

  return <section className="relative isolate flex h-[calc(100svh-68px)] min-h-[600px] w-full items-center overflow-hidden bg-[#063f46] text-white lg:h-[calc(100svh-84px)] lg:min-h-[640px]" onTouchStart={(event) => { touch.current = event.touches[0].clientX; }} onTouchEnd={(event) => { const distance = event.changedTouches[0].clientX - touch.current; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1); }}>
    {slides.map((item, index) => <Image className={`object-cover object-center saturate-[.92] contrast-[1.05] transition-[opacity,transform] duration-1000 motion-reduce:transition-none ${index === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`} key={item.id ?? `${item.image}-${item.sortOrder}-${index}`} src={item.image} alt={index === active ? item.alt : ""} aria-hidden={index !== active} fill preload={index === 0} sizes="100vw" />)}
    <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_82%_38%,rgba(9,167,165,.24),transparent_30%),linear-gradient(90deg,rgba(6,63,70,.97)_0%,rgba(6,63,70,.82)_48%,rgba(6,63,70,.28)_100%),linear-gradient(0deg,rgba(6,63,70,.88)_0%,transparent_56%)]" />
    <div className="absolute inset-0 z-[1] hidden opacity-20 lg:block lg:bg-[linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] lg:bg-[size:clamp(90px,9vw,140px)_clamp(90px,9vw,140px)] [mask-image:linear-gradient(90deg,black,transparent_72%)]" />
    <div className="absolute inset-x-0 bottom-0 z-[1] h-52 bg-gradient-to-t from-[#063f46] via-[#063f46]/65 to-transparent" />
    <span className="pointer-events-none absolute right-[-.04em] top-1/2 z-[1] hidden -translate-y-1/2 select-none text-hero-index font-bold text-white/[.035] lg:block" aria-hidden="true">{String(active + 1).padStart(2, "0")}</span>

    <div className="relative z-[2] mx-auto grid w-[calc(100%_-_40px)] max-w-[1400px] items-center gap-12 pb-20 pt-8 sm:w-[calc(100%_-_64px)] lg:w-[calc(100%_-_96px)] lg:grid-cols-[minmax(0,1fr)_280px] lg:pb-24">
      <div key={active} className="max-w-[900px] motion-safe:animate-[content-enter_.8s_cubic-bezier(.22,1,.36,1)_both]">
        <h1 className="max-w-[960px] text-display font-bold tracking-[-.055em] text-balance">{slides[active].title}</h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-10">
          <Link className="group inline-flex min-h-14 items-center gap-8 bg-[#09a7a5] px-7 text-xs font-semibold uppercase tracking-[.05em] shadow-[0_14px_35px_rgb(9_167_165_/_22%)] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#063f46] hover:shadow-xl" href={ROUTES.services}>Khám phá năng lực <span className="text-lg transition-transform group-hover:translate-x-1">→</span></Link>
          <Link className="group inline-flex min-h-12 items-center gap-3 border-b border-white/35 text-xs font-semibold uppercase tracking-[.05em] text-white/90 transition-colors hover:border-[#ffffff] hover:text-[#ffffff]" href={ROUTES.contact}>Trao đổi cùng BIM4C <span className="text-lg transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></Link>
        </div>
      </div>
      <aside className="hidden border-y border-white/20 bg-[#063f46]/55 p-6 backdrop-blur-md lg:block"><p className="mb-5 text-micro font-semibold uppercase tracking-[.18em] text-[#ffffff]">Năng lực BIM4C</p><dl className="grid gap-5"><div className="border-b border-white/15 pb-5"><dt className="text-4xl font-bold text-white">20+</dt><dd className="mt-1 text-xs uppercase tracking-wider text-white/55">Năm kinh nghiệm</dd></div><div className="border-b border-white/15 pb-5"><dt className="text-4xl font-bold text-white">180+</dt><dd className="mt-1 text-xs uppercase tracking-wider text-white/55">Dự án tiêu biểu</dd></div><div><dt className="text-4xl font-bold text-[#09a7a5]">1000+</dt><dd className="mt-1 text-xs uppercase tracking-wider text-white/55">Chuyên gia đồng hành</dd></div></dl></aside>
    </div>

    <div className="absolute inset-x-5 bottom-7 z-[3] flex items-center justify-between sm:inset-x-8 lg:inset-x-[max(calc((100vw-1280px)/2),48px)] lg:bottom-9">
      <div className="flex items-center gap-4 text-micro font-semibold tracking-wider text-white/70"><span className="text-white">{String(active + 1).padStart(2, "0")}</span><div className="flex items-center gap-2">{slides.map((item, index) => <button type="button" className={`h-0.5 border-0 transition-[width,background-color] ${index === active ? "w-12 bg-[#09a7a5]" : "w-6 bg-white/30 hover:bg-white/60"}`} onClick={() => setActive(index)} aria-label={`Banner ${index + 1}`} key={item.id ?? `${item.image}-${item.sortOrder}-${index}`} />)}</div><span>{String(slides.length).padStart(2, "0")}</span></div>
      <div className="hidden items-center gap-2 sm:flex"><button className="grid size-10 place-items-center bg-transparent text-4xl font-normal leading-none text-white/60 transition-[color,transform] hover:-translate-x-1 hover:text-white" type="button" onClick={() => move(-1)} aria-label="Banner trước">‹</button><button className="grid size-10 place-items-center bg-transparent text-4xl font-normal leading-none text-white/60 transition-[color,transform] hover:translate-x-1 hover:text-white" type="button" onClick={() => move(1)} aria-label="Banner tiếp theo">›</button></div>
    </div>
  </section>;
}
