import Image from "next/image";
import Link from "next/link";

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
    <section className={`page-hero ${isAbout ? "page-hero-about" : ""}`}>
      <Image
        className="page-hero-image"
        src={image}
        alt=""
        fill
        priority
        sizes={isAbout ? "(max-width: 767px) 100vw, 44vw" : "100vw"}
      />
      <div className="page-hero-scrim" />
      <div className="page-hero-content">
        <nav aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <strong>{naturalEyebrow}</strong>
        </nav>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
