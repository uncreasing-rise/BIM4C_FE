import Link from "next/link";
import type { ReactNode } from "react";

export function HomepageSectionHeader({
  title,
  action,
  href,
  children,
}: {
  title: string;
  action?: string;
  href?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 pb-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="tech-spec mb-1.5 text-[10px] font-bold text-[#09a7a5]">
            BIM4C ENTERPRISE
          </p>
          <h2 className="m-0 text-[28px] font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>
        </div>
        {action && href && (
          <Link
            href={href}
            className="btn-enterprise-outline !h-9 !px-4 !text-xs"
          >
            {action}
            <span className="ml-1">→</span>
          </Link>
        )}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}