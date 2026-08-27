"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants/routes";
import type { HeroSlide } from "@/features/homepage/types";

export function Hero({slides}:{slides:HeroSlide[]}) {
  const heroSlides=slides;
  const [active,setActive]=useState(0); const touch=useRef(0);
  const move=(step:number)=>setActive((value)=>(value+step+heroSlides.length)%heroSlides.length);
  useEffect(()=>{ if(!heroSlides.length||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return; const timer=window.setTimeout(()=>setActive((value)=>(value+1)%heroSlides.length),6500); return()=>window.clearTimeout(timer)},[active]);
  if (!heroSlides.length) return null;
  return <section className="hero" onTouchStart={(event)=>touch.current=event.touches[0].clientX} onTouchEnd={(event)=>{const distance=event.changedTouches[0].clientX-touch.current;if(Math.abs(distance)>45)move(distance<0?1:-1)}}>
    {heroSlides.map((item,index)=><Image className={`hero-slide-image${index===active?" active":""}`} key={item.id??`${item.image}-${item.sortOrder}-${index}`} src={item.image} alt={index===active?item.alt:""} aria-hidden={index!==active} fill preload={index===0} sizes="100vw"/>)}<div className="hero-overlay"/><div className="hero-grid" aria-hidden="true"/>
    <button className="hero-arrow prev" type="button" onClick={()=>move(-1)} aria-label="Banner trước">‹</button>
    <div className="hero-content" key={active}><div className="hero-kicker"><span>{String(active+1).padStart(2,"0")}</span><p>{heroSlides[active].eyebrow}</p></div><h1>{heroSlides[active].title}</h1><p className="hero-summary">Quản lý chất lượng, phối hợp BIM và kiểm soát thi công cho các dự án xây dựng.</p><div className="hero-actions"><Link href={ROUTES.services}>Khám phá năng lực <span>↗</span></Link><Link href={ROUTES.contact}>Trao đổi cùng BIM4C <span>→</span></Link></div></div>
    <button className="hero-arrow next" type="button" onClick={()=>move(1)} aria-label="Banner tiếp theo">›</button>
    <div className="hero-navigation"><span>{String(active+1).padStart(2,"0")}</span><div className="slider-dots">{heroSlides.map((item,index)=><button type="button" className={index===active?"active":""} onClick={()=>setActive(index)} aria-label={`Banner ${index+1}`} key={item.id??`${item.image}-${item.sortOrder}-${index}`}/>)}</div><span>{String(heroSlides.length).padStart(2,"0")}</span></div><div className="hero-scroll" aria-hidden="true"><i/>CUỘN ĐỂ KHÁM PHÁ</div>
  </section>;
}
