import type { AdminCourseContent } from "../types";
import { createBaseEmptyContent, serializeBaseContent } from "./common";

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
    curriculum: [],
  };
}

export function serializeCoursePayload(data: Partial<AdminCourseContent>): Record<string, unknown> {
  const base = serializeBaseContent(data);

  const payload: Record<string, unknown> = {
    ...base,
  };

  if (data.duration) payload.duration = data.duration.trim();
  if (data.duration_vi) payload.duration_vi = data.duration_vi.trim();
  if (data.level) payload.level = data.level.trim();
  if (data.level_vi) payload.level_vi = data.level_vi.trim();
  if (data.price) payload.price = data.price.trim();
  if (data.price_vi) payload.price_vi = data.price_vi.trim();
  if (data.instructor) payload.instructor = data.instructor.trim();
  if (data.instructor_vi) payload.instructor_vi = data.instructor_vi.trim();

  if (Array.isArray(data.learningOutcomes) && data.learningOutcomes.length > 0) {
    payload.learningOutcomes = data.learningOutcomes.map((item) => String(item).trim()).filter(Boolean);
  }
  if (Array.isArray(data.learningOutcomes_vi) && data.learningOutcomes_vi.length > 0) {
    payload.learningOutcomes_vi = data.learningOutcomes_vi.map((item) => String(item).trim()).filter(Boolean);
  }

  return payload;
}
