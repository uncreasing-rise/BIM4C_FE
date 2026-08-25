"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/features/homepage/types";

export function Hero({slides}:{slides:HeroSlide[]}) {
  const heroSlides=slides;
  const [active,setActive]=useState(0); const touch=useRef(0);
  const move=(step:number)=>setActive((value)=>(value+step+heroSlides.length)%heroSlides.length);
  useEffect(()=>{ if(!heroSlides.length||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return; const timer=window.setTimeout(()=>setActive((value)=>(value+1)%heroSlides.length),6500); return()=>window.clearTimeout(timer)},[active]);
  if (!heroSlides.length) return null;
  return <section className="hero" onTouchStart={(event)=>touch.current=event.touches[0].clientX} onTouchEnd={(event)=>{const distance=event.changedTouches[0].clientX-touch.current;if(Math.abs(distance)>45)move(distance<0?1:-1)}}>
    {heroSlides.map((item,index)=><Image className={`hero-slide-image${index===active?" active":""}`} key={item.image} src={item.image} alt={index===active?"Dự án xây dựng tiêu biểu của BIM4C":""} aria-hidden={index!==active} fill preload={index===0} sizes="100vw"/>)}<div className="hero-overlay"/>
    <button className="hero-arrow prev" type="button" onClick={()=>move(-1)} aria-label="Banner trước">‹</button>
    <div className="hero-content" key={active}><p>{heroSlides[active].eyebrow}</p><h1>{heroSlides[active].title}</h1><span/></div>
    <button className="hero-arrow next" type="button" onClick={()=>move(1)} aria-label="Banner tiếp theo">›</button>
    <div className="slider-dots">{heroSlides.map((item,index)=><button type="button" className={index===active?"active":""} onClick={()=>setActive(index)} aria-label={`Banner ${index+1}`} key={item.image}/>)}</div>
  </section>;
}
