import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";

const companyStats = [
  { value: "2004", label: "Năm thành lập" },
  { value: "45", label: "Dự án đang thực hiện" },
  { value: "180", label: "Dự án đã hoàn thành" },
  { value: "1000", label: "Nhân sự" },
  { value: "9042", label: "Doanh thu 2025 (tỷ đồng)" },
] as const;

function StatIcon({ index }: { index: number }) {
  const common = "size-9 shrink-0";
  if (index === 0) return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h2m3 0h2m3 0h1M7 18h2m3 0h2"/></svg>;
  if (index === 1) return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m3 11 9-7 9 7v9H3v-9Z"/><path d="M9 20v-6h6v6"/></svg>;
  if (index === 2) return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
  if (index === 3) return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="8" r="3"/><circle cx="5" cy="10" r="2"/><circle cx="19" cy="10" r="2"/><path d="M7 21v-2a5 5 0 0 1 10 0v2M1.5 20v-1a4 4 0 0 1 5-4m16 5v-1a4 4 0 0 0-5-4"/></svg>;
  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 15 3-3 3 2 4-5m0 0h-3m3 0v3"/></svg>;
}

export function Company({ services }: { services: ContentEntry[] }) {
  return <>
    <section id="about" className="relative overflow-hidden bg-white px-5 pb-8 pt-16 text-[#09a7a5] sm:px-8 lg:pt-20">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[40%] lg:block" aria-hidden="true">
        <Image src="/images/about.jpg" alt="" fill sizes="40vw" className="object-cover opacity-[.1] [mask-image:linear-gradient(to_right,transparent,black)]"/>
      </div>
      <div className="relative z-10 mx-auto max-w-[1248px] text-center">
        <p className="mb-2 text-[16px] font-bold">Công ty cổ phần đầu tư xây dựng Ricons</p>
        <h2 className="mx-auto max-w-[900px] text-3xl font-bold leading-tight sm:text-4xl">Nhà thầu xây dựng uy tín hàng đầu Việt Nam</h2>
        <p className="mx-auto mt-5 max-w-[820px] text-[18px] leading-7">Trên cơ sở nội lực vững vàng, tầm nhìn của Ricons là trở thành biểu tượng của ngành xây dựng Việt Nam, từng bước vươn tầm Quốc tế.</p>

        <dl className="mt-9 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-7">
          {companyStats.map((stat, index) => <div key={stat.label} className="flex min-w-0 items-start justify-center gap-3 text-left">
            <span className="mt-1"><StatIcon index={index}/></span>
            <div><dd className="text-4xl font-bold leading-none">{stat.value}</dd><dt className="mt-2 text-[15px] leading-5">{stat.label}</dt></div>
          </div>)}
        </dl>

        <Link href={ROUTES.about} className="button-secondary mt-8 min-w-[164px]">Xem chi tiết</Link>
      </div>
    </section>

    <section id="services" className="relative overflow-hidden bg-white px-5 pb-16 pt-2 text-[#063f46] sm:px-8 lg:pb-20 lg:pt-2">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[40%] lg:block" aria-hidden="true">
        <Image src="/images/about.jpg" alt="" fill sizes="40vw" className="object-cover opacity-[.12] [mask-image:linear-gradient(to_right,transparent,black)]"/>
      </div>
      <div className="relative z-10 mx-auto max-w-[1168px]">
        <div className="relative">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {services.slice(0, 4).map((item) => <article className="group relative aspect-square overflow-hidden bg-[#09a7a5]" key={item.slug}>
              <Link className="absolute inset-0 z-20 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white" href={ROUTES.serviceDetail(item.slug)} aria-label={`Xem ${item.title}`} />
              <Image src={item.image} alt="" fill sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 45vw, 277px" className="object-cover transition-transform group-hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-[#09a7a5]/65 transition-colors group-hover:bg-[#09a7a5]/78" />
              <div className="pointer-events-none absolute inset-5 border-2 border-white/65 transition-colors group-hover:border-white" />
              <div className="absolute inset-8 flex items-center justify-center text-center text-white"><h3 className="text-[20px] font-bold leading-snug">{item.title}</h3></div>
            </article>)}
          </div>
          <button type="button" className="absolute -left-12 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center text-4xl text-[#09a7a5] lg:flex" aria-label="Dịch vụ trước">‹</button>
          <button type="button" className="absolute -right-12 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center text-4xl text-[#09a7a5] lg:flex" aria-label="Dịch vụ tiếp theo">›</button>
        </div>

        <div className="mt-5 flex justify-center gap-4" aria-hidden="true"><span className="size-1.5 rounded-full bg-[#c8c8c8]"/><span className="size-1.5 rounded-full bg-[#c8c8c8]"/><span className="size-1.5 rounded-full bg-[#09a7a5]"/><span className="size-1.5 rounded-full bg-[#c8c8c8]"/><span className="size-1.5 rounded-full bg-[#c8c8c8]"/></div>
      </div>
    </section>
  </>;
}
