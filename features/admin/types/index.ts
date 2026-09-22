export * from "./base.types";
export * from "./posts.types";
export * from "./projects.types";
export * from "./courses.types";
export * from "./services.types";
export * from "./records.types";
export * from "./media.types";

import type { AdminPostContent } from "./posts.types";
import type { AdminProjectContent } from "./projects.types";
import type { AdminCourseContent } from "./courses.types";
import type { AdminServiceContent } from "./services.types";

/** Discriminated Union of all CMS Content Types */
export type AdminContent =
  | AdminPostContent
  | AdminProjectContent
  | AdminCourseContent
  | AdminServiceContent;
