import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const columns = [{ title: "Khám phá", links: [["Giới thiệu", ROUTES.about], ["Dịch vụ", ROUTES.services], ["Dự án", ROUTES.projects]] }, { title: "Kiến thức", links: [["Đào tạo", ROUTES.courses], ["Tin tức & sự kiện", ROUTES.blog]] }, { title: "BIM4C", links: [["Liên hệ", ROUTES.contact], ["Chính sách bảo mật", ROUTES.legalDetail("chinh-sach-bao-mat")], ["Điều khoản sử dụng", ROUTES.legalDetail("dieu-khoan-su-dung")]] }] as const;

export function Footer() {
  return <footer className="apple-shared-footer" id="contact"><div><p className="apple-footer-intro">BIM4C Construction — giải pháp BIM cho toàn bộ vòng đời công trình. Kết nối con người, quy trình và dữ liệu để xây dựng tốt hơn.</p><div className="apple-footer-columns">{columns.map(column => <section key={column.title}><h2>{column.title}</h2>{column.links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</section>)}</div><div className="apple-footer-legal"><span>Copyright © 2026 BIM4C Construction.</span><a href={ROUTES.contactEmail}>info@bim4c.vn</a></div></div></footer>;
}
