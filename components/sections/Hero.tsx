"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { HeroSlide } from "@/features/homepage/types";

const sentenceCase = (value: string) => value ? value.charAt(0).toLocaleUpperCase("vi-VN") + value.slice(1).toLocaleLowerCase("vi-VN") : value;

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const touch = useRef(0);
  const wheelDistance = useRef(0);
  const wheelLocked = useRef(false);
  const items = slides.length ? slides : [{ id: "fallback", eyebrow: "BIM4C Construction", title: "Dữ liệu tốt hơn. Công trình tốt hơn.", image: "/images/news-project-coordination.webp", alt: "Đội ngũ BIM4C tại công trường", sortOrder: 0, isActive: true }];
  const move = (step: number) => setActive(value => (value + step + items.length) % items.length);

  useEffect(() => { if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = window.setTimeout(() => setActive(value => (value + 1) % items.length), 6500); return () => window.clearTimeout(timer); }, [active, items.length]);

  return <section className="apple-hero-slider" aria-roledescription="carousel" aria-label="Năng lực và dự án BIM4C" onWheel={event => { if (items.length < 2 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return; event.preventDefault(); if (wheelLocked.current) return; wheelDistance.current += event.deltaX; if (Math.abs(wheelDistance.current) < 40) return; move(wheelDistance.current > 0 ? 1 : -1); wheelDistance.current = 0; wheelLocked.current = true; window.setTimeout(() => { wheelLocked.current = false; }, 520); }} onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => { const distance = event.changedTouches[0].clientX - touch.current; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1); }}>
    {items.map((item, index) => <Image className={`apple-hero-slide ${index === active ? "active" : ""}`} key={item.id ?? `${item.image}-${index}`} src={item.image} alt={index === active ? item.alt : ""} aria-hidden={index !== active} fill priority={index === 0} sizes="100vw" />)}<div className="apple-hero-scrim" />
    <div className="apple-hero-content" key={active}><p className="apple-kicker">{items[active].eyebrow || "BIM4C Construction"}</p><h1>{sentenceCase(items[active].title)}</h1><p className="apple-hero-lead">Giải pháp BIM xuyên suốt từ thiết kế, phối hợp thi công đến vận hành công trình.</p><div className="apple-actions"><Link className="apple-primary" href={ROUTES.services}>Khám phá năng lực</Link><Link className="apple-link on-dark" href={ROUTES.projects}>Xem dự án <span>›</span></Link></div></div>
    {items.length > 1 ? <div className="apple-hero-controls"><div>{items.map((item, index) => <button type="button" className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Xem nội dung ${index + 1}`} aria-current={index === active} key={item.id ?? index} />)}</div></div> : null}
  </section>;
}
