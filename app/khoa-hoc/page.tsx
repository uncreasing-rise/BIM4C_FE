import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { ROUTES } from "@/constants/routes";
import { getCourses } from "@/features/courses/api/queries";

export const metadata: Metadata = {
  title: "Khóa học | BIM4C",
  description: "Chương trình đào tạo BIM thực chiến dành cho kỹ sư và doanh nghiệp.",
};

const learningValues = [
  ["Tình huống thực tế", "Dữ liệu, mô hình và vấn đề được lấy từ công việc triển khai dự án xây dựng."],
  ["Phản hồi trực tiếp", "Mentor theo sát sản phẩm thực hành và chỉ ra cách cải thiện sau mỗi bài tập."],
  ["Đầu ra sử dụng được", "Học viên hoàn thành sản phẩm có thể đưa vào công việc hoặc hồ sơ nghề nghiệp."],
] as const;

export default async function CoursesPage() {
  const courses = await getCourses();

  return <main>
    <PageHero eyebrow="BIM4C ACADEMY" title="Học từ dự án. Làm được việc." description="Chương trình BIM thực chiến được xây dựng từ kinh nghiệm triển khai và nhu cầu thật của doanh nghiệp." image="/images/service-training.jpg" />

    <section className="relative overflow-hidden bg-white py-16 lg:py-20">
      <div className="pointer-events-none absolute -right-28 top-0 h-full w-[34%] -skew-x-[18deg] bg-[#eaf8f7]/70" aria-hidden="true" />
      <div className="relative mx-auto grid w-[calc(100%_-_32px)] max-w-[1400px] gap-8 md:w-[calc(100%_-_64px)] lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:gap-20">
        <div><p className="mb-4 text-xs font-semibold text-[#087f7d]">Lộ trình đào tạo</p><h1 className="text-4xl font-semibold leading-[1.1] text-[#09a7a5]">Chọn đúng năng lực cần phát triển.</h1></div>
        <p className="max-w-[720px] border-l-2 border-[#09a7a5] pl-5 leading-7 text-[#667775]">Mỗi chương trình tập trung vào một nhóm công việc cụ thể. Học viên bắt đầu từ nền tảng phù hợp, thực hành trên tình huống thật và hoàn thành một đầu ra có thể kiểm chứng.</p>
      </div>
    </section>

    <section className="bg-[#f5fafa] py-16 lg:py-20" aria-label="Các chương trình đào tạo">
      <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1400px] md:w-[calc(100%_-_64px)]">
        <div className="border-t border-[#09a7a5]">
          {courses.map((course, index) => <article className="group relative grid border-b border-[#dbe7e5] py-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.72fr)] lg:items-stretch lg:py-12" id={course.slug} key={course.slug}>
            <Link className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-[#09a7a5]" href={ROUTES.courseDetail(course.slug)} aria-label={`Xem ${course.title}`} />
            <div className={`relative min-h-[280px] overflow-hidden lg:min-h-[360px] ${index % 2 ? "lg:order-2" : ""}`}><Image className="object-cover transition-transform group-hover:scale-[1.02]" src={course.image} alt={course.title} fill sizes="(max-width: 1023px) 100vw, 58vw" /><span className="absolute inset-0 bg-gradient-to-t from-[#063f46]/35 to-transparent" /></div>
            <div className={`relative flex flex-col justify-center bg-white p-6 md:p-9 lg:p-12 ${index % 2 ? "lg:order-1 lg:mr-[-1px]" : "lg:ml-[-1px]"}`}>
              <span className="mb-6 h-1 w-14 -skew-x-[24deg] bg-[#09a7a5]" aria-hidden="true" />
              <p className="mb-3 text-xs font-semibold text-[#087f7d]">{course.eyebrow}</p>
              <h2 className="text-2xl font-bold leading-[1.25] text-[#163b3a]">{course.title}</h2>
              <p className="mt-4 max-w-[620px] leading-7 text-[#667775]">{course.description}</p>
              {course.highlights.length > 0 && <p className="mt-7 border-t border-[#dbe7e5] pt-5 text-[#163b3a]">{course.highlights.join("  /  ")}</p>}
              <span className="mt-7 w-fit border-b border-[#09a7a5] pb-1 font-semibold text-[#087f7d]">Xem chương trình →</span>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-[#063f46] py-16 text-white lg:py-20">
      <div className="pointer-events-none absolute -right-32 top-0 h-full w-[40%] -skew-x-[20deg] bg-[#09a7a5]/15" aria-hidden="true" />
      <div className="relative mx-auto grid w-[calc(100%_-_32px)] max-w-[1400px] gap-10 md:w-[calc(100%_-_64px)] lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
        <div><p className="mb-4 text-xs font-semibold text-[#09a7a5]">Cách chúng tôi đào tạo</p><h2 className="text-4xl font-semibold leading-[1.1]">Học xong phải làm được.</h2></div>
        <div className="border-t border-white/25">{learningValues.map(([title, text]) => <article className="grid gap-2 border-b border-white/20 py-6 sm:grid-cols-[190px_1fr] sm:gap-8" key={title}><h3 className="text-xl font-semibold text-[#09a7a5]">{title}</h3><p className="leading-7 text-white/70">{text}</p></article>)}</div>
      </div>
    </section>
  </main>;
}
