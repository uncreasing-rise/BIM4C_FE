import Image from "next/image";
import Link from "next/link";
import type { ContentEntry } from "@/types/content";
import type { Project } from "@/features/projects/types/project";
import { ConsultationForm } from "@/features/contact/components/ConsultationForm";
import { CourseRegistrationForm } from "@/features/contact/components/CourseRegistrationForm";
import { PageHero } from "./PageHero";

type DetailKind = "course" | "project" | "article" | "service";

const detailCopy = {
  course: {
    index: "Nội dung chương trình", aside: "Thông tin khóa học", cta: "Đăng ký tư vấn",
    kicker: "Lộ trình được thiết kế theo hướng thực hành, giúp học viên chuyển kiến thức thành năng lực có thể áp dụng ngay trong công việc.",
    extraTitle: "Trải nghiệm học tập", extras: ["Học theo tình huống dự án", "Phản hồi trực tiếp từ chuyên gia", "Tài nguyên học tập xuyên suốt"],
  },
  project: {
    index: "Câu chuyện dự án", aside: "Hồ sơ dự án", cta: "Trao đổi về dự án",
    kicker: "Một cách tiếp cận dựa trên dữ liệu, phối hợp chặt chẽ và khả năng kiểm soát xuyên suốt từ kế hoạch đến triển khai.",
    extraTitle: "Nguyên tắc triển khai", extras: ["Một nguồn dữ liệu thống nhất", "Phối hợp đa bộ môn", "Kiểm soát chất lượng liên tục"],
  },
  article: {
    index: "Trong bài viết này", aside: "Chủ đề bài viết", cta: "Liên hệ chuyên gia",
    kicker: "Góc nhìn từ thực tiễn triển khai, được đúc kết để hỗ trợ đội ngũ dự án ra quyết định rõ ràng và hiệu quả hơn.",
    extraTitle: "Điểm đáng chú ý", extras: ["Góc nhìn thực tiễn", "Kinh nghiệm từ dự án", "Khuyến nghị có thể áp dụng"],
  },
  service: {
    index: "Nội dung chính", aside: "Thông tin nổi bật", cta: "Nhận tư vấn",
    kicker: "Giải pháp được thiết kế theo mục tiêu thực tế, quy mô và mức độ sẵn sàng của từng tổ chức.",
    extraTitle: "Cách chúng tôi đồng hành", extras: ["Khảo sát nhu cầu", "Thiết kế giải pháp", "Đo lường và cải tiến"],
  },
};

type DetailEntry = ContentEntry & Partial<Pick<Project, "investor" | "expectedCompletion" | "scale" | "contractPackage" | "location" | "year" | "status">>;

