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
  return <main>
    <PageHero eyebrow="NĂNG LỰC CHUYÊN MÔN" title="Giải pháp tạo nên khác biệt" description="Kết nối con người, quy trình và công nghệ để giải quyết những thách thức phức tạp của ngành xây dựng." image="/images/service-design.jpg"/>

    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1440px] gap-10 md:w-[calc(100%_-_48px)] lg:w-[calc(100%_-_80px)] lg:grid-cols-2 lg:gap-20">
        <div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#087f7d]">HỆ SINH THÁI DỊCH VỤ</p><h2 className="text-page-title font-semibold leading-tight text-[#063f46]">Một đối tác xuyên suốt<br/>vòng đời dự án</h2></div>
        <div className="text-[#667775] [&>p]:mb-7 [&>p]:leading-relaxed">
          <p>Từ chiến lược BIM, thiết kế phối hợp đến đào tạo và kiểm soát hiện trường, BIM4C xây dựng giải pháp phù hợp với đúng nhu cầu của từng tổ chức và dự án.</p>
          <nav className="border-t border-[#dbe7e5]" aria-label="Danh mục dịch vụ">{services.map((service, index) => <a className="flex gap-4 border-b border-[#dbe7e5] py-4 font-semibold text-[#063f46] hover:text-[#087f7d]" href={`#${service.slug}`} key={service.slug}><span className="text-xs text-[#09a7a5]">{String(index + 1).padStart(2, "0")}</span>{service.title}</a>)}</nav>
        </div>
      </div>
    </section>

    <section className="bg-[#f5fafa] py-16 lg:py-24" aria-label="Các dịch vụ của BIM4C">
      <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1440px] grid-cols-1 gap-6 md:w-[calc(100%_-_48px)] md:grid-cols-2 lg:w-[calc(100%_-_80px)]">{services.map((service, index) => <article className="group overflow-hidden bg-white" id={service.slug} key={service.slug}>
        <div className="relative aspect-[16/10] overflow-hidden"><Image className="object-cover transition-transform duration-500 group-hover:scale-105" src={service.image} alt={service.title} fill sizes="(max-width: 767px) 100vw, 50vw"/><span className="absolute left-5 top-5 grid size-11 place-items-center bg-[#063f46] text-xs font-semibold text-white">{String(index + 1).padStart(2, "0")}</span></div>
        <div className="p-6 lg:p-9"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#087f7d]">{service.eyebrow}</p><h2 className="text-subtitle font-semibold text-[#063f46]">{service.title}</h2><p className="mt-4 leading-relaxed text-[#667775]">{service.description}</p><ul className="my-6 border-t border-[#dbe7e5]">{service.highlights.map(item => <li className="border-b border-[#dbe7e5] py-3 text-sm text-[#667775]" key={item}>{item}</li>)}</ul><Link className="text-xs font-semibold uppercase text-[#087f7d]" href={ROUTES.serviceDetail(service.slug)}>Khám phá dịch vụ <span>→</span></Link></div>
      </article>)}</div>
    </section>

    <section className="bg-[#063f46] py-16 text-white lg:py-24"><div className="mx-auto w-[calc(100%_-_32px)] max-w-[1440px] md:w-[calc(100%_-_48px)] lg:w-[calc(100%_-_80px)]">
      <header className="mb-10 grid gap-5 md:grid-cols-2"><div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#ffffff]">CÁCH CHÚNG TÔI LÀM VIỆC</p><h2 className="text-page-title font-semibold leading-tight">Một quy trình.<br/>Một mục tiêu chung.</h2></div><p className="max-w-xl self-end text-white/70">Mỗi giải pháp đều bắt đầu từ bài toán thực tế và kết thúc bằng kết quả có thể đo lường.</p></header>
      <div className="grid grid-cols-1 border-l border-t border-white/20 md:grid-cols-2 xl:grid-cols-4">{process.map(item => <article className="min-h-64 border-b border-r border-white/20 p-7" key={item.number}><span className="text-xs font-semibold text-[#ffffff]">{item.number}</span><h3 className="mb-3 mt-12 text-xl font-semibold">{item.title}</h3><p className="text-sm leading-relaxed text-white/65">{item.text}</p></article>)}</div>
    </div></section>

  </main>;
}
