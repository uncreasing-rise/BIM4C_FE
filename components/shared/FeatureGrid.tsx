import Image from "next/image";
import Link from "next/link";

export interface FeatureItem { title: string; description: string; image: string; meta?: string; href?: string }

export function FeatureGrid({ items, columns = 3 }: { items: FeatureItem[]; columns?: 2 | 3 }) {
  return <div className={`feature-grid columns-${columns}`}>{items.map((item) => <article className="feature-card" key={item.title}>{item.href && <Link className="card-link" href={item.href} aria-label={`Xem ${item.title}`}/>}<div className="feature-image"><Image src={item.image} alt={item.title} fill sizes={columns === 2 ? "(max-width: 767px) 100vw, 50vw" : "(max-width: 767px) 100vw, 33vw"}/></div><div className="feature-content">{item.meta && <p className="eyebrow">{item.meta}</p>}<h2>{item.title}</h2><p>{item.description}</p><span aria-hidden="true">→</span></div></article>)}</div>;
}
