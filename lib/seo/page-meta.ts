import type { Locale } from "@/lib/i18n/config";

/**
 * Title and description of the fixed public pages, per language. Titles take
 * the root layout's " | BIM4C" suffix, so they never carry it themselves.
 */
export const PAGE_META = {
  about: {
    vi: {
      title: "Giới thiệu",
      description: "BIM4C kết nối chuyên môn xây dựng, quy trình BIM và quản trị thông tin dự án.",
    },
    en: {
      title: "About",
      description: "Meet BIM4C: connecting construction expertise, BIM workflows and project information.",
    },
  },
  contact: {
    vi: {
      title: "Liên hệ",
      description: "Trao đổi với BIM4C về tư vấn, triển khai BIM, đào tạo và chuyển đổi số xây dựng.",
    },
    en: {
      title: "Contact",
      description: "Talk with BIM4C about consulting, BIM delivery, training and digital construction.",
    },
  },
  legal: {
    vi: {
      title: "Pháp lý",
      description: "Chính sách quyền riêng tư, điều khoản sử dụng và bảo vệ dữ liệu cá nhân của BIM4C.",
    },
    en: {
      title: "Legal",
      description: "BIM4C privacy, terms of use and personal data protection information.",
    },
  },
  projects: {
    vi: {
      title: "Dự án",
      description: "Các dự án xây dựng và triển khai số hóa tiêu biểu do BIM4C thực hiện.",
    },
    en: {
      title: "Projects",
      description: "Explore BIM4C construction and digital delivery projects.",
    },
  },
  services: {
    vi: {
      title: "Giải pháp",
      description: "Giải pháp tư vấn BIM, thiết kế, đào tạo và tư vấn xây dựng từ BIM4C.",
    },
    en: {
      title: "Solutions",
      description: "BIM consulting, design, training and construction advisory solutions from BIM4C.",
    },
  },
  courses: {
    vi: {
      title: "Học viện",
      description: "Khóa đào tạo BIM thực chiến cho kỹ sư, đội ngũ dự án và doanh nghiệp.",
    },
    en: {
      title: "Academy",
      description: "Practical BIM training for engineers, project teams and organizations.",
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
