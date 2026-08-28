import { projectEntries } from "@/mocks/content";
import type { Project } from "../types/project";

const projectMetadata: Record<string, Pick<Project, "category" | "location" | "year" | "status"> & Partial<Pick<Project, "investor" | "expectedCompletion" | "scale" | "contractPackage">>> = {
  "lumi-hanoi": { category: "Nhà cao tầng", location: "Hà Nội", year: "2025", status: "Đang thi công" },
  "the-matrix-one-giai-doan-2": { category: "Nhà cao tầng", location: "Hà Nội", year: "2026", status: "Đang thi công" },
  elysian: { category: "Nhà cao tầng", location: "TP. Hồ Chí Minh", year: "2025", status: "Hoàn thành" },
  "tt-avio": { category: "Nhà thấp tầng", location: "Đường DT743A, P. Tân Đông Hiệp, TP. Dĩ An, tỉnh Bình Dương", year: "2026", status: "Đang thi công", investor: "Đơn vị Đầu Tư & Phát Triển liên doanh Nhật Bản Cosmos Initia - TT Capital – Koterasu Partner", expectedCompletion: "N/a", scale: "Diện tích khu đất: 1,6 ha gồm 2 tháp với 2 hầm chung, Tháp A: 30 tầng, Tháp B: 37 tầng", contractPackage: "Tổng thầu thi công" },
  "central-park-residences": { category: "Hạ tầng", location: "Nghệ An", year: "2025", status: "Hoàn thành" },
  "northgate-logistics-hub": { category: "Công nghiệp", location: "Bắc Ninh", year: "2026", status: "Đang thi công" },
  "greenfield-smart-factory": { category: "Công nghiệp", location: "Hải Phòng", year: "2025", status: "Hoàn thành" },
  "metro-depot-digital-coordination": { category: "Hạ tầng", location: "TP. Hồ Chí Minh", year: "2026", status: "Đang thi công" },
};

export const mockProjects: Project[] = projectEntries.map(project => ({
  ...project,
  ...(projectMetadata[project.slug] ?? { category: "Khác", location: "", year: "", status: "" }),
}));
