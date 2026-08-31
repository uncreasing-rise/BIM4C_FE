import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { ContentEntry } from "@/types/content";
import styles from "./Company.module.css";

export function Company({ services }: { services: ContentEntry[] }) {
  return <>
    <section className={styles.about} id="about">
      <header className={styles.sectionCopy}>
        <p className={styles.kicker}>Về BIM4C</p>
        <h2>Công nghệ tạo nên công trình tốt hơn.</h2>
        <p className={styles.lead}>Con người, quy trình và dữ liệu được kết nối trong một hệ thống BIM xuyên suốt.</p>
        <div className={styles.actions}><Link className={styles.primaryAction} href={ROUTES.about}>Tìm hiểu thêm</Link><Link className={styles.darkLink} href={ROUTES.projects}>Xem dự án <span>›</span></Link></div>
      </header>
      <Link className={styles.aboutImage} href={ROUTES.about} aria-label="Tìm hiểu câu chuyện BIM4C"><Image src="/images/news-project-coordination.webp" alt="" fill sizes="(max-width: 833px) 100vw, 1180px" className="object-cover" /></Link>
    </section>

    <section className={styles.services} id="services">
      <header className={styles.sectionCopy}>
        <p className={styles.kicker}>Năng lực BIM4C</p>
        <h2>Năng lực cho mọi giai đoạn.</h2>
        <p className={styles.lead}>Từ chiến lược đến hiện trường, trong một quy trình BIM liền mạch.</p>
      </header>
      <div className={styles.serviceGrid}>{services.map((item) => <article className={styles.whiteCard} key={item.slug}>
        <Link className={styles.serviceImage} href={ROUTES.serviceDetail(item.slug)} aria-label={`Xem dịch vụ ${item.title}`}><Image src={item.image} alt="" fill sizes="(max-width: 833px) 100vw, 50vw" className="object-cover" /></Link>
        <div className={styles.cardCopy}><h3>{item.title}</h3><p>{item.description}</p><Link className={styles.lightLink} href={ROUTES.serviceDetail(item.slug)}>Tìm hiểu thêm <span>›</span></Link></div>
      </article>)}</div><div className={styles.allServices}><Link className={styles.lightLink} href={ROUTES.services}>Xem tất cả dịch vụ <span>›</span></Link></div>
    </section>
  </>;
}
