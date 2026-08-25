import Image from "next/image";
import Link from "next/link";

export function PageHero({ eyebrow, title, description, image }: { eyebrow: string; title: string; description: string; image: string }) {
  return <section className="page-hero"><Image src={image} alt="" fill preload sizes="100vw"/><div className="page-hero-overlay"/><div className="page-shell page-hero-copy"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><strong>{eyebrow}</strong></nav><h1>{title}</h1><p>{description}</p></div></section>;
}
