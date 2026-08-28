import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Giới thiệu công ty | BIM4C",
  description: "BIM4C tiên phong chuyển đổi số xây dựng với BIM, AI, IoT và Digital Twin.",
};

const workingPrinciples = [
  ["Hiểu đúng bài toán", "Bắt đầu từ quy trình, con người và mục tiêu thực tế của từng dự án."],
  ["Thiết kế vừa đủ", "Chọn công nghệ phù hợp thay vì áp dụng một mô hình chung cho mọi tổ chức."],
  ["Làm cùng đội ngũ", "Triển khai, kiểm chứng và chuyển giao ngay trong công việc hằng ngày."],
  ["Đo bằng kết quả", "Theo dõi sai sót, thời gian phối hợp và chất lượng dữ liệu sau triển khai."],
] as const;

const technologies = [
  ["AI", "Phân tích dữ liệu và nhận diện rủi ro sớm."],
  ["IoT", "Kết nối dữ liệu hiện trường theo thời gian thực."],
  ["Digital Twin", "Mô phỏng tài sản trong suốt vòng đời vận hành."],
] as const;

export default function AboutPage() {
  return <main>
    <PageHero eyebrow="GIỚI THIỆU BIM4C" title="Về chúng tôi" description="Ứng dụng BIM và công nghệ số vào những bài toán thực tế của ngành xây dựng." image="/images/about.jpg" />

    <section id="company-overview" className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div className="pointer-events-none absolute -right-24 top-0 h-full w-[35%] -skew-x-[18deg] bg-[#eaf8f7]/65" aria-hidden="true" />
      <div className="relative mx-auto grid w-[calc(100%_-_32px)] max-w-[1400px] gap-12 md:w-[calc(100%_-_64px)] lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] lg:gap-24">
        <div>
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.14em] text-[#087f7d]"><span className="h-px w-10 bg-[#09a7a5]" />BIM4C CONSTRUCTION</p>
          <h1 className="max-w-[920px] text-4xl font-semibold leading-[1.08] tracking-[-.03em] text-[#09a7a5] sm:text-5xl lg:text-[58px]">Công nghệ phải giải quyết được việc thật.</h1>
          <p className="mt-8 max-w-[760px] border-l-2 border-[#09a7a5] pl-5 text-lg leading-8 text-[#163b3a]">BIM4C xây dựng quy trình số cho thiết kế, thi công và vận hành — từ tổ chức dữ liệu đến phối hợp giữa những người trực tiếp làm dự án.</p>
        </div>
        <div className="self-end border-t border-[#09a7a5] pt-6">
          <p className="mb-8 text-[16px] leading-7 text-[#667775]">Chúng tôi kết hợp BIM với AI, IoT và Digital Twin khi chúng tạo ra giá trị rõ ràng: ít sai sót hơn, phối hợp nhanh hơn và dữ liệu đáng tin cậy hơn.</p>
          <dl className="flex gap-10">
            <div><dt className="text-4xl font-bold text-[#09a7a5]">25+</dt><dd className="mt-1 text-xs text-[#667775]">Khách hàng</dd></div>
            <div><dt className="text-4xl font-bold text-[#09a7a5]">150+</dt><dd className="mt-1 text-xs text-[#667775]">Học viên</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section id="ways-of-working" className="relative overflow-hidden bg-[#063f46] py-16 text-white lg:py-24">
      <div className="pointer-events-none absolute -right-20 -top-28 size-80 rotate-45 border border-white/10" aria-hidden="true" />
      <div className="relative mx-auto grid w-[calc(100%_-_32px)] max-w-[1400px] gap-12 md:w-[calc(100%_-_64px)] lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[.14em] text-[#09a7a5]">CÁCH BIM4C LÀM VIỆC</p>
          <h2 className="text-4xl font-semibold leading-[1.1] sm:text-5xl">Không bắt đầu từ phần mềm.</h2>
          <p className="mt-6 max-w-md text-[16px] leading-7 text-white/65">Mỗi dự án bắt đầu bằng việc hiểu cách đội ngũ đang làm việc và điểm nào thực sự cần thay đổi.</p>
        </div>
        <div className="border-t border-white/25">
          {workingPrinciples.map(([title, text]) => <article className="grid gap-2 border-b border-white/20 py-6 sm:grid-cols-[200px_1fr] sm:gap-8" key={title}><h3 className="font-semibold text-[#09a7a5]">{title}</h3><p className="leading-7 text-white/70">{text}</p></article>)}
        </div>
      </div>
    </section>

    <section id="technology" className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1400px] md:w-[calc(100%_-_64px)]">
        <div className="mb-12 max-w-[820px]"><p className="mb-4 text-xs font-semibold uppercase tracking-[.14em] text-[#087f7d]">NỀN TẢNG CÔNG NGHỆ</p><h2 className="text-4xl font-semibold leading-[1.1] text-[#09a7a5] sm:text-5xl">Một nguồn dữ liệu xuyên suốt vòng đời công trình.</h2></div>
        <div className="grid lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#09a7a5] p-8 text-white md:p-12">
            <span className="text-xs font-semibold uppercase tracking-[.14em] text-white/70">Nền tảng chung</span>
            <strong className="text-[clamp(88px,16vw,190px)] font-bold leading-[.75] tracking-[-.08em]">BIM</strong>
            <span className="absolute -right-20 top-1/2 size-56 -translate-y-1/2 rotate-45 border border-white/20" aria-hidden="true" />
          </div>
          <div className="border-x border-t border-[#dbe7e5]">
            {technologies.map(([title, text]) => <article className="grid gap-3 border-b border-[#dbe7e5] px-6 py-7 sm:grid-cols-[160px_1fr] sm:items-center sm:px-9" key={title}><h3 className="text-xl font-semibold text-[#09a7a5]">{title}</h3><p className="leading-7 text-[#667775]">{text}</p></article>)}
            <div className="p-6 sm:p-9"><Link className="inline-flex min-h-12 items-center bg-[#09a7a5] px-6 text-sm font-semibold text-white transition hover:bg-[#087f7d]" href={ROUTES.contactEmail}>Trao đổi về bài toán của bạn <span className="ml-4">→</span></Link></div>
          </div>
        </div>
      </div>
    </section>

    <section id="vision" className="relative overflow-hidden border-y border-[#dbe7e5] bg-[#f5fafa] py-16 lg:py-24">
      <div className="pointer-events-none absolute -right-28 top-0 h-full w-[34%] -skew-x-[18deg] bg-[#09a7a5]/[.055]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-12 top-12 size-52 rotate-45 border border-[#09a7a5]/20" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[18%] top-0 h-full w-px -rotate-[18deg] bg-[#09a7a5]/15" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-12 -left-20 h-28 w-[38%] -skew-x-[28deg] bg-[#09a7a5]/10" aria-hidden="true" />
      <div className="relative mx-auto w-[calc(100%_-_32px)] max-w-[1400px] md:w-[calc(100%_-_64px)]">
        <p className="mb-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.14em] text-[#087f7d]"><span className="h-px w-10 bg-[#09a7a5]" />ĐỊNH HƯỚNG BIM4C</p>
        <div className="grid overflow-hidden border border-[#dbe7e5] bg-white/85 shadow-[0_18px_45px_rgb(6_63_70_/_6%)] backdrop-blur-sm lg:grid-cols-2">
          <article className="relative overflow-hidden border-b border-[#dbe7e5] p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <span className="absolute -right-10 -top-14 h-28 w-24 -skew-x-[24deg] bg-[#09a7a5]/10" aria-hidden="true" />
            <span className="mb-8 block h-1 w-16 -skew-x-[28deg] bg-[#09a7a5]" aria-hidden="true" />
            <p className="mb-4 text-sm font-semibold text-[#09a7a5]">TẦM NHÌN</p>
            <h2 className="relative max-w-[570px] text-3xl font-semibold leading-[1.25] text-[#163b3a] sm:text-4xl">Đưa cách làm việc dựa trên dữ liệu trở thành tiêu chuẩn trong ngành xây dựng.</h2>
          </article>
          <article className="relative overflow-hidden p-7 sm:p-10 lg:p-14">
            <span className="absolute -bottom-12 -right-8 size-28 rotate-45 border border-[#09a7a5]/20" aria-hidden="true" />
            <span className="mb-8 block h-1 w-16 -skew-x-[28deg] bg-[#09a7a5]" aria-hidden="true" />
            <p className="mb-4 text-sm font-semibold text-[#09a7a5]">SỨ MỆNH</p>
            <h2 className="relative max-w-[570px] text-3xl font-semibold leading-[1.25] text-[#163b3a] sm:text-4xl">Biến công nghệ phức tạp thành quy trình mà đội ngũ có thể sử dụng mỗi ngày.</h2>
          </article>
        </div>
        <div className="mt-5 grid overflow-hidden border border-[#dbe7e5] bg-white text-sm font-semibold uppercase tracking-[.08em] text-[#09a7a5] sm:grid-cols-3">
          <span className="relative border-b border-[#dbe7e5] px-6 py-5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:-skew-x-[18deg] before:bg-[#09a7a5] sm:border-b-0 sm:border-r">Làm việc thông minh</span>
          <span className="relative border-b border-[#dbe7e5] px-6 py-5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:-skew-x-[18deg] before:bg-[#09a7a5]/55 sm:border-b-0 sm:border-r">Chính trực</span>
          <span className="relative px-6 py-5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:-skew-x-[18deg] before:bg-[#09a7a5]/30">Chân thành</span>
        </div>
      </div>
    </section>

    <section className="grid bg-white lg:grid-cols-[.8fr_1.2fr]">
      <div className="relative min-h-[360px] overflow-hidden sm:min-h-[440px] lg:min-h-[560px]"><Image className="object-cover" src="/images/service-training.jpg" alt="Trần Ngọc Hiếu – Nhà sáng lập BIM4C" fill sizes="(max-width: 1023px) 100vw, 40vw" /></div>
      <div className="relative flex flex-col justify-center overflow-hidden px-5 py-14 md:px-12 lg:p-20">
        <span className="pointer-events-none absolute right-4 top-0 text-[180px] font-serif leading-none text-[#09a7a5]/10" aria-hidden="true">“</span>
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.14em] text-[#087f7d]">TỪ NGƯỜI SÁNG LẬP</p>
        <blockquote className="relative max-w-[760px] text-3xl font-semibold leading-[1.35] text-[#09a7a5] sm:text-4xl">Công nghệ chỉ thật sự có ý nghĩa khi tạo ra giá trị cho con người.</blockquote>
        <p className="mt-7 max-w-[680px] leading-7 text-[#667775]">Đó là nguyên tắc BIM4C dùng để lựa chọn công nghệ, xây dựng giải pháp và đồng hành cùng mỗi đội ngũ dự án.</p>
        <div className="mt-9 border-t border-[#dbe7e5] pt-5"><strong className="block text-[#163b3a]">Trần Ngọc Hiếu</strong><span className="text-xs text-[#667775]">Nhà sáng lập BIM4C</span></div>
      </div>
    </section>
  </main>;
}
