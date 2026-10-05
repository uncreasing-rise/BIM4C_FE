import type { AdminProjectContent } from "../types";
import { assignOptional, createBaseEmptyContent, serializeBaseContent } from "./common";

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

  if (typeof data.year === "number" && !isNaN(data.year)) payload.year = data.year;
  else if (data.year === null) payload.year = null;
  for (const key of [
    "location_vi",
    "investor",
    "investor_vi",
    "expectedCompletion",
    "expectedCompletion_vi",
    "scale",
    "scale_vi",
    "contractPackage",
    "contractPackage_vi",
  ] as const) {
    assignOptional(payload, key, data[key]);
  }

  return payload;
}
