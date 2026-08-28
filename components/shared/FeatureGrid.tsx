import Image from "next/image";
import Link from "next/link";

export interface FeatureItem { title: string; description: string; image: string; meta?: string; href?: string }

export function FeatureGrid({ items, columns = 3 }: { items: FeatureItem[]; columns?: 2 | 3 }) {
  return <div className={`grid grid-cols-1 gap-7 ${columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>{items.map((item) => <article className="group relative border-b-[3px] border-[#09a7a5] bg-white shadow-sm" key={item.title}>{item.href && <Link className="absolute inset-0 z-[2]" href={item.href} aria-label={`Xem ${item.title}`}/>}<div className="relative h-[250px] overflow-hidden md:h-[290px]"><Image className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" src={item.image} alt={item.title} fill sizes={columns === 2 ? "(max-width: 767px) 100vw, 50vw" : "(max-width: 767px) 100vw, 33vw"}/></div><div className="relative p-[26px]">{item.meta && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#087f7d]">{item.meta}</p>}<h2 className="mb-3 text-2xl font-semibold text-[#063f46]">{item.title}</h2><p className="m-0 text-[#667775]">{item.description}</p><span className="mt-[18px] block text-card-title text-[#087f7d]" aria-hidden="true">→</span></div></article>)}</div>;
}
