import type { IconName } from "@/types/icon";

export const companyStats: { value: string; label: string; icon: IconName }[] = [
  { value: "2004", label: "Năm thành lập", icon: "building" },
  { value: "180+", label: "Dự án lớn", icon: "compass" },
  { value: "1000+", label: "Chuyên gia", icon: "people" },
  { value: "9042", label: "Học viên BIM", icon: "education" },
];

export const heroSlides = [
  { image: "/images/news-project-coordination.webp", eyebrow: "BIM4C CONSTRUCTION", title: ["KIẾN TẠO", "GIÁ TRỊ BỀN VỮNG"] },
  { image: "/images/project-lumi.jpg", eyebrow: "DỰ ÁN TIÊU BIỂU", title: ["CHẤT LƯỢNG", "TẠO NÊN UY TÍN"] },
  { image: "/images/project-matrix.jpg", eyebrow: "CÔNG NGHỆ BIM", title: ["CHUYỂN ĐỔI SỐ", "NGÀNH XÂY DỰNG"] },
] as const;

export const strategicPartners = [
  { name: "Masterise Homes", logo: "/images/partners/masterise.png" },
  { name: "Gamuda Land", logo: "/images/partners/gamuda.png" },
  { name: "Ecopark", logo: "/images/partners/ecopark.png" },
  { name: "Nam Long", logo: "/images/partners/namlong.png" },
  { name: "MIK Group", logo: "/images/partners/mik.png" },
  { name: "Bitexco", logo: "/images/partners/bitexco.png" },
] as const;

export const governanceMembers = [
  { title: "Chủ tịch Hội đồng quản trị", label: "Hội đồng quản trị", image: "/images/news-bim-training.webp" },
  { title: "Tổng Giám đốc", label: "Ban điều hành", image: "/images/news-site-safety.webp" },
  { title: "Giám đốc chuyên môn BIM", label: "Khối chuyên môn", image: "/images/service-bim.jpg" },
] as const;
