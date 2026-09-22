/**
 * Centralized Cover Image resolver for all Services, Projects, Courses, and Insights.
 * Ensures every card, listing, and detail page has a high-quality contextual cover image.
 */

export const SUPABASE_MEDIA_URLS = {
  heroSkyline: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093849834-hero-skyline-bim.jpg",
  projHoaXuan: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093851283-project-hoa-xuan.jpg",
  projNamHaiVan: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093852470-project-nam-hai-van.jpg",
  projMBeach: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093853589-project-m-beach.jpg",
  projTranNamTrung: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093854008-project-tran-nam-trung.jpg",
  projSchool: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093854452-project-school.jpg",
  projHoaNhon: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093855087-project-hoa-nhon.jpg",
  servBim3D: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093855737-service-bim-3d.jpg",
  servScanBim: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093856181-service-scan-bim.jpg",
  courseLab: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093856721-course-bim-lab.jpg",
  postDigitalTwin: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093857089-post-digital-twin.jpg",
  postSiteSafety: "https://kpetxiswbznomxsfaavv.supabase.co/storage/v1/object/public/media/media-1790093857436-post-site-safety.jpg",
};

export const SERVICE_COVER_MAP: Record<string, string> = {
  // 1. BIM Services
  "bim-3d": SUPABASE_MEDIA_URLS.servBim3D,
  "bim-4d": SUPABASE_MEDIA_URLS.postSiteSafety,
  "bim-5d": SUPABASE_MEDIA_URLS.postDigitalTwin,
  "bim-6d": SUPABASE_MEDIA_URLS.postDigitalTwin,
  "bim-7d": SUPABASE_MEDIA_URLS.postDigitalTwin,
  "tu-van-mo-hinh-hoa-bim-3d": SUPABASE_MEDIA_URLS.servBim3D,

  // 2. Survey & Digitization
  "laser-scan": SUPABASE_MEDIA_URLS.servScanBim,
  "lidar": SUPABASE_MEDIA_URLS.servScanBim,
  "scan-to-bim": SUPABASE_MEDIA_URLS.servScanBim,
  "khao-sat-laser-scan-to-bim": SUPABASE_MEDIA_URLS.servScanBim,

  // 3. Design
  "kien-truc": SUPABASE_MEDIA_URLS.projMBeach,
  "noi-that": SUPABASE_MEDIA_URLS.projMBeach,
  "canh-quan": SUPABASE_MEDIA_URLS.projSchool,
  "ha-tang": SUPABASE_MEDIA_URLS.projHoaXuan,
  "quy-hoach-1-500": SUPABASE_MEDIA_URLS.projHoaXuan,

  // 4. Consulting & Management
  "quan-ly-du-an": SUPABASE_MEDIA_URLS.postSiteSafety,
  "giam-sat-thi-cong": SUPABASE_MEDIA_URLS.postSiteSafety,
  "giam-sat-lap-dat-thiet-bi": SUPABASE_MEDIA_URLS.postSiteSafety,
  "tham-tra-tham-dinh-thiet-ke": SUPABASE_MEDIA_URLS.postSiteSafety,

  // 5. Training
  "dao-tao-chuyen-giao-cong-nghe": SUPABASE_MEDIA_URLS.courseLab,
  "chuyen-vien-phoi-hop-bim-3d": SUPABASE_MEDIA_URLS.courseLab,
};

export const CATEGORY_FALLBACK_MAP: Record<string, string> = {
  "BIM": SUPABASE_MEDIA_URLS.servBim3D,
  "Tư vấn BIM": SUPABASE_MEDIA_URLS.servBim3D,
  "BIM services": SUPABASE_MEDIA_URLS.servBim3D,
  "Khảo sát & Số hóa": SUPABASE_MEDIA_URLS.servScanBim,
  "Survey & digitization": SUPABASE_MEDIA_URLS.servScanBim,
  "Thiết kế": SUPABASE_MEDIA_URLS.projMBeach,
  "Design": SUPABASE_MEDIA_URLS.projMBeach,
  "Tư vấn & Quản lý": SUPABASE_MEDIA_URLS.postSiteSafety,
  "Consulting & management": SUPABASE_MEDIA_URLS.postSiteSafety,
  "Đào tạo": SUPABASE_MEDIA_URLS.courseLab,
  "Training": SUPABASE_MEDIA_URLS.courseLab,
  "Công trình cao tầng": SUPABASE_MEDIA_URLS.projMBeach,
  "Khu phức hợp": SUPABASE_MEDIA_URLS.heroSkyline,
  "Chung cư cao cấp": SUPABASE_MEDIA_URLS.projMBeach,
  "Công nghệ": SUPABASE_MEDIA_URLS.postDigitalTwin,
  "An toàn": SUPABASE_MEDIA_URLS.postSiteSafety,
  "Dự án": SUPABASE_MEDIA_URLS.projHoaXuan,
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
