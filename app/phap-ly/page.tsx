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
  return <div className="public-legal-index">
    <PageHero eyebrow="THÔNG TIN PHÁP LÝ" title="Minh bạch trong từng cam kết" description="Các chính sách và điều khoản áp dụng khi bạn truy cập, tương tác và cung cấp thông tin cho BIM4C." image="/images/news-project-coordination.webp"/>
    <section className="bg-[#f5fafa] py-16 lg:py-24"><div className="mx-auto w-[calc(100%_-_32px)] max-w-[1220px] md:w-[calc(100%_-_48px)]">
      <header className="mb-10 max-w-[760px]"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#09a7a5]">PHÁP LÝ BIM4C</p><h2 className="text-section-title font-semibold text-[#063f46]">Thông tin bạn cần biết</h2><p className="mt-4 leading-relaxed text-[#667775]">Chọn tài liệu bên dưới để tìm hiểu cách chúng tôi vận hành website và bảo vệ quyền lợi của người dùng.</p></header>
      <div className="grid grid-cols-1 border-l border-t border-[#dbe7e5] md:grid-cols-3">{legalDocuments.map((document,index)=><article className="flex min-h-[300px] flex-col border-b border-r border-[#dbe7e5] bg-white p-7" key={document.slug}><span className="text-xs font-semibold text-[#09a7a5]">{String(index+1).padStart(2,"0")}</span><h2 className="mb-3 mt-12 text-2xl font-semibold text-[#063f46]">{document.title}</h2><p className="mb-6 text-sm leading-relaxed text-[#667775]">{document.summary}</p><Link className="mt-auto text-xs font-semibold uppercase text-[#09a7a5]" href={ROUTES.legalDetail(document.slug)}>Xem chi tiết <b>→</b></Link></article>)}</div>
    </div></section>
  </div>;
}
