import type { AdminCourseContent } from "../types";
import { assignOptional, createBaseEmptyContent, serializeBaseContent } from "./common";

export function createEmptyCourse(): AdminCourseContent {
  return {
    ...createBaseEmptyContent(),
    type: "Khóa học",
    duration: "",
    duration_vi: "",
    level: "",
    level_vi: "",
    price: "",
    price_vi: "",
    instructor: "",
    instructor_vi: "",
    learningOutcomes: [],
    learningOutcomes_vi: [],
    softwareStack: [],
    softwareStack_vi: [],
    curriculum: [],
  };
}

export function serializeCoursePayload(data: Partial<AdminCourseContent>): Record<string, unknown> {
  const base = serializeBaseContent(data);

  const payload: Record<string, unknown> = {
    ...base,
  };

  for (const key of ["duration", "duration_vi", "level", "level_vi", "price", "price_vi", "instructor", "instructor_vi"] as const) {
    assignOptional(payload, key, data[key]);
  }

  if (Array.isArray(data.learningOutcomes)) {
    payload.learningOutcomes = data.learningOutcomes.map((item) => String(item).trim()).filter(Boolean);
  }
  if (Array.isArray(data.learningOutcomes_vi)) {
    payload.learningOutcomes_vi = data.learningOutcomes_vi.map((item) => String(item).trim()).filter(Boolean);
  }
  if (Array.isArray(data.softwareStack)) {
    payload.softwareStack = data.softwareStack.map((item) => String(item).trim()).filter(Boolean);
  }
  if (Array.isArray(data.softwareStack_vi)) {
    payload.softwareStack_vi = data.softwareStack_vi.map((item) => String(item).trim()).filter(Boolean);
  }

  return payload;
}
