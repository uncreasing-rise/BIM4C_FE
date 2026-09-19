import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import type { Project } from "../types/project";

export interface ProjectDto extends ContentEntryDto {
  category: string | { name: string };
  location: string;
  location_vi?: string | null;
  year?: string | number | null;
  investor?: string | null;
  investor_vi?: string | null;
  expectedCompletion?: string | null;
  expectedCompletion_vi?: string | null;
  scale?: string | null;
  scale_vi?: string | null;
  contractPackage?: string | null;
  contractPackage_vi?: string | null;
  status: string;
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: "Bản nháp",
  planned: "Sắp triển khai",
  in_progress: "Đang thi công",
  completed: "Hoàn thành",
  archived: "Đã lưu trữ",
  profiled: "Hồ sơ dự án",
  DRAFT: "Bản nháp",
  PLANNED: "Sắp triển khai",
  IN_PROGRESS: "Đang thi công",
  COMPLETED: "Hoàn thành",
  ARCHIVED: "Đã lưu trữ",
  PROFILED: "Hồ sơ dự án",
};

export function mapProjectDto(dto: ProjectDto): Project {
  const content = mapContentDto(dto);
  const category =
    typeof dto.category === "string"
      ? dto.category
      : (dto.category?.name || "Dự án");
  const location = dto.location || "Việt Nam";
  const year = dto.year != null ? String(dto.year) : "";
  const rawStatus = dto.status
    ? (PROJECT_STATUS_LABELS[dto.status] ??
       PROJECT_STATUS_LABELS[dto.status.toLowerCase()] ??
       dto.status)
    : "Hồ sơ dự án";

  return {
    ...content,
    id: dto.id ?? undefined,
    category,
    location,
    location_vi: dto.location_vi ?? location,
    year,
    investor: dto.investor ?? undefined,
    investor_vi: dto.investor_vi ?? dto.investor ?? undefined,
    expectedCompletion: dto.expectedCompletion ?? undefined,
    expectedCompletion_vi:
      dto.expectedCompletion_vi ?? dto.expectedCompletion ?? undefined,
    scale: dto.scale ?? undefined,
    scale_vi: dto.scale_vi ?? dto.scale ?? undefined,
    contractPackage: dto.contractPackage ?? undefined,
    contractPackage_vi:
      dto.contractPackage_vi ?? dto.contractPackage ?? undefined,
    status: rawStatus,
  };
}
