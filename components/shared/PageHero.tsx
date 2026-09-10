import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toEnglishLabel } from "@/lib/utils/public-labels";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  variant?: "default" | "about";
  breadcrumbs?: { label: string; href?: string }[];
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  variant = "default",
  breadcrumbs,
}: PageHeroProps) {
  const isAbout = variant === "about";
  const naturalEyebrow = toEnglishLabel(
    eyebrow === eyebrow.toLocaleUpperCase("vi-VN")
      ? eyebrow
          .toLocaleLowerCase("vi-VN")
          .replace(/^./u, (character) => character.toLocaleUpperCase("vi-VN"))
          .replace(/\bbim4c\b/giu, "BIM4C")
          .replace(/\bbim\b/giu, "BIM")
      : eyebrow,
  );
  return (
    <section
      className={cn(
        "page-hero technical-grid relative isolate flex items-center overflow-hidden bg-brand-ink text-white",
      )}
    >
      <Image
        className={cn(
          "-z-20 object-cover opacity-55",
          isAbout ? "object-center" : "object-right",
        )}
        data-motion="parallax"
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,24,31,.98)_0%,rgba(4,24,31,.82)_48%,rgba(4,24,31,.15)_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="site-container min-w-0 py-8 md:py-10" data-motion="hero">
        <nav
          className="mb-5 flex min-w-0 gap-2 text-xs text-zinc-300"
          aria-label="Breadcrumb"
        >
          {(
            breadcrumbs ?? [
              { label: "Home", href: "/" },
              { label: naturalEyebrow },
            ]
          ).map((item, index, items) => (
            <span className="contents" key={`${item.label}-${index}`}>
              {index > 0 && <span aria-hidden>/</span>}
              {item.href ? (
                <Link
                  className="shrink-0 text-teal-200 hover:underline"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <strong
                  className="truncate font-medium text-zinc-300"
                  aria-current={index === items.length - 1 ? "page" : undefined}
                >
                  {item.label}
                </strong>
              )}
            </span>
          ))}
        </nav>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[.16em] text-teal-300">
          {naturalEyebrow}
        </p>
        <h1 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-.045em] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl break-words border-l border-primary pl-4 text-sm leading-6 text-zinc-300 md:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}
