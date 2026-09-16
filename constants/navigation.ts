import { ROUTES } from "./routes";

export type NavigationItem = { vi: string; en: string; href: string };
export type NavigationGroup = { vi: string; en: string; items: NavigationItem[] };

const serviceItem = (vi: string, en: string, slug: string): NavigationItem => ({
  vi,
  en,
  href: ROUTES.serviceDetail(slug),
});

export const ABOUT_MENU_ITEMS: NavigationItem[] = [
  { vi: "Giới thiệu BIM4C", en: "About BIM4C", href: ROUTES.about },
  { vi: "Tầm nhìn & Sứ mệnh", en: "Vision & mission", href: ROUTES.about },
  { vi: "Giá trị cốt lõi", en: "Core values", href: ROUTES.about },
  { vi: "Vì sao chọn BIM4C", en: "Why BIM4C", href: `${ROUTES.about}#why-bim4c` },
  { vi: "Đội ngũ", en: "Team", href: ROUTES.about },
  { vi: "Đối tác", en: "Partners", href: `${ROUTES.about}#partners` },
  { vi: "Chứng nhận", en: "Certifications", href: ROUTES.about },
];

export const SERVICE_MENU_GROUPS: NavigationGroup[] = [
  {
    vi: "BIM",
    en: "BIM services",
    items: [
      serviceItem("BIM 3D", "BIM 3D", "bim-3d"),
      serviceItem("BIM 4D", "BIM 4D", "bim-4d"),
      serviceItem("BIM 5D", "BIM 5D", "bim-5d"),
      serviceItem("BIM 6D", "BIM 6D", "bim-6d"),
      serviceItem("BIM 7D", "BIM 7D", "bim-7d"),
    ],
  },
  {
    vi: "Khảo sát & Số hóa",
    en: "Survey & digitization",
    items: [
      serviceItem("Laser Scan", "Laser Scan", "laser-scan"),
      serviceItem("LiDAR", "LiDAR", "lidar"),
      serviceItem("Scan-to-BIM", "Scan-to-BIM", "scan-to-bim"),
    ],
  },
  {
    vi: "Thiết kế",
    en: "Design",
    items: [
      serviceItem("Kiến trúc", "Architecture", "kien-truc"),
      serviceItem("Nội thất", "Interior design", "noi-that"),
      serviceItem("Cảnh quan", "Landscape design", "canh-quan"),
      serviceItem("Hạ tầng", "Infrastructure design", "ha-tang"),
      serviceItem("Quy hoạch 1/500", "1/500 master planning", "quy-hoach-1-500"),
    ],
  },
  {
    vi: "Tư vấn & Quản lý",
    en: "Consulting & management",
    items: [
      serviceItem("Quản lý dự án", "Project management", "quan-ly-du-an"),
      serviceItem("Giám sát thi công", "Construction supervision", "giam-sat-thi-cong"),
      serviceItem("Giám sát lắp đặt thiết bị", "Equipment installation supervision", "giam-sat-lap-dat-thiet-bi"),
      serviceItem("Thẩm tra & thẩm định thiết kế", "Design review and appraisal", "tham-tra-tham-dinh-thiet-ke"),
    ],
  },
  {
    vi: "Đào tạo",
    en: "Training",
    items: [
      serviceItem("Đào tạo & chuyển giao công nghệ", "Training & technology transfer", "dao-tao-chuyen-giao-cong-nghe"),
    ],
  },
];

export const MAIN_NAVIGATION = [
  { key: "about", href: ROUTES.about },
  { key: "services", href: ROUTES.services },
  { key: "projects", href: ROUTES.projects },
  { key: "courses", href: ROUTES.courses },
  { key: "blog", href: ROUTES.blog },
] as const;
