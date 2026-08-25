import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";

const information=[{label:"Giới thiệu",href:ROUTES.about},{label:"Dịch vụ",href:ROUTES.services},{label:"Dự án",href:ROUTES.projects},{label:"Khóa học",href:ROUTES.courses},{label:"Blog",href:ROUTES.blog}];
const legal=[
  {label:"Chính sách bảo mật",href:ROUTES.legalDetail("chinh-sach-bao-mat")},
  {label:"Điều khoản sử dụng",href:ROUTES.legalDetail("dieu-khoan-su-dung")},
  {label:"Bảo vệ dữ liệu cá nhân",href:ROUTES.legalDetail("bao-ve-du-lieu-ca-nhan")},
];
export function Footer(){return <footer className="site-footer" id="contact"><div className="footer-grid"><div className="footer-brand"><h2>BIM4C CONSTRUCTION</h2><p>Kiến tạo nền tảng vững chắc cho tương lai thông qua công nghệ BIM và quy trình quản lý xây dựng hiện đại.</p><div className="office-list"><div><strong>Văn phòng miền Bắc</strong><span>Hà Nội, Việt Nam</span></div><div><strong>Văn phòng miền Nam</strong><span>TP. Hồ Chí Minh, Việt Nam</span></div><a href={ROUTES.contactEmail}>info@bim4c.vn</a></div></div><div><h3>Thông tin</h3><ul>{information.map(item=><li key={item.label}><Link href={item.href}>{item.label}</Link></li>)}</ul></div><div><h3><Link href={ROUTES.legal}>Pháp lý</Link></h3><ul>{legal.map(item=><li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></div><div className="newsletter"><h3>Đăng ký nhận tin</h3><p>Cập nhật dự án, khóa học và kiến thức BIM mới nhất.</p><NewsletterForm/></div></div><div className="copyright">© 2026 BIM4C CONSTRUCTION. ALL RIGHTS RESERVED.</div></footer>}
