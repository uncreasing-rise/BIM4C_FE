"use client";

import type { ReactNode } from "react";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";

interface TableOfContentsProps {
  blocks: ContentBlock[];
  cta?: {
    label: string;
    href: string;
  };
  minHeadings?: number;
  className?: string;
}

export function TableOfContents({
  blocks,
  cta,
  minHeadings = 2,
  className = "",
}: TableOfContentsProps) {
  const { t } = useLanguage();

  const headings = blocks.filter(
    (block) => block.type === "rich-text" && Boolean(block.heading?.trim()),
  );

  if (headings.length < minHeadings) {
    return null;
  }

  return (
    <div
      className={`mb-8 sm:mb-10 rounded-2xl border border-border bg-card/60 backdrop-blur-xs p-5 sm:p-6 shadow-xs ${className}`}
      data-motion="reveal"
    >
      <nav aria-label={t.detailPage.onThisPage}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t.detailPage.onThisPage}
            </p>
          </div>
          {cta && (
            <Button asChild size="sm" variant="outline" className="rounded-lg text-xs font-semibold h-8 shrink-0">
              <a href={cta.href}>
                {cta.label} <ArrowUpRight className="size-3.5 ml-1" />
              </a>
            </Button>
          )}
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2">
          {headings.map((block, idx) => {
            const anchorId = block.id ? block.id.replace(/^block-/, "") : "";
            const headingText = block.type === "rich-text" ? block.heading : "";
            return (
              <li key={block.id}>
                <a
                  className="group flex items-start gap-2.5 py-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  href={`#${anchorId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!anchorId) return;
                    const el = document.getElementById(anchorId);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                      history.pushState(null, "", `#${anchorId}`);
                    }
                  }}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors mt-0.5" aria-hidden="true">
                    {idx + 1}
                  </span>
                  <span className="underline-offset-4 group-hover:underline leading-snug">
                    {headingText}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
