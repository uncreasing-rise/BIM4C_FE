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
  ["Thấu hiểu", "Phân tích mục tiêu, hiện trạng và những thách thức cốt lõi của dự án."],
  ["Thiết kế giải pháp", "Xác định phạm vi, quy trình và tiêu chuẩn triển khai có thể đo lường."],
  ["Đồng hành triển khai", "Phối hợp cùng đội ngũ dự án, kiểm soát chất lượng và xử lý thay đổi."],
  ["Đo lường cải tiến", "Đánh giá kết quả, chuẩn hóa bài học và tối ưu cho giai đoạn tiếp theo."],
] as const;

export default async function ServicesPage() {
  const services = await getServices();

  return <main>
    <PageHero eyebrow="NĂNG LỰC CHUYÊN MÔN" title="Giải pháp tạo nên khác biệt" description="Kết nối con người, quy trình và công nghệ để giải quyết những thách thức phức tạp của ngành xây dựng." image="/images/service-design.jpg" />

    <section className="relative overflow-hidden bg-white py-12 lg:py-16">
      <div className="pointer-events-none absolute -left-24 bottom-0 h-24 w-[42%] -skew-x-[24deg] bg-[#eaf8f7]" aria-hidden="true" />
      <div className="relative mx-auto grid w-[calc(100%_-_32px)] max-w-[1400px] gap-9 md:w-[calc(100%_-_64px)] lg:grid-cols-[.85fr_1.15fr] lg:items-start lg:gap-24">
        <div><p className="mb-4 text-xs font-semibold text-[#09a7a5]">Năng lực BIM4C</p><h1 className="text-4xl font-semibold leading-[1.1] text-[#09a7a5]">Một đối tác xuyên suốt vòng đời dự án.</h1></div>
        <div><p className="max-w-[720px] leading-7 text-[#667775]">Từ chiến lược BIM, thiết kế phối hợp đến đào tạo và kiểm soát hiện trường, mỗi dịch vụ được cấu hình theo đúng mục tiêu và mức độ sẵn sàng của đội ngũ dự án.</p><nav className="mt-7 border-t border-[#dbe7e5]" aria-label="Danh mục dịch vụ">{services.map((service) => <a className="flex items-center justify-between border-b border-[#dbe7e5] py-4 font-semibold text-[#163b3a] hover:text-[#09a7a5]" href={`#${service.slug}`} key={service.slug}>{service.title}<span className="text-[#09a7a5]">↓</span></a>)}</nav></div>
      </div>
    </section>

    <section className="bg-[#f5fafa] py-12 lg:py-16" aria-label="Các dịch vụ của BIM4C">
      <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1400px] md:w-[calc(100%_-_64px)]">
        <div className="border-t border-[#09a7a5]">
          {services.map((service, index) => <article className="group relative grid scroll-mt-24 border-b border-[#dbe7e5] py-8 lg:grid-cols-[minmax(360px,.82fr)_minmax(0,1.18fr)] lg:py-12" id={service.slug} key={service.slug}>
            <div className={`relative min-h-[300px] overflow-hidden lg:min-h-[420px] ${index % 2 ? "lg:order-2" : ""}`}><Image className="object-cover transition-transform group-hover:scale-[1.02]" src={service.image} alt={service.title} fill sizes="(max-width: 1023px) 100vw, 44vw" /><span className="absolute inset-0 bg-gradient-to-t from-[#063f46]/30 to-transparent" /></div>
            <div className={`flex flex-col justify-center bg-white p-6 md:p-10 lg:p-14 ${index % 2 ? "lg:order-1 lg:mr-[-1px]" : "lg:ml-[-1px]"}`}>
              <p className="mb-4 text-xs font-semibold text-[#09a7a5]">{service.eyebrow}</p>
              <h2 className="text-2xl font-bold leading-[1.25] text-[#09a7a5]">{service.title}</h2>
              <p className="mt-5 max-w-[680px] leading-7 text-[#667775]">{service.description}</p>
              {service.highlights.length > 0 && <ul className="mt-7 border-t border-[#dbe7e5]">{service.highlights.map((item) => <li className="flex items-start gap-3 border-b border-[#dbe7e5] py-3 text-[#163b3a] before:text-[#09a7a5] before:content-['—']" key={item}>{item}</li>)}</ul>}
              <Link className="relative z-20 mt-7 w-fit border-b border-[#09a7a5] pb-1 font-semibold text-[#09a7a5]" href={ROUTES.serviceDetail(service.slug)}>Khám phá dịch vụ →</Link>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-[#063f46] py-12 text-white lg:py-16">
      <div className="pointer-events-none absolute -right-28 top-0 h-full w-[38%] -skew-x-[20deg] bg-[#09a7a5]/15" aria-hidden="true" />
      <div className="relative mx-auto grid w-[calc(100%_-_32px)] max-w-[1400px] gap-10 md:w-[calc(100%_-_64px)] lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
        <div><p className="mb-4 text-xs font-semibold text-[#09a7a5]">Cách chúng tôi làm việc</p><h2 className="text-4xl font-semibold leading-[1.1]">Từ bài toán đến kết quả.</h2><p className="mt-5 max-w-sm leading-7 text-white/65">Một quy trình đủ chặt chẽ để kiểm soát, đủ linh hoạt để thích ứng với dự án.</p></div>
        <div className="border-t border-white/25">{process.map(([title, text]) => <article className="grid gap-2 border-b border-white/20 py-6 sm:grid-cols-[190px_1fr] sm:gap-8" key={title}><h3 className="text-xl font-semibold text-[#09a7a5]">{title}</h3><p className="leading-7 text-white/70">{text}</p></article>)}</div>
      </div>
    </section>
  </main>;
}
