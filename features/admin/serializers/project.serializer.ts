import type { AdminProjectContent } from "../types";
import { createBaseEmptyContent, serializeBaseContent } from "./common";

export function createEmptyProject(): AdminProjectContent {
  return {
    ...createBaseEmptyContent(),
    type: "Dự án",
    categoryId: null,
    category: null,
    location: "",
    location_vi: "",
    year: new Date().getFullYear(),
    investor: "",
    investor_vi: "",
    expectedCompletion: "",
    expectedCompletion_vi: "",
    scale: "",
    scale_vi: "",
    contractPackage: "",
    contractPackage_vi: "",
    isFeatured: false,
    images: [],
  };
}

export function serializeProjectPayload(data: Partial<AdminProjectContent>): Record<string, unknown> {
  const base = serializeBaseContent(data);

  const payload: Record<string, unknown> = {
    ...base,
    location: (data.location || data.location_vi || "Vietnam").trim(),
    isFeatured: Boolean(data.isFeatured),
  };

  if (data.categoryId && data.categoryId.trim()) {
    payload.categoryId = data.categoryId.trim();
  } else if (data.category && typeof data.category === "object" && data.category.id) {
    payload.categoryId = data.category.id;
  }

  if (data.location_vi) payload.location_vi = data.location_vi.trim();
  if (typeof data.year === "number" && !isNaN(data.year)) payload.year = data.year;
  if (data.investor) payload.investor = data.investor.trim();
  if (data.investor_vi) payload.investor_vi = data.investor_vi.trim();
  if (data.expectedCompletion) payload.expectedCompletion = data.expectedCompletion.trim();
  if (data.expectedCompletion_vi) payload.expectedCompletion_vi = data.expectedCompletion_vi.trim();
  if (data.scale) payload.scale = data.scale.trim();
  if (data.scale_vi) payload.scale_vi = data.scale_vi.trim();
  if (data.contractPackage) payload.contractPackage = data.contractPackage.trim();
  if (data.contractPackage_vi) payload.contractPackage_vi = data.contractPackage_vi.trim();

  return payload;
}
