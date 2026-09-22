export * from "./common";
export * from "./post.serializer";
export * from "./project.serializer";
export * from "./course.serializer";
export * from "./service.serializer";

import type {
  AdminContent,
  AdminContentType,
  AdminCourseContent,
  AdminPostContent,
  AdminProjectContent,
  AdminServiceContent,
} from "../types";
import { createEmptyPost, serializePostPayload } from "./post.serializer";
import { createEmptyProject, serializeProjectPayload } from "./project.serializer";
import { createEmptyCourse, serializeCoursePayload } from "./course.serializer";
import { createEmptyService, serializeServicePayload } from "./service.serializer";

/**
 * Factory to create domain-isolated empty initial state
 */
export function createEmptyContent(type: AdminContentType): AdminContent {
  switch (type) {
    case "Dự án":
      return createEmptyProject();
    case "Khóa học":
      return createEmptyCourse();
    case "Dịch vụ":
      return createEmptyService();
    case "Tin tức":
    case "Chuyên môn":
    default:
      return createEmptyPost(type);
  }
}

/**
 * Domain-specific serializer to guarantee no forbidden/cross-polluting fields reach the API
 */
export function serializeContentPayload(
  type: AdminContentType,
  data: Partial<AdminContent>,
): Record<string, unknown> {
  switch (type) {
    case "Dự án":
      return serializeProjectPayload(data as Partial<AdminProjectContent>);
    case "Khóa học":
      return serializeCoursePayload(data as Partial<AdminCourseContent>);
    case "Dịch vụ":
      return serializeServicePayload(data as Partial<AdminServiceContent>);
    case "Tin tức":
    case "Chuyên môn":
    default:
      return serializePostPayload(data as Partial<AdminPostContent>);
  }
}
