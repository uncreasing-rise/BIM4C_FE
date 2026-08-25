import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { ContactBand } from "@/components/shared/ContactBand";
import { ROUTES } from "@/constants/routes";
import { getCourses } from "@/features/courses/api/queries";
export const metadata:Metadata={title:"Khóa học | BIM4C",description:"Chương trình đào tạo BIM thực chiến dành cho kỹ sư và doanh nghiệp."};
export default async function CoursesPage(){const courses=await getCourses();return <><PageHero eyebrow="BIM4C ACADEMY" title="Học từ dự án. Làm được việc." description="Chương trình BIM thực chiến được xây dựng từ kinh nghiệm triển khai và nhu cầu thật của doanh nghiệp." image="/images/service-training.jpg"/>
  <section className="course-catalog"><div className="page-shell"><header><p className="eyebrow">LỘ TRÌNH ĐÀO TẠO</p><h2>Chọn điểm bắt đầu phù hợp</h2></header><div className="course-list">{courses.map((course,index)=><article key={course.slug}><Link className="card-link" href={ROUTES.courseDetail(course.slug)} aria-label={`Xem ${course.title}`}/><div className="course-image"><Image src={course.image} alt={course.title} fill sizes="(max-width: 767px) 100vw, 35vw"/><span>0{index+1}</span></div><div className="course-copy"><p className="eyebrow">{course.eyebrow}</p><h3>{course.title}</h3><p>{course.description}</p><ul>{course.highlights.map(item=><li key={item}>{item}</li>)}</ul><span className="course-cta">Xem chương trình →</span></div></article>)}</div></div></section>
  <section className="academy-outcomes"><div className="page-shell"><header><p className="eyebrow">HỌC ĐỂ LÀM ĐƯỢC</p><h2>Trải nghiệm đào tạo khác biệt</h2></header><div><article><span>01</span><h3>Tình huống thực tế</h3><p>Học từ dữ liệu, mô hình và vấn đề đã xuất hiện trong dự án xây dựng.</p></article><article><span>02</span><h3>Mentor đồng hành</h3><p>Nhận phản hồi trực tiếp để hiểu đúng và cải thiện sau mỗi bài thực hành.</p></article><article><span>03</span><h3>Năng lực đầu ra</h3><p>Hoàn thành sản phẩm cuối khóa có thể sử dụng trong hồ sơ nghề nghiệp.</p></article></div></div></section><ContactBand/></>}
