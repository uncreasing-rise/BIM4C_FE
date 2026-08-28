import Link from "next/link";

export function HomepageSectionHeader({ title, action, href }: { title: string; action?: string; href?: string }) {
  return <header className="mb-8 flex flex-col items-start justify-between gap-5 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
    <h2 className="m-0 flex items-center gap-4 text-3xl font-bold tracking-wide text-[#09a7a5]">
      <svg className="size-9 shrink-0 text-[#09a7a5]" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path d="M18 3.5 32 11v14L18 32.5 4 25V11L18 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="m4.5 11.25 13.5 7.5 13.5-7.5M18 18.75v13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="m11 7.25 14 7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity=".45"/>
      </svg>
      {title}
    </h2>
    {action && href ? <Link href={href} className="group inline-flex min-h-12 min-w-[220px] items-center justify-center gap-3 bg-[#09a7a5] px-5 py-3 text-[16px] font-bold text-white shadow-sm transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#087f7d] hover:shadow-lg active:translate-y-0">{action}<span className="text-xl leading-none transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></Link> : null}
  </header>;
}
