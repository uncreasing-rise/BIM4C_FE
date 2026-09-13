import type { IconName } from "@/types/icon";

export const companyStats: { value: string; label: string; icon: IconName }[] =
  [
    { value: "150+", label: "Dự án bàn giao", icon: "compass" },
    { value: "99.8%", label: "Xử lý xung đột", icon: "building" },
    { value: "5,000+", label: "Học viên đào tạo", icon: "education" },
    { value: "ISO 19650", label: "Tiêu chuẩn quy trình", icon: "people" },
  ];

export const heroSlides = [
  {
    image: "/images/news-project-coordination.webp",
    eyebrow: "BIM4C CONSTRUCTION",
    title: ["KIẾN TẠO", "GIÁ TRỊ BỀN VỮNG"],
  },
  {
    image: "/images/news-project-coordination.webp",
    eyebrow: "DỰ ÁN TIÊU BIỂU",
    title: ["CHẤT LƯỢNG", "TẠO NÊN UY TÍN"],
  },
  {
    image: "/images/news-digital-twin.webp",
    eyebrow: "CÔNG NGHỆ BIM",
    title: ["CHUYỂN ĐỔI SỐ", "NGÀNH XÂY DỰNG"],
  },
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
  {
    title: "Chủ tịch Hội đồng quản trị",
    label: "Hội đồng quản trị",
    image: "/images/news-bim-training.webp",
  },
  {
    title: "Tổng Giám đốc",
    label: "Ban điều hành",
    image: "/images/news-site-safety.webp",
  },
  {
    title: "Giám đốc chuyên môn BIM",
    label: "Khối chuyên môn",
    image: "/images/service-bim.jpg",
  },
] as const;
