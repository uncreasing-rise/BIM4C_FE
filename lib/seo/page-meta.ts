import type { Locale } from "@/lib/i18n/config";

/**
 * Title and description of the fixed public pages, per language. Titles take
 * the root layout's " | BIM4C" suffix, so they never carry it themselves.
 */
export const PAGE_META = {
  about: {
    vi: {
      title: "Giới thiệu – Đơn vị tư vấn BIM & Xây dựng",
      description:
        "BIM4C kết nối chuyên môn xây dựng, quy trình BIM và quản trị thông tin dự án, đồng hành cùng chủ đầu tư và nhà thầu trên toàn bộ vòng đời công trình.",
    },
    en: {
      title: "About Us – BIM & Construction Consultancy",
      description:
        "Meet BIM4C: connecting construction expertise, BIM workflows and project information for owners and contractors across the whole building lifecycle.",
    },
  },
  contact: {
    vi: {
      title: "Liên hệ tư vấn BIM & Chuyển đổi số xây dựng",
      description:
        "Liên hệ BIM4C để trao đổi về tư vấn BIM, mô hình hóa 3D, mô phỏng 4D/5D, khảo sát Laser Scan, đào tạo và chuyển đổi số cho dự án xây dựng của bạn.",
    },
    en: {
      title: "Contact Us – BIM Consulting & Delivery",
      description:
        "Talk with BIM4C about BIM consulting, 3D modelling, 4D/5D simulation, laser scanning, training and digital construction for your next project.",
    },
  },
  legal: {
    vi: {
      title: "Pháp lý – Chính sách & Điều khoản",
      description:
        "Chính sách quyền riêng tư, điều khoản sử dụng và cam kết bảo vệ dữ liệu cá nhân áp dụng khi bạn truy cập website và sử dụng dịch vụ của BIM4C.",
    },
    en: {
      title: "Legal – Privacy Policy & Terms of Use",
      description:
        "BIM4C privacy policy, terms of use and personal data protection commitments that apply when you visit this website or use our services.",
    },
  },
  projects: {
    vi: {
      title: "Dự án BIM & Xây dựng tiêu biểu",
      description:
        "Các dự án xây dựng và triển khai BIM tiêu biểu do BIM4C thực hiện: mô hình hóa, phối hợp đa bộ môn, khảo sát Laser Scan và quản lý thông tin dự án.",
    },
    en: {
      title: "BIM & Construction Projects",
      description:
        "Explore BIM4C construction and digital delivery projects: BIM modelling, multidisciplinary coordination, laser scanning and project information management.",
    },
  },
  services: {
    vi: {
      title: "Giải pháp BIM 3D, 4D, 5D & Tư vấn xây dựng",
      description:
        "Giải pháp tư vấn BIM, mô hình hóa 3D, mô phỏng tiến độ 4D, quản lý chi phí 5D, Laser Scan, thiết kế, giám sát và đào tạo cho mọi giai đoạn dự án.",
    },
    en: {
      title: "BIM 3D, 4D, 5D & Construction Solutions",
      description:
        "BIM consulting, 3D modelling, 4D scheduling, 5D cost management, laser scanning, design, supervision and training from BIM4C for every project stage.",
    },
  },
  courses: {
    vi: {
      title: "Khóa học BIM thực chiến – Học viện",
      description:
        "Khóa đào tạo BIM thực chiến cho sinh viên, kỹ sư, chủ đầu tư, ban QLDA và doanh nghiệp xây dựng, do đội ngũ chuyên gia BIM4C trực tiếp giảng dạy.",
    },
    en: {
      title: "Practical BIM Courses – Academy",
      description:
        "Practical BIM training for students, engineers, owners, project managers and construction companies, taught directly by BIM4C's BIM specialists.",
    },
  },
  blog: {
    vi: {
      title: "Kiến thức",
      description: "Tin dự án, góc nhìn chuyên gia và kiến thức chuyển đổi số xây dựng từ BIM4C.",
    },
    en: {
      title: "Insights",
      description: "Project news, expert perspectives and digital construction insights from BIM4C.",
    },
  },
} satisfies Record<string, Record<Locale, { title: string; description: string }>>;

export type PageMetaKey = keyof typeof PAGE_META;

export const pageMeta = (key: PageMetaKey, locale: Locale) => PAGE_META[key][locale];

/** Drops a trailing " | BIM4C" (or " - BIM4C") that the title template adds again. */
export const withoutBrandSuffix = (title: string) =>
  title.replace(/(\s*[|\-–—]\s*BIM4C)+\s*$/i, "").trim() || title;
