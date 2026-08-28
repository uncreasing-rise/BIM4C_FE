import Image from "next/image";
import Link from "next/link";

export function PageHero({ eyebrow, title, description, image }: { eyebrow: string; title: string; description: string; image: string }) {
  const naturalEyebrow = eyebrow === eyebrow.toLocaleUpperCase("vi-VN")
    ? eyebrow.toLocaleLowerCase("vi-VN").replace(/^./u, (character) => character.toLocaleUpperCase("vi-VN")).replace(/\bbim4c\b/giu, "BIM4C").replace(/\bbim\b/giu, "BIM")
    : eyebrow;

  return <section className="relative isolate h-[274px] w-full overflow-hidden border-b-[3px] border-[#09a7a5] bg-[#063f46] text-white"><Image className="-z-20 object-cover object-center saturate-[.72] contrast-[1.04] motion-safe:scale-[1.015] md:object-[center_45%]" src={image} alt="" fill preload sizes="100vw" /><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_45%,rgba(9,167,165,.3),transparent_34%),linear-gradient(90deg,rgba(6,63,70,.96)_0%,rgba(6,63,70,.78)_52%,rgba(6,63,70,.38)_100%)]" /><div className="relative mx-auto flex h-full w-[calc(100%_-_32px)] max-w-[1440px] items-center justify-center py-[22px] md:w-[calc(100%_-_64px)] md:py-7"><div className="mx-auto w-full max-w-[860px] text-center"><nav className="mb-[9px] flex max-w-full items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-micro font-normal leading-snug text-white/60 md:mb-3 md:gap-[9px]" aria-label="Breadcrumb"><Link className="transition-colors hover:text-white" href="/">Trang chủ</Link><span>/</span><strong className="font-normal text-[#09a7a5]">{naturalEyebrow}</strong></nav><h1 className="mx-auto max-w-[820px] text-2xl font-bold uppercase leading-[1.1] tracking-[-.02em] text-balance text-white md:text-section-title md:leading-[1.08]">{title}</h1><p className="mx-auto mt-[7px] max-w-[700px] text-xs leading-[1.4] text-pretty text-white/75 md:mt-2.5 md:text-label md:leading-[1.55]">{description}</p></div></div></section>;
}
