import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { CourseExplorer } from "@/components/courses/CourseExplorer";
import { getCourses } from "@/features/courses/api/queries";

export const metadata: Metadata = {
  title: "Đào tạo | BIM4C",
  description:
    "Chương trình đào tạo BIM thực chiến dành cho kỹ sư và doanh nghiệp.",
};
const learningValues = [
  [
    "Thực hành từ dự án",
    "Tình huống, dữ liệu và mô hình được chọn lọc từ công việc triển khai thực tế.",
  ],
  [
    "Mentor đồng hành",
    "Phản hồi trực tiếp giúp học viên nhận ra vấn đề và cải thiện sau từng bài tập.",
  ],
  [
    "Đầu ra ứng dụng được",
    "Sản phẩm hoàn thành có thể đưa vào công việc hoặc hồ sơ năng lực nghề nghiệp.",
  ],
] as const;

export default async function CoursesPage() {
  const courses = await getCourses();
  return (
    <main className="public-index public-courses">
      <PageHero
        eyebrow="BIM4C Academy"
        title="Đào tạo"
        description="Chương trình BIM thực chiến, được xây dựng từ kinh nghiệm triển khai dự án."
        image="/images/news-bim-training.webp"
      />
      <CourseExplorer courses={courses} />
      <section className="bg-[#f7f4f1] py-14 text-[#171717] lg:py-16">
        <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1200px] gap-9 md:w-[calc(100%_-_48px)] lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <header>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#ff5a36]">
              Phương pháp đào tạo
            </p>
            <h2 className="text-[30px] font-semibold leading-[1.16] tracking-[-.025em] md:text-[40px]">
              Học để làm được.
            </h2>
          </header>
          <div className="border-t border-[#dcd7d2]">
            {learningValues.map(([title, text], index) => (
              <article
                className="grid gap-2 border-b border-[#dcd7d2] py-5 sm:grid-cols-[34px_180px_1fr] sm:gap-5"
                key={title}
              >
                <span className="text-[10px] font-semibold text-[#ff5a36]">
                  0{index + 1}
                </span>
                <h3 className="text-[17px] font-semibold text-[#171717]">
                  {title}
                </h3>
                <p className="text-[14px] leading-[1.65] text-[#666]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
