import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";

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
    <PageHero eyebrow="Giới thiệu BIM4C" title="Về chúng tôi" description="Ứng dụng BIM và công nghệ số vào những bài toán thực tế của ngành xây dựng." image="/images/about.jpg" />

    <section id="company-overview" className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div className="pointer-events-none absolute -right-24 top-0 h-full w-[35%] -skew-x-[18deg] bg-[#eaf8f7]/65" aria-hidden="true" />
      <div className="relative mx-auto grid w-[calc(100%_-_32px)] max-w-[1400px] gap-12 md:w-[calc(100%_-_64px)] lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] lg:gap-24">
        <div>
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.14em] text-[#087f7d]"><span className="h-px w-10 bg-[#09a7a5]" />BIM4C CONSTRUCTION</p>
          <h1 className="max-w-[920px] text-4xl font-semibold leading-[1.08] tracking-[-.03em] text-[#09a7a5]">Công nghệ phải giải quyết được việc thật.</h1>
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

    <section id="technology" className="bg-white py-16 lg:py-24">
      <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1400px] md:w-[calc(100%_-_64px)]">
        <header className="mb-12 grid gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:gap-20">
          <div><p className="mb-4 text-xs font-semibold uppercase tracking-[.14em] text-[#087f7d]">NỀN TẢNG CÔNG NGHỆ</p><h2 className="text-4xl font-semibold leading-[1.1] text-[#09a7a5]">BIM là lõi dữ liệu.</h2></div>
          <p className="max-w-[700px] text-[15px] leading-7 text-[#667775]">Mọi thông tin công trình được tổ chức trong BIM. AI, IoT và Digital Twin sử dụng nguồn dữ liệu đó để phân tích, cập nhật hiện trường và mô phỏng vận hành.</p>
        </header>
        <div className="relative overflow-hidden border border-[#dbe7e5] bg-[#f5fafa] bg-[linear-gradient(rgb(9_167_165_/.055)_1px,transparent_1px),linear-gradient(90deg,rgb(9_167_165_/.055)_1px,transparent_1px)] [background-size:32px_32px] [clip-path:polygon(0_0,calc(100%_-_18px)_0,100%_18px,100%_100%,18px_100%,0_calc(100%_-_18px))] px-5 py-8 md:px-10 md:py-10">
          <span className="absolute left-5 top-4 font-mono text-xs text-[#087f7d]/45" aria-hidden="true">SYS / BIM4C / CORE</span>
          <span className="absolute right-5 top-4 flex items-center gap-2 font-mono text-xs text-[#087f7d]/45" aria-hidden="true"><i className="size-1.5 bg-[#09a7a5]" />DATA FLOW</span>
          <div className="relative z-10 mx-auto mt-7 flex min-h-28 max-w-[340px] items-center justify-between overflow-hidden bg-[#09a7a5] px-7 text-white [clip-path:polygon(0_0,calc(100%_-_16px)_0,100%_16px,100%_100%,16px_100%,0_calc(100%_-_16px))]"><div><span className="text-xs uppercase tracking-[.12em] text-white/70">Dữ liệu trung tâm</span><strong className="mt-1 block text-4xl">BIM</strong></div><span className="size-16 rotate-45 border border-white/25" aria-hidden="true" /></div>
          <div className="mx-auto hidden h-10 w-px bg-[#09a7a5]/50 sm:block" aria-hidden="true" />
          <div className="relative grid gap-3 sm:grid-cols-3 sm:gap-0 sm:border-t sm:border-[#09a7a5]/50 sm:pt-10">
            {technologies.map(([title, text], index) => <article className="relative border border-[#dbe7e5] bg-white p-6 [clip-path:polygon(0_0,calc(100%_-_12px)_0,100%_12px,100%_100%,0_100%)] sm:mx-2 sm:before:absolute sm:before:-top-10 sm:before:left-1/2 sm:before:h-10 sm:before:w-px sm:before:bg-[#09a7a5]/50" key={title}><span className="mb-5 block font-mono text-xs text-[#667775]/55">NODE / 0{index + 1}</span><h3 className="mb-3 text-xl font-semibold text-[#09a7a5]">{title}</h3><p className="leading-6 text-[#667775]">{text}</p></article>)}
          </div>
        </div>
      </div>
    </section>

    <section id="vision" className="relative overflow-hidden bg-[#063f46] py-16 text-white lg:py-24">
      <div className="pointer-events-none absolute -right-36 top-0 h-full w-[42%] -skew-x-[20deg] bg-[#09a7a5]/15" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[18%] top-0 h-full w-px -rotate-[20deg] bg-white/15" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -left-24 h-40 w-[38%] -skew-x-[28deg] border-r border-t border-[#09a7a5]/40" aria-hidden="true" />
      <div className="relative mx-auto w-[calc(100%_-_32px)] max-w-[1400px] md:w-[calc(100%_-_64px)]">
        <p className="mb-9 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.14em] text-[#09a7a5]"><span className="h-px w-10 bg-[#09a7a5]" />ĐỊNH HƯỚNG BIM4C</p>
        <ol className="relative ml-3 max-w-[1080px] border-l border-[#09a7a5]/55">
          <li className="relative grid gap-4 border-b border-white/20 py-8 pl-10 md:grid-cols-[190px_1fr] md:gap-12 md:py-10 md:pl-14">
            <span className="absolute -left-2.5 top-10 size-5 rotate-45 border-2 border-[#09a7a5] bg-[#063f46] md:top-12" aria-hidden="true" />
            <div><span className="mb-2 block text-xs font-semibold text-white/40">01</span><h2 className="text-xl font-semibold text-[#09a7a5]">Tầm nhìn</h2></div>
            <p className="max-w-[760px] bg-white/[.055] px-6 py-5 text-2xl font-semibold leading-[1.35] [clip-path:polygon(0_0,calc(100%_-_14px)_0,100%_14px,100%_100%,0_100%)]">Đưa cách làm việc dựa trên dữ liệu trở thành tiêu chuẩn trong ngành xây dựng.</p>
          </li>
          <li className="relative grid gap-4 border-b border-white/20 py-8 pl-10 md:grid-cols-[190px_1fr] md:gap-12 md:py-10 md:pl-14">
            <span className="absolute -left-2.5 top-10 size-5 rotate-45 border-2 border-[#09a7a5] bg-[#063f46] md:top-12" aria-hidden="true" />
            <div><span className="mb-2 block text-xs font-semibold text-white/40">02</span><h2 className="text-xl font-semibold text-[#09a7a5]">Sứ mệnh</h2></div>
            <p className="max-w-[760px] bg-white/[.055] px-6 py-5 text-2xl font-semibold leading-[1.35] [clip-path:polygon(0_0,calc(100%_-_14px)_0,100%_14px,100%_100%,0_100%)] md:ml-8">Biến công nghệ phức tạp thành quy trình mà đội ngũ có thể sử dụng mỗi ngày.</p>
          </li>
          <li className="relative grid gap-5 py-8 pl-10 md:grid-cols-[190px_1fr] md:gap-12 md:py-10 md:pl-14">
            <span className="absolute -left-2.5 top-10 size-5 rotate-45 border-2 border-[#09a7a5] bg-[#063f46] md:top-12" aria-hidden="true" />
            <div><span className="mb-2 block text-xs font-semibold text-white/40">03</span><h2 className="text-xl font-semibold text-[#09a7a5]">Giá trị cốt lõi</h2></div>
            <div className="grid gap-3 sm:grid-cols-3 md:ml-16"><span className="border-l-2 border-[#09a7a5] bg-white/[.06] px-5 py-4 [clip-path:polygon(0_0,calc(100%_-_10px)_0,100%_10px,100%_100%,0_100%)] font-semibold">Làm việc thông minh</span><span className="border-l-2 border-[#09a7a5]/65 bg-white/[.06] px-5 py-4 [clip-path:polygon(0_0,calc(100%_-_10px)_0,100%_10px,100%_100%,0_100%)] font-semibold">Chính trực</span><span className="border-l-2 border-[#09a7a5]/35 bg-white/[.06] px-5 py-4 [clip-path:polygon(0_0,calc(100%_-_10px)_0,100%_10px,100%_100%,0_100%)] font-semibold">Chân thành</span></div>
          </li>
        </ol>
      </div>
    </section>

    <section className="grid overflow-hidden bg-white lg:grid-cols-[.82fr_1.18fr]">
      <div className="relative z-10 min-h-[360px] overflow-hidden sm:min-h-[440px] lg:min-h-[560px] lg:[clip-path:polygon(0_0,92%_0,100%_100%,0_100%)]"><Image className="object-cover" src="/images/service-training.jpg" alt="Trần Ngọc Hiếu – Nhà sáng lập BIM4C" fill sizes="(max-width: 1023px) 100vw, 42vw" /></div>
      <div className="relative flex flex-col justify-center overflow-hidden px-5 py-14 md:px-12 lg:-ml-[4%] lg:pl-[14%] lg:pr-20">
        <span className="pointer-events-none absolute right-4 top-0 text-[180px] font-serif leading-none text-[#09a7a5]/10" aria-hidden="true">“</span>
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.14em] text-[#087f7d]">TỪ NGƯỜI SÁNG LẬP</p>
        <blockquote className="relative max-w-[760px] text-3xl font-semibold leading-[1.35] text-[#09a7a5] sm:text-4xl">Công nghệ chỉ thật sự có ý nghĩa khi tạo ra giá trị cho con người.</blockquote>
        <p className="mt-7 max-w-[680px] leading-7 text-[#667775]">Đó là nguyên tắc BIM4C dùng để lựa chọn công nghệ, xây dựng giải pháp và đồng hành cùng mỗi đội ngũ dự án.</p>
        <div className="mt-9 border-t border-[#dbe7e5] pt-5"><strong className="block text-[#163b3a]">Trần Ngọc Hiếu</strong><span className="text-xs text-[#667775]">Nhà sáng lập BIM4C</span></div>
      </div>
    </section>
  </main>;
}
