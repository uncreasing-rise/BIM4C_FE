import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import { HomepageSectionHeader } from "./HomepageSectionHeader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function News({ posts }: { posts: ContentEntry[] }) {
  const [featured, ...secondary] = posts.slice(0, 3);

  return <section className="relative flex min-h-[calc(100svh-68px)] w-full items-center overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f5fafa_100%)] py-16 shadow-[inset_0_1px_0_rgb(6_63_70_/_7%)] lg:min-h-[calc(100svh-84px)] lg:py-24" id="news">
    <div className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rotate-45 border border-[#09a7a5]/15" aria-hidden="true" />
    <div className="pointer-events-none absolute right-0 top-0 h-72 w-[30%] [clip-path:polygon(34%_0,100%_0,100%_100%,0_100%)] bg-[#eaf8f7]/75" aria-hidden="true" />
    <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-1/3 -skew-x-[24deg] bg-[#eaf8f7]/85" aria-hidden="true" />
    <div className="pointer-events-none absolute bottom-20 left-[8%] h-px w-52 -rotate-[17deg] bg-[#09a7a5]/35" aria-hidden="true" />
    <div className="pointer-events-none absolute right-[22%] top-16 h-20 w-20 rotate-45 border border-[#09a7a5]/15" aria-hidden="true" />
    <div className="relative z-10 mx-auto w-[calc(100%_-_32px)] max-w-[1400px] md:w-[calc(100%_-_64px)]">
      <HomepageSectionHeader title="TIN TỨC" action="XEM TẤT CẢ TIN TỨC" href={ROUTES.blog}/>
      {featured ? <div className="grid gap-6 lg:grid-cols-[minmax(0,1.22fr)_minmax(360px,.78fr)] lg:gap-10">
        <ScrollReveal className="h-full">
          <article className="group relative min-h-[420px] overflow-hidden bg-[#063f46] md:min-h-[520px] lg:h-full">
            <Link className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white" href={ROUTES.blogDetail(featured.slug)} aria-label={`Xem ${featured.title}`}/>
            <Image className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" src={featured.image} alt="" fill sizes="(max-width:1023px) 100vw, 65vw"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#063f46] via-[#063f46]/25 to-transparent"/>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-9">
              <div className="mb-4 flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[.08em] text-white/70"><span className="h-px w-9 bg-[#09a7a5]"/><time>{featured.meta}</time></div>
              <h3 className="max-w-[760px] text-2xl font-semibold leading-[1.3] md:text-[32px]">{featured.title}</h3>
              <span className="mt-6 inline-flex items-center gap-3 text-[16px] font-semibold">XEM THÊM <b className="text-xl transition-transform duration-300 group-hover:translate-x-1">→</b></span>
            </div>
          </article>
        </ScrollReveal>
        <div className="grid content-stretch divide-y divide-[#dbe7e5] border-y border-[#dbe7e5] bg-white">
          {secondary.slice(0, 4).map((article, index) => <ScrollReveal className="h-full" delay={(index + 1) * 100} key={article.slug}>
            <article className="group relative flex h-full min-h-[112px] items-center justify-between gap-5 px-5 py-5 transition-colors hover:bg-[#eaf8f7] lg:min-h-0 lg:px-6">
              <Link className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#09a7a5]" href={ROUTES.blogDetail(article.slug)} aria-label={`Xem ${article.title}`}/>
              <div><time className="mb-2 block text-[13px] font-semibold uppercase tracking-[.08em] text-[#087f7d]">{article.meta}</time><h3 className="max-w-[420px] text-[18px] font-semibold leading-[1.4] text-[#063f46] transition-colors group-hover:text-[#087f7d]">{article.title}</h3></div>
              <span className="relative z-20 shrink-0 text-xl text-[#09a7a5] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
            </article>
          </ScrollReveal>)}
        </div>
      </div> : null}
    </div>
  </section>;
}
