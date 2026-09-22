/**
 * Centralized Cover Image resolver for all Services, Projects, Courses, and Insights.
 * Ensures every card, listing, and detail page has a high-quality contextual cover image.
 */

export const SERVICE_COVER_MAP: Record<string, string> = {
  // 1. BIM Services
  "bim-3d": "/images/service-bim.jpg",
  "bim-4d": "/images/news-project-coordination.webp",
  "bim-5d": "/images/news-digital-twin.webp",
  "bim-6d": "/images/news-digital-twin.webp",
  "bim-7d": "/images/news-digital-twin.webp",
  "tu-van-mo-hinh-hoa-bim-3d": "/images/service-bim.jpg",

  // 2. Survey & Digitization
  "laser-scan": "/images/service-bim.jpg",
  "lidar": "/images/news-digital-twin.webp",
  "scan-to-bim": "/images/service-bim.jpg",

  // 3. Design
  "kien-truc": "/images/service-design.jpg",
  "noi-that": "/images/service-design.jpg",
  "canh-quan": "/images/service-design.jpg",
  "ha-tang": "/images/project-matrix.jpg",
  "quy-hoach-1-500": "/images/service-design.jpg",

  // 4. Consulting & Management
  "quan-ly-du-an": "/images/service-consulting.jpg",
  "giam-sat-thi-cong": "/images/news-site-safety.webp",
  "giam-sat-lap-dat-thiet-bi": "/images/service-consulting.jpg",
  "tham-tra-tham-dinh-thiet-ke": "/images/service-consulting.jpg",

  // 5. Training
  "dao-tao-chuyen-giao-cong-nghe": "/images/news-bim-training.webp",
};

export const CATEGORY_FALLBACK_MAP: Record<string, string> = {
  "BIM": "/images/service-bim.jpg",
  "Tư vấn BIM": "/images/service-bim.jpg",
  "BIM services": "/images/service-bim.jpg",
  "Khảo sát & Số hóa": "/images/service-bim.jpg",
  "Survey & digitization": "/images/service-bim.jpg",
  "Thiết kế": "/images/service-design.jpg",
  "Design": "/images/service-design.jpg",
  "Tư vấn & Quản lý": "/images/service-consulting.jpg",
  "Consulting & management": "/images/service-consulting.jpg",
  "Đào tạo": "/images/news-bim-training.webp",
  "Training": "/images/news-bim-training.webp",
  "Công trình cao tầng": "/images/project-matrix.jpg",
  "Khu phức hợp": "/images/project-lumi.jpg",
  "Chung cư cao cấp": "/images/project-elysian.jpg",
  "Công nghệ": "/images/news-digital-twin.webp",
  "An toàn": "/images/news-site-safety.webp",
  "Dự án": "/images/news-project-coordination.webp",
};

export function resolveCoverImage(options: {
  slug?: string | null;
  category?: string | null;
  currentImage?: string | null;
  type?: "service" | "project" | "course" | "post";
}): string {
  const { slug, category, currentImage, type } = options;

  // 1. If valid image provided in database/admin, strictly respect and return it
  if (typeof currentImage === "string" && currentImage.trim().length > 0) {
    const trimmed = currentImage.trim();
    if (
      trimmed.includes("cavendish.webp") ||
      trimmed.includes("hero-1.webp") ||
      trimmed === "/images/service-training.jpg"
    ) {
      if (type === "project") return "/images/project-matrix.jpg";
      if (type === "course") return "/images/news-bim-training.webp";
      return "/images/news-digital-twin.webp";
    }
    return trimmed;
  }

  // 2. Fallback lookup by explicit slug mapping if no image is set
  if (slug && SERVICE_COVER_MAP[slug]) {
    return SERVICE_COVER_MAP[slug];
  }

  // 3. Fallback lookup by category
  if (category && CATEGORY_FALLBACK_MAP[category]) {
    return CATEGORY_FALLBACK_MAP[category];
  }

  // 4. Content type default fallback
  if (type === "project") return "/images/project-matrix.jpg";
  if (type === "course") return "/images/news-bim-training.webp";
  if (type === "post") return "/images/news-project-coordination.webp";

  return "/images/service-bim.jpg";
}
