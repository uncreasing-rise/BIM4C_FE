"use client";

import Image from "next/image";
import { useRef } from "react";
import type { StrategicPartner } from "@/features/homepage/types";

function PartnerSet({ partners }: { partners: StrategicPartner[] }) {
  return <div className="flex w-max min-w-full items-stretch gap-4">{partners.map((partner) => <div className="group flex h-24 w-[calc((100cqw-48px)/4)] min-w-0 flex-none items-center justify-center rounded-sm border border-[#dbe7e5] bg-white p-5 shadow-[0_6px_20px_rgb(6_63_70_/_5%)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[#09a7a5]/60 hover:shadow-[0_12px_28px_rgb(6_63_70_/_10%)]" key={partner.id ?? partner.name}><Image className="max-h-12 w-auto max-w-full object-contain opacity-85 transition-opacity duration-300 group-hover:opacity-100" src={partner.logo} alt={partner.name} width={190} height={72}/></div>)}</div>;
}

export function Partners({ partners }: { partners: StrategicPartner[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => {
    const node = rail.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    if (max <= 0) return;
    const next = node.scrollLeft + direction * 300;
    node.scrollTo({ left: next >= max - 8 ? 0 : next <= 8 ? max : next, behavior: "smooth" });
  };

  return <section className="relative overflow-hidden bg-[#f5fafa] py-16 lg:py-24" id="partners">
    <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1280px] md:w-[calc(100%_-_64px)]">
      <header className="mb-8 flex flex-col gap-5 border-b border-[#dbe7e5] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-[#087f7d]">ĐỒNG HÀNH CÙNG BIM4C</p><h2 className="m-0 text-3xl font-bold tracking-[-.02em] text-[#063f46] sm:text-4xl lg:text-[48px]">ĐỐI TÁC CHIẾN LƯỢC</h2><p className="mt-3 max-w-[660px] text-[16px] leading-6 text-[#667775]">Sự tin tưởng của khách hàng và đối tác là nền tảng cho mọi thành công của BIM4C.</p></div>
      </header>
      <div className="flex items-center gap-4"><button className="grid size-11 shrink-0 place-items-center rounded-full border border-[#09a7a5]/30 bg-white text-[#087f7d] shadow-sm transition hover:border-[#09a7a5] hover:bg-[#09a7a5] hover:text-white" type="button" onClick={() => scroll(-1)} aria-label="Đối tác trước"><span className="size-2.5 rotate-[-135deg] border-r-2 border-t-2 border-current" aria-hidden="true"/></button><div ref={rail} className="@container min-w-0 flex-1 overflow-x-auto pb-2 [scrollbar-width:none]" aria-label="Danh sách đối tác chiến lược"><PartnerSet partners={partners}/></div><button className="grid size-11 shrink-0 place-items-center rounded-full border border-[#09a7a5]/30 bg-white text-[#087f7d] shadow-sm transition hover:border-[#09a7a5] hover:bg-[#09a7a5] hover:text-white" type="button" onClick={() => scroll(1)} aria-label="Đối tác tiếp theo"><span className="size-2.5 rotate-45 border-r-2 border-t-2 border-current" aria-hidden="true"/></button></div>
    </div>
  </section>;
}
