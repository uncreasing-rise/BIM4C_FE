import { mapContentDto } from "@/features/shared/mappers/content.mapper";
import type { ContentEntryDto } from "@/features/shared/types/content-dto";
import type { Project } from "../types/project";
import { englishContent } from "@/lib/content/english-content";
import { toEnglishLabel } from "@/lib/utils/public-labels";

export interface ProjectDto extends ContentEntryDto {
  category: string | { name: string };
  location: string;
  location_vi?: string | null;
  year: string | number;
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
  const rawStatus = PROJECT_STATUS_LABELS[dto.status] ?? dto.status;
  return {
    ...content,
    id: dto.id ?? undefined,
    category,
    location: dto.location,
    location_vi: dto.location_vi ?? dto.location,
    year: String(dto.year),
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
