import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const navigationLinks = [
  ["Trang chủ", ROUTES.home],
  ["Giới thiệu", ROUTES.about],
  ["Dịch vụ", ROUTES.services],
  ["Dự án", ROUTES.projects],
];

const utilityLinks = [
  ["Đào tạo", ROUTES.courses],
  ["Sứ mệnh", ROUTES.about],
  ["Tầm nhìn", ROUTES.about],
  ["Lịch sử", ROUTES.about],
  ["Liên hệ", ROUTES.contact],
];

const contactInfo = [
  "Tầng 12, Tòa nhà BIM4C, TP. Hồ Chí Minh",
  "hello@bim4c.vn",
  "+84 28 7300 4068",
];

export function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer-inner">
        {/* Brand column */}
        <div className="footer-brand">
          <Link className="footer-logo" href={ROUTES.home} aria-label="BIM4C — Trang chủ">
            BIM<span>4C</span>
          </Link>
          <p>Cách mạng hóa ngành xây dựng với giải pháp BIM sáng tạo, bền vững và hiệu quả.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="X / Twitter" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>

        {/* Navigation column */}
        <div className="footer-col">
          <h3>Điều hướng</h3>
          <nav>
            {navigationLinks.map(([label, href]) => (
              <Link href={href} key={label + href}>{label}</Link>
            ))}
          </nav>
        </div>

        {/* Utility pages column */}
        <div className="footer-col">
          <h3>Trang tiện ích</h3>
          <nav>
            {utilityLinks.map(([label, href]) => (
              <Link href={href} key={label + href}>{label}</Link>
            ))}
          </nav>
        </div>

        {/* Contact + Newsletter column */}
        <div className="footer-col footer-col-contact">
          <h3>Liên hệ</h3>
          {contactInfo.map((info) => (
            <p key={info}>{info}</p>
          ))}
          <h3 className="footer-newsletter-title">Nhận bản tin</h3>
          <p>Cập nhật tin tức, dự án và kiến thức BIM mới nhất qua email.</p>
          <form className="footer-newsletter-form">
            <input type="email" name="email" placeholder="Nhập email của bạn" aria-label="Email đăng ký bản tin" />
            <button type="submit">Đăng ký</button>
          </form>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© BIM4C Construction 2025. Bảo lưu mọi quyền.</span>
        <div>
          <Link href={ROUTES.legalDetail("dieu-khoan-su-dung")}>Điều khoản sử dụng</Link>
          <Link href={ROUTES.legalDetail("chinh-sach-bao-mat")}>Chính sách bảo mật</Link>
        </div>
      </div>
    </footer>
  );
}
