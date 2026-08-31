import Image from "next/image";
import Link from "next/link";

export function PageHero({ eyebrow, title, description, image }: { eyebrow: string; title: string; description: string; image: string }) {
  const naturalEyebrow = eyebrow === eyebrow.toLocaleUpperCase("vi-VN")
    ? eyebrow.toLocaleLowerCase("vi-VN").replace(/^./u, character => character.toLocaleUpperCase("vi-VN")).replace(/\bbim4c\b/giu, "BIM4C").replace(/\bbim\b/giu, "BIM")
    : eyebrow;
  return <section className="page-hero"><Image className="page-hero-image" src={image} alt="" fill priority sizes="100vw" /><div className="page-hero-scrim"/><div className="page-hero-content"><nav aria-label="Breadcrumb"><Link href={"/"}>Trang chủ</Link><span>/</span><strong>{naturalEyebrow}</strong></nav><h1>{title}</h1><p>{description}</p></div></section>;
}
