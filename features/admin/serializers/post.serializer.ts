import type { AdminPostContent } from "../types";
import { assignOptional, createBaseEmptyContent, serializeBaseContent } from "./common";

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

  // "categoryId" in data means the editor touched it, so an empty choice clears the category.
  if ("categoryId" in data) {
    payload.categoryId = data.categoryId?.trim() || null;
  } else if (data.category && typeof data.category === "object" && data.category.id) {
    payload.categoryId = data.category.id;
  }

  assignOptional(payload, "authorName", data.authorName);
  assignOptional(payload, "authorName_vi", data.authorName_vi);

  return payload;
}
