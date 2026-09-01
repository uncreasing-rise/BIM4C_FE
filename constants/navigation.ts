import { ROUTES } from "./routes";

export const MAIN_NAVIGATION = [
  { label: "Giới thiệu", href: ROUTES.about },
  { label: "Dịch vụ", href: ROUTES.services },
  { label: "Dự án", href: ROUTES.projects },
  { label: "Khóa học", href: ROUTES.courses },
  { label: "Blog", href: ROUTES.blog },
] as const;

export const HEADER_MENUS = {
  about: [
    { label: "Tổng quan", href: ROUTES.about },
    { label: "Hệ thống quản trị", href: ROUTES.about },
    { label: "Năng lực", href: ROUTES.services },
    { label: "Khách hàng và đối tác", href: "/#partners" },
  ],
  services: [
    { label: "Tư vấn BIM", href: ROUTES.serviceDetail("tu-van-bim") },
    { label: "Đào tạo", href: ROUTES.serviceDetail("dao-tao") },
    { label: "Thiết kế", href: ROUTES.serviceDetail("thiet-ke") },
    { label: "Tư vấn giám sát", href: ROUTES.serviceDetail("tu-van-giam-sat") },
  ],
  projects: ["Nhà cao tầng", "Nhà ở", "Công nghiệp", "Hạ tầng", "Cơ điện"].map(
    (label) => ({ label, href: ROUTES.projects }),
  ),
} as const;
