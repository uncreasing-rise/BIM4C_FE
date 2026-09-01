import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { getServices } from "@/features/services/api/queries";
import styles from "./ServicesPage.module.css";
import { PageHero } from "@/components/shared/PageHero";

export const metadata: Metadata = { title: "Dịch vụ | BIM4C", description: "Các dịch vụ tư vấn BIM, thiết kế, đào tạo và giám sát của BIM4C." };

export default async function ServicesPage() {
  const services = await getServices();
  return <main className={styles.page}>
    <PageHero eyebrow="BIM4C" title="Dịch vụ" description="Giải pháp BIM phù hợp cho từng mục tiêu, quy mô và giai đoạn dự án." image="/images/service-design.jpg" />
    <section className={styles.services}><header className={styles.indexHeading}><p className={styles.kicker}>Danh mục dịch vụ</p><h2>Giải pháp cho từng giai đoạn dự án</h2></header><div className={styles.serviceIndex}>{services.map((service,index)=><Link className={styles.indexRow} href={ROUTES.serviceDetail(service.slug)} key={service.slug}><span className={styles.indexNumber}>{String(index+1).padStart(2,"0")}</span><h3>{service.title}</h3><p>{service.description}</p><ul>{service.highlights.slice(0,3).map(item=><li key={item}>{item}</li>)}</ul><span className={styles.indexArrow}>↗</span></Link>)}</div></section>
    <section className={styles.cta}><p className={styles.kicker}>Bắt đầu cùng BIM4C</p><h2>Biến thách thức dự án thành lợi thế</h2><p>Chia sẻ mục tiêu của bạn để đội ngũ BIM4C đề xuất lộ trình triển khai phù hợp.</p><Link href={ROUTES.contact}>Liên hệ tư vấn</Link></section>
  </main>;
}