export function DetailPage({ entry, backHref, backLabel, kind = "service", related = [] }: {
  entry: DetailEntry; backHref: string; backLabel: string; kind?: DetailKind; related?: ContentEntry[];
}) {
  const copy = detailCopy[kind];
  const eyebrow = entry.meta ? `${entry.eyebrow} · ${entry.meta}` : entry.eyebrow;
  return <>
    <PageHero eyebrow={eyebrow} title={entry.title} description={entry.description} image={entry.image}/>
    <article className="w-full bg-white py-16 lg:py-24">
      <div className="mx-auto mb-14 grid w-[calc(100%_-_32px)] max-w-[1440px] gap-6 border-b border-[#dbe7e5] pb-10 md:w-[calc(100%_-_48px)] md:grid-cols-[1fr_auto] md:items-end lg:w-[calc(100%_-_80px)]">
        <p className="m-0 max-w-[900px] text-subtitle font-medium leading-relaxed text-[#063f46]">{copy.kicker}</p>
        <div className="flex gap-3 text-xs font-semibold uppercase tracking-wider text-[#667775]"><span>BIM4C</span><span>·</span><span>{entry.meta ?? "Chuyên môn & thực tiễn"}</span></div>
      </div>

      <div className="mx-auto grid w-[calc(100%_-_32px)] max-w-[1440px] grid-cols-1 items-start gap-12 md:w-[calc(100%_-_48px)] lg:w-[calc(100%_-_80px)] lg:grid-cols-[minmax(0,2fr)_minmax(280px,.72fr)] lg:gap-[clamp(48px,6vw,90px)]">
        <main className="min-w-0">
          <nav className="mb-14 grid border-y border-[#dbe7e5]" aria-label="Mục lục"><p className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#087f7d]">{copy.index}</p>{entry.sections.map((section, index) => <a className="flex gap-4 border-t border-[#dbe7e5] px-4 py-3 text-sm text-[#667775] hover:bg-[#eaf8f7] hover:text-[#063f46]" href={`#section-${index + 1}`} key={section.title}><span className="font-bold text-[#09a7a5]">0{index + 1}</span>{section.title}</a>)}</nav>
          {entry.sections.map((section, index) => <section className="mb-12 grid grid-cols-[36px_minmax(0,1fr)] gap-3 md:grid-cols-[54px_minmax(0,1fr)] md:gap-6" id={`section-${index + 1}`} key={section.title}>
            <span className="pt-1 text-xs font-semibold text-[#09a7a5]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 [&_h2]:mb-4 [&_h2]:text-subtitle [&_h2]:font-semibold [&_h2]:text-[#063f46] [&_p]:m-0 [&_p]:text-body [&_p]:leading-[1.75] [&_p]:text-[#667775] md:[&_p]:text-lg md:[&_p]:leading-[1.85] [&_p+p]:mt-4 [&_ul]:mt-[22px] [&_ul]:list-square [&_ul]:pl-[22px] [&_ol]:mt-[22px] [&_ol]:list-decimal [&_ol]:pl-[22px] [&_li]:my-[9px] [&_li]:text-body [&_li]:leading-[1.7] [&_blockquote]:mt-6 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#09a7a5] [&_blockquote]:py-2 [&_blockquote]:pl-[22px] [&_blockquote]:text-lg [&_blockquote]:font-semibold [&_blockquote]:leading-relaxed [&_blockquote]:text-[#063f46]"><h2>{section.title}</h2>{section.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}{section.unorderedList?.length ? <ul>{section.unorderedList.map(item => <li key={item}>{item}</li>)}</ul> : null}{section.orderedList?.length ? <ol>{section.orderedList.map(item => <li key={item}>{item}</li>)}</ol> : null}{section.quote && <blockquote>{section.quote}</blockquote>}{section.images?.length ? <div className={`mt-7 grid max-w-[900px] gap-4 ${section.imageLayout === "grid" ? "md:grid-cols-2" : ""}`}>{section.images.map((image, imageIndex) => <figure className="m-0" key={`${image.url}-${imageIndex}`}><Image className="block h-auto w-full" src={image.url} alt={image.alt} width={image.width ?? 1200} height={image.height ?? 800} sizes={section.imageLayout === "grid" ? "(max-width: 767px) 100vw, 36vw" : "(max-width: 767px) 100vw, 70vw"}/>{image.caption && <figcaption className="mt-2 text-center text-xs italic leading-normal text-[#667775]">{image.caption}</figcaption>}</figure>)}</div> : null}</div>
          </section>)}
          <figure className="relative mt-10 aspect-[16/10] w-full overflow-hidden md:mt-14"><Image className="object-cover" src={entry.image} alt={entry.title} fill sizes="(max-width: 767px) 100vw, 70vw"/><figcaption className="absolute inset-x-0 bottom-0 bg-[#063f46]/80 p-3 text-xs text-white">{entry.title} — BIM4C</figcaption></figure>
          <section className="mt-14 grid gap-7 border-t border-[#dbe7e5] pt-8 md:grid-cols-2"><div><p className="mb-3 text-xs font-semibold tracking-wider text-[#087f7d]">BIM4C STANDARD</p><h2 className="text-subtitle font-semibold text-[#063f46]">{copy.extraTitle}</h2></div><ol className="border-t border-[#dbe7e5]">{copy.extras.map((item, index) => <li className="flex gap-4 border-b border-[#dbe7e5] py-4 text-[#667775]" key={item}><span className="text-xs font-semibold text-[#09a7a5]">0{index + 1}</span>{item}</li>)}</ol></section>
        </main>

        <aside className="bg-[#063f46] p-[22px] text-white shadow-sm lg:sticky lg:top-[110px] lg:p-7"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#ffffff]">{copy.aside}</p><h2 className="mb-5 text-2xl font-semibold">Tóm tắt nhanh</h2>{kind === "project" && <dl className="mb-7 border-t border-white/20 text-sm">{entry.investor && <div className="border-b border-white/20 py-3"><dt className="mb-1 text-micro font-semibold uppercase tracking-wider text-[#ffffff]">Chủ đầu tư</dt><dd className="leading-relaxed text-white/85">{entry.investor}</dd></div>}<div className="grid grid-cols-2 gap-4 border-b border-white/20 py-3"><div><dt className="mb-1 text-micro font-semibold uppercase tracking-wider text-[#ffffff]">Dự kiến hoàn thành</dt><dd>{entry.expectedCompletion ?? entry.year ?? "Đang cập nhật"}</dd></div><div><dt className="mb-1 text-micro font-semibold uppercase tracking-wider text-[#ffffff]">Tiến độ</dt><dd>{entry.status ?? "Đang cập nhật"}</dd></div></div>{entry.scale && <div className="border-b border-white/20 py-3"><dt className="mb-1 text-micro font-semibold uppercase tracking-wider text-[#ffffff]">Quy mô</dt><dd className="leading-relaxed text-white/85">{entry.scale}</dd></div>}{entry.location && <div className="border-b border-white/20 py-3"><dt className="mb-1 text-micro font-semibold uppercase tracking-wider text-[#ffffff]">Vị trí</dt><dd className="leading-relaxed text-white/85">{entry.location}</dd></div>}{entry.contractPackage && <div className="border-b border-white/20 py-3"><dt className="mb-1 text-micro font-semibold uppercase tracking-wider text-[#ffffff]">Gói thầu</dt><dd>{entry.contractPackage}</dd></div>}</dl>}<ul className="mb-7 list-none p-0">{entry.highlights.map((highlight) => <li className="border-b border-white/20 py-[13px] text-sm font-medium before:mr-2.5 before:font-bold before:text-[#ffffff] before:content-['+']" key={highlight}>{highlight}</li>)}</ul>{kind === "course" ? <CourseRegistrationForm courseId={entry.id ?? entry.slug} courseTitle={entry.title}/> : <><div className="mb-6 border-l-2 border-[#09a7a5] pl-4"><span className="text-xs font-semibold uppercase text-[#ffffff]">Đội ngũ BIM4C</span><p className="mt-2 text-sm leading-relaxed text-white/70">Sẵn sàng trao đổi để giúp bạn xác định giải pháp phù hợp.</p></div><ConsultationForm compact subject={`Yêu cầu tư vấn: ${entry.title}`}/></>}</aside>
      </div>

      {related.length > 0 && <section className="mt-20 bg-[#f5fafa] py-16"><div className="mx-auto w-[calc(100%_-_32px)] max-w-[1440px] md:w-[calc(100%_-_48px)] lg:w-[calc(100%_-_80px)]"><header className="mb-7 flex items-end justify-between gap-6"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#087f7d]">KHÁM PHÁ THÊM</p><h2 className="text-section-title font-semibold text-[#063f46]">Nội dung liên quan</h2></div><Link className="text-xs font-semibold text-[#087f7d]" href={backHref}>Xem tất cả <span>→</span></Link></header><div className="grid grid-cols-1 gap-6 md:grid-cols-3">{related.slice(0, 3).map((item) => <article className="group relative bg-white pb-5" key={item.slug}><Link className="absolute inset-0 z-10" href={`${backHref}/${item.slug}`} aria-label={`Xem ${item.title}`}/><div className="relative aspect-[16/10] overflow-hidden"><Image className="object-cover transition-transform duration-500 group-hover:scale-105" src={item.image} alt={item.title} fill sizes="(max-width: 767px) 100vw, 33vw"/></div><p className="mx-5 mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-[#087f7d]">{item.eyebrow}</p><h3 className="mx-5 text-lg font-semibold leading-snug text-[#063f46]">{item.title}</h3><span className="mx-5 mt-4 block text-xs font-semibold text-[#087f7d]">Khám phá →</span></article>)}</div></div></section>}
      <div className="mx-auto mt-14 w-[calc(100%_-_32px)] max-w-[1440px] border-t border-[#dbe7e5] pt-6 md:w-[calc(100%_-_48px)] lg:w-[calc(100%_-_80px)]"><Link className="text-label font-semibold uppercase text-[#087f7d] hover:underline hover:underline-offset-4" href={backHref}>← {backLabel}</Link></div>
    </article>
  </>;
}
