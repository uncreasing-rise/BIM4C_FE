import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import type { Project } from "../types/project";

export interface ProjectDto extends ContentEntryDto {
  category: string | { name: string };
  location: string;
  year: string | number;
  investor?: string | null;
  expectedCompletion?: string | null;
  scale?: string | null;
  contractPackage?: string | null;
  status: string;
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: "Bản nháp",
  planned: "Sắp triển khai",
  in_progress: "Đang thi công",
  completed: "Hoàn thành",
  archived: "Đã lưu trữ",
};

export function mapProjectDto(dto: ProjectDto): Project {
  const content = mapContentDto(dto);
  const category =
    typeof dto.category === "string" ? dto.category : dto.category?.name;
  if (!category || !dto.location || dto.year == null || !dto.status) {
    throw new Error(
      "Invalid project API contract: category, location, year and status are required.",
    );
  }
  return {
    ...content,
    id: dto.id ?? undefined,
    category,
    location: dto.location,
    year: String(dto.year),
    investor: dto.investor ?? undefined,
    expectedCompletion: dto.expectedCompletion ?? undefined,
    scale: dto.scale ?? undefined,
    contractPackage: dto.contractPackage ?? undefined,
    status: PROJECT_STATUS_LABELS[dto.status] ?? dto.status,
  };
}
