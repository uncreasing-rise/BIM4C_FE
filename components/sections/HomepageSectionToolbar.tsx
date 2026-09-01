"use client";

import Link from "next/link";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

type Props = {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
  ariaLabel: string;
  ctaHref: string;
  ctaLabel: string;
};

function sentenceCase(value: string) {
  const normalized = value.trim().toLocaleLowerCase("vi-VN");
  return normalized
    ? normalized[0].toLocaleUpperCase("vi-VN") + normalized.slice(1)
    : normalized;
}

export function HomepageSectionToolbar({
  categories,
  selected,
  onSelect,
  ariaLabel,
  ctaHref,
  ctaLabel,
}: Props) {
  return (
    <div className="flex w-full flex-col items-start justify-between gap-5 md:flex-row md:items-center">
      <div
        className="flex max-w-full gap-7 overflow-x-auto pb-1"
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={selected === item}
            onClick={() => onSelect(item)}
            className={`min-h-9 flex-none border-b-2 px-0 text-sm font-semibold transition-colors ${
              selected === item
                ? "border-[#09a7a5] text-[#09a7a5]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {sentenceCase(item)}
          </button>
        ))}
      </div>

      <Link
        href={ctaHref}
        className="btn-enterprise-outline group !h-9 !shrink-0 !px-4 !text-xs"
      >
        {ctaLabel}
        <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
