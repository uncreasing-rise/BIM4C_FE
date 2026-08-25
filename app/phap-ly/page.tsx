import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { legalDocuments } from "@/constants/legal-content";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Pháp lý | BIM4C",
  description: "Chính sách bảo mật, điều khoản sử dụng và quy định bảo vệ dữ liệu cá nhân của BIM4C.",
};

export default function LegalPage() {
  return <>
    <PageHero eyebrow="THÔNG TIN PHÁP LÝ" title="Minh bạch trong từng cam kết" description="Các chính sách và điều khoản áp dụng khi bạn truy cập, tương tác và cung cấp thông tin cho BIM4C." image="/images/about.jpg"/>
    <section className="legal-index"><div className="page-shell">
      <header><p className="eyebrow">PHÁP LÝ BIM4C</p><h2>Thông tin bạn cần biết</h2><p>Chọn tài liệu bên dưới để tìm hiểu cách chúng tôi vận hành website và bảo vệ quyền lợi của người dùng.</p></header>
      <div className="legal-card-grid">{legalDocuments.map((document,index)=><article key={document.slug}><span>{String(index+1).padStart(2,"0")}</span><h2>{document.title}</h2><p>{document.summary}</p><Link href={ROUTES.legalDetail(document.slug)}>Xem chi tiết <b>→</b></Link></article>)}</div>
    </div></section>
  </>;
}
