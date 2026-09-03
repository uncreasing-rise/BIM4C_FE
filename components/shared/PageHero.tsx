import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  variant?: "default" | "about";
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  variant = "default",
}: PageHeroProps) {
  const isAbout = variant === "about" || image === "/images/about.jpg";
  const naturalEyebrow =
    eyebrow === eyebrow.toLocaleUpperCase("vi-VN")
      ? eyebrow
          .toLocaleLowerCase("vi-VN")
          .replace(/^./u, (character) => character.toLocaleUpperCase("vi-VN"))
          .replace(/\bbim4c\b/giu, "BIM4C")
          .replace(/\bbim\b/giu, "BIM")
      : eyebrow;
  return (
    <section
      className={cn(
        "relative isolate flex min-h-svh items-end overflow-hidden bg-[#111827] text-white",
      )}
    >
      <Image
        className="-z-20 object-cover opacity-50"
        data-motion="parallax"
        src={image}
        alt=""
        fill
        priority
        sizes={isAbout ? "(max-width: 767px) 100vw, 44vw" : "100vw"}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,18,32,.98)_0%,rgba(10,18,32,.72)_52%,rgba(10,18,32,.2)_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="site-container py-16 md:py-24" data-motion="hero">
        <nav
          className="mb-5 flex gap-2 text-xs text-zinc-400"
          aria-label="Breadcrumb"
        >
          <Link className="text-primary hover:underline" href="/">
            Trang chủ
          </Link>
          <span>/</span>
          <strong className="font-medium text-zinc-300">
            {naturalEyebrow}
          </strong>
        </nav>
        <h1 className="max-w-5xl text-balance text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-8xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl border-l border-primary pl-5 text-base leading-7 text-zinc-300 md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
