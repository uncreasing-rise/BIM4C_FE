"use client";

import { Award, Clock, ShieldCheck } from "lucide-react";
import { usePageContent } from "@/features/page-content/context";

/** NDA / consultation / expert promises from the `detail` block; rows without copy are skipped. */
export function TrustSignals() {
  const signals = usePageContent("detail")?.trustSignals;
  const rows = [
    { icon: ShieldCheck, title: signals?.ndaTitle, desc: signals?.ndaDesc },
    { icon: Clock, title: signals?.slaTitle, desc: signals?.slaDesc },
    { icon: Award, title: signals?.expertTitle, desc: signals?.expertDesc },
  ].filter((row) => row.title || row.desc);
  if (!rows.length) return null;

  return (
    <div className="mt-6 pt-5 border-t border-white/15 space-y-3 bg-teal-500/[0.04] p-4 rounded-xl border border-teal-500/20">
      {rows.map(({ icon: Icon, title, desc }) => (
        <div key={title ?? desc} className="flex items-start gap-2.5 text-xs text-slate-200">
          <Icon className="size-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            {title && <strong className="font-bold text-teal-300">{title}: </strong>}
            {desc && <span className="text-slate-200">{desc}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
