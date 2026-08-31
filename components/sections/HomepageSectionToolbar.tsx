import Link from "next/link";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

type HomepageSectionToolbarProps = {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
  ariaLabel: string;
  ctaHref: string;
  ctaLabel: string;
};

function sentenceCase(value: string) {
  const normalized = value.trim().toLocaleLowerCase("vi-VN");
  return normalized ? normalized[0].toLocaleUpperCase("vi-VN") + normalized.slice(1) : normalized;
}

export function HomepageSectionToolbar({ categories, selected, onSelect, ariaLabel, ctaHref, ctaLabel }: HomepageSectionToolbarProps) {
  return <div className="grid w-full items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
    <span className="hidden md:block" aria-hidden="true" />
    <nav className="flex max-w-full flex-wrap items-center justify-center gap-x-6 gap-y-1" aria-label={ariaLabel}>
      {categories.map((item) => <button
        type="button"
        className={`min-h-10 border-b-2 px-1 text-[14px] font-semibold leading-none transition-colors ${selected === item ? "border-[#09a7a5] text-[#063f46]" : "border-transparent text-[#667775] hover:text-[#09a7a5]"}`}
        aria-pressed={selected === item}
        onClick={() => onSelect(item)}
        key={item}
      >{sentenceCase(item)}</button>)}
    </nav>
    <Link href={ctaHref} className="button-secondary group min-w-[184px] shrink-0 justify-self-center md:justify-self-end">
      {ctaLabel}<ArrowIcon className="size-5 transition-transform group-hover:translate-x-1" />
    </Link>
  </div>;
}
