import type { AdminPostContent } from "../types";
import { createBaseEmptyContent, serializeBaseContent } from "./common";

export function createEmptyPost(type: "Tin tức" | "Chuyên môn" = "Tin tức"): AdminPostContent {
  return {
    ...createBaseEmptyContent(),
    type,
    categoryId: null,
    category: null,
    authorName: "",
  };
}

export function serializePostPayload(data: Partial<AdminPostContent>): Record<string, unknown> {
  const base = serializeBaseContent(data);

  const payload: Record<string, unknown> = {
    ...base,
  };

  if (data.categoryId && data.categoryId.trim()) {
    payload.categoryId = data.categoryId.trim();
  } else if (data.category && typeof data.category === "object" && data.category.id) {
    payload.categoryId = data.category.id;
  }

  if (data.authorName && data.authorName.trim()) {
    payload.authorName = data.authorName.trim();
  }

  return payload;
}
