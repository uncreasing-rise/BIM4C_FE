import Image from "next/image";
import Link from "next/link";
import styles from "./PageHero.module.css";

export function PageHero({ eyebrow, title, description, image }: { eyebrow: string; title: string; description: string; image: string }) {
  return <section className={`inner-banner ${styles.hero}`}>
    <Image className={styles.image} src={image} alt="" fill preload sizes="100vw"/>
    <div className={styles.overlay}/>
    <div className={`page-shell ${styles.inner}`}>
      <div className={styles.content}><nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><strong>{eyebrow}</strong></nav><h1>{title}</h1><p className={styles.description}>{description}</p></div>
    </div>
  </section>;
}
