import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { ROUTES } from "@/constants/routes";
import { getServices } from "@/features/services/api/queries";

export const metadata: Metadata = {
  title: "Dịch vụ | BIM4C",
  description: "Các dịch vụ tư vấn BIM, thiết kế, đào tạo và giám sát của BIM4C.",
};

const process = [
  { number: "01", title: "Thấu hiểu", text: "Phân tích mục tiêu, hiện trạng và những thách thức cốt lõi của dự án." },
  { number: "02", title: "Thiết kế giải pháp", text: "Xây dựng phạm vi, quy trình và tiêu chuẩn triển khai có thể đo lường." },
  { number: "03", title: "Đồng hành triển khai", text: "Phối hợp cùng đội ngũ dự án, kiểm soát chất lượng và xử lý thay đổi." },
  { number: "04", title: "Đo lường cải tiến", text: "Đánh giá kết quả, chuẩn hóa bài học và tối ưu cho giai đoạn tiếp theo." },
];

export default async function ServicesPage() {
  const services = await getServices();
  return <main className="services-page">
    <PageHero eyebrow="NĂNG LỰC CHUYÊN MÔN" title="Giải pháp tạo nên khác biệt" description="Kết nối con người, quy trình và công nghệ để giải quyết những thách thức phức tạp của ngành xây dựng." image="/images/service-design.jpg"/>

    <section className="service-page-intro">
      <div className="page-shell">
        <div><p className="eyebrow">HỆ SINH THÁI DỊCH VỤ</p><h2>Một đối tác xuyên suốt<br/>vòng đời dự án</h2></div>
        <div className="service-intro-copy">
          <p>Từ chiến lược BIM, thiết kế phối hợp đến đào tạo và kiểm soát hiện trường, BIM4C xây dựng giải pháp phù hợp với đúng nhu cầu của từng tổ chức và dự án.</p>
          <nav aria-label="Danh mục dịch vụ">{services.map((service, index) => <a href={`#${service.slug}`} key={service.slug}><span>{String(index + 1).padStart(2, "0")}</span>{service.title}</a>)}</nav>
        </div>
      </div>
    </section>

    <section className="service-catalog" aria-label="Các dịch vụ của BIM4C">
      <div className="page-shell service-card-grid">{services.map((service, index) => <article className="service-feature service-card" id={service.slug} key={service.slug}>
        <div className="service-card-media"><Image src={service.image} alt={service.title} fill sizes="(max-width: 767px) 100vw, 50vw"/><span>{String(index + 1).padStart(2, "0")}</span></div>
        <div className="service-card-body"><p className="eyebrow">{service.eyebrow}</p><h2>{service.title}</h2><p>{service.description}</p><ul>{service.highlights.map(item => <li key={item}>{item}</li>)}</ul><Link href={ROUTES.serviceDetail(service.slug)}>Khám phá dịch vụ <span>→</span></Link></div>
      </article>)}</div>
    </section>

    <section className="service-process"><div className="page-shell">
      <header><p className="eyebrow">CÁCH CHÚNG TÔI LÀM VIỆC</p><h2>Một quy trình.<br/>Một mục tiêu chung.</h2><p>Mỗi giải pháp đều bắt đầu từ bài toán thực tế và kết thúc bằng kết quả có thể đo lường.</p></header>
      <div className="process-grid">{process.map(item => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </div></section>

  </main>;
}
