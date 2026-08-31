import Link from "next/link";
import type { ReactNode } from "react";

export function HomepageSectionHeader({ title, action, href, children }: { title: string; action?: string; href?: string; children?: ReactNode }) {
  return <header className="mb-6 border-b border-slate-200 pb-4">
    <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
      <span className="hidden sm:block" aria-hidden="true" />
      <h2 className="m-0 flex items-center justify-center gap-4 text-center text-3xl font-bold tracking-wide text-[#09a7a5]">
      <svg className="size-9 shrink-0 text-[#09a7a5]" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path d="M18 3.5 32 11v14L18 32.5 4 25V11L18 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="m4.5 11.25 13.5 7.5 13.5-7.5M18 18.75v13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="m11 7.25 14 7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity=".45"/>
      </svg>
      {title}
      </h2>
      <div className="flex justify-center sm:justify-end">{action && href ? <Link href={href} className="button-primary group min-w-[184px]">{action}<span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></Link> : null}</div>
    </div>
    {children ? <div className="mt-5 flex justify-center">{children}</div> : null}
  </header>;
}
