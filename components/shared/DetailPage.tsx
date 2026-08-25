import Image from "next/image";
import Link from "next/link";
import type { ContentEntry } from "@/types/content";
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

export function DetailPage({ entry, backHref, backLabel, kind = "service", related = [] }: {
  entry: ContentEntry; backHref: string; backLabel: string; kind?: DetailKind; related?: ContentEntry[];
}) {
  const copy = detailCopy[kind];
  const eyebrow = entry.meta ? `${entry.eyebrow} · ${entry.meta}` : entry.eyebrow;
  return <>
    <PageHero eyebrow={eyebrow} title={entry.title} description={entry.description} image={entry.image}/>
    <article className={`detail-page detail-${kind}`}>
      <div className="page-shell detail-opening">
        <p className="detail-lead">{copy.kicker}</p>
        <div className="detail-opening-meta"><span>BIM4C</span><span>{entry.meta ?? "Chuyên môn & thực tiễn"}</span></div>
      </div>

      <div className="page-shell detail-layout">
        <main className="detail-main">
          <nav className="detail-index" aria-label="Mục lục"><p>{copy.index}</p>{entry.sections.map((section, index) => <a href={`#section-${index + 1}`} key={section.title}><span>0{index + 1}</span>{section.title}</a>)}</nav>
          {entry.sections.map((section, index) => <section id={`section-${index + 1}`} key={section.title}>
            <span className="detail-section-number">0{index + 1}</span><div><h2>{section.title}</h2><p>{section.body}</p></div>
          </section>)}
          <figure className="detail-visual"><Image src={entry.image} alt={entry.title} fill sizes="(max-width: 767px) 100vw, 70vw"/><figcaption>{entry.title} — BIM4C</figcaption></figure>
          <section className="detail-principles"><div><p className="eyebrow">BIM4C STANDARD</p><h2>{copy.extraTitle}</h2></div><ol>{copy.extras.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ol></section>
        </main>

        <aside className="detail-aside"><p className="eyebrow">{copy.aside}</p><h2>Tóm tắt nhanh</h2><ul>{entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul><div className="detail-aside-note"><span>Đội ngũ BIM4C</span><p>Sẵn sàng trao đổi để giúp bạn xác định giải pháp phù hợp.</p></div><Link className="button button-primary" href="mailto:info@bim4c.vn">{copy.cta} <span>→</span></Link></aside>
      </div>

      {related.length > 0 && <section className="detail-related"><div className="page-shell"><header><div><p className="eyebrow">KHÁM PHÁ THÊM</p><h2>Nội dung liên quan</h2></div><Link href={backHref}>Xem tất cả <span>→</span></Link></header><div>{related.slice(0, 3).map((item) => <article key={item.slug}><Link className="card-link" href={`${backHref}/${item.slug}`} aria-label={`Xem ${item.title}`}/><div><Image src={item.image} alt={item.title} fill sizes="(max-width: 767px) 100vw, 33vw"/></div><p className="eyebrow">{item.eyebrow}</p><h3>{item.title}</h3><span>Khám phá →</span></article>)}</div></div></section>}
      <div className="page-shell detail-back"><Link href={backHref}>← {backLabel}</Link></div>
    </article>
  </>;
}
