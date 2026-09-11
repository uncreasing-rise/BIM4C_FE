import { projectEntries } from "@/mocks/content";
import type { Project } from "../types/project";

const projectMetadata: Record<
  string,
  Pick<Project, "category" | "location" | "year" | "status"> &
    Partial<
      Pick<
        Project,
        "investor" | "expectedCompletion" | "scale" | "contractPackage"
      >
    >
> = {
  "lumi-hanoi": {
    category: "Nhà cao tầng",
    location: "Hà Nội",
    year: "2025",
    status: "Đang thi công",
    investor: "CapitaLand Development",
    scale: "9 toà tháp từ 29 đến 35 tầng, 3.950 căn hộ cao cấp",
    contractPackage: "Tư vấn & Phối hợp BIM",
  },
  "the-matrix-one-giai-doan-2": {
    category: "Nhà cao tầng",
    location: "Hà Nội",
    year: "2026",
    status: "Đang thi công",
    investor: "MIK Group",
    scale: "2 toà tháp 44 tầng với 2 tầng hầm liên thông",
    contractPackage: "Điều phối BIM & Kiểm soát xung đột MEP",
  },
  elysian: {
    category: "Nhà cao tầng",
    location: "TP. Hồ Chí Minh",
    year: "2025",
    status: "Hoàn thành",
    investor: "Gamuda Land",
    scale: "Khu căn hộ sinh thái cao cấp 4 toà tháp 21 tầng",
    contractPackage: "Mô hình hoá 3D/4D & Bàn giao dữ liệu số",
  },
  "tt-avio": {
    category: "Nhà thấp tầng",
    location: "Đường DT743A, P. Tân Đông Hiệp, TP. Dĩ An, tỉnh Bình Dương",
    year: "2026",
    status: "Đang thi công",
    investor:
      "Đơn vị Đầu Tư & Phát Triển liên doanh Nhật Bản Cosmos Initia - TT Capital – Koterasu Partner",
    expectedCompletion: "2026",
    scale:
      "Diện tích khu đất: 1,6 ha gồm 2 tháp với 2 hầm chung, Tháp A: 30 tầng, Tháp B: 37 tầng",
    contractPackage: "Tổng thầu thi công & Quản trị dữ liệu BIM",
  },
  "central-park-residences": {
    category: "Hạ tầng",
    location: "Nghệ An",
    year: "2025",
    status: "Hoàn thành",
    investor: "Ecopark",
    scale: "Tổ hợp đô thị sinh thái quy mô 200 ha",
    contractPackage: "Mô hình tổng thể hạ tầng kỹ thuật & CDE",
  },
  "northgate-logistics-hub": {
    category: "Công nghiệp",
    location: "Bắc Ninh",
    year: "2026",
    status: "Đang thi công",
    investor: "Logistics Partner Group",
    scale: "Trung tâm kho bãi hiện đại 120.000 m2",
    contractPackage: "Phối hợp BIM kết cấu nhịp lớn & MEP chuyên sâu",
  },
  "greenfield-smart-factory": {
    category: "Công nghiệp",
    location: "Hải Phòng",
    year: "2025",
    status: "Hoàn thành",
    investor: "Greenfield Hi-Tech",
    scale: "Nhà máy sản xuất thông minh 45.000 m2",
    contractPackage: "Bàn giao số COBie & Quản lý vận hành Digital Twin",
  },
  "metro-depot-digital-coordination": {
    category: "Hạ tầng",
    location: "TP. Hồ Chí Minh",
    year: "2026",
    status: "Đang thi công",
    investor: "Ban Quản lý Đường sắt Đô thị",
    scale: "Khu liên hợp Depot 25 ha và các tuyến kỹ thuật ngầm",
    contractPackage: "Phối hợp số OpenBIM ISO 19650 liên bộ môn",
  },
};

export const mockProjects: Project[] = projectEntries.map((project) => ({
  ...project,
  ...(projectMetadata[project.slug] ?? {
    category: "Khác",
    location: "",
    year: "",
    status: "",
  }),
}));
