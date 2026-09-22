import type { AdminBaseContent, ContentFilterQuery } from "./base.types";

export interface CourseCurriculumSection {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
}

/** Course Content (Khóa học đào tạo BIM/Revit/Navisworks...) */
export interface AdminCourseContent extends AdminBaseContent {
  type: "Khóa học";
  duration?: string | null;
  duration_vi?: string | null;
  level?: string | null;
  level_vi?: string | null;
  price?: string | null;
  price_vi?: string | null;
  instructor?: string | null;
  instructor_vi?: string | null;
  learningOutcomes?: string[];
  learningOutcomes_vi?: string[];
  curriculum?: CourseCurriculumSection[];
}

export type CourseFilterQuery = ContentFilterQuery;

export interface CreateCoursePayload {
  title: string;
  slug: string;
  image: string;
  status: string;
  description: string;
  eyebrow?: string;
  meta?: string | null;
  highlights?: string[];
  sections?: { title: string; body: string }[];
  contentBlocks?: unknown[];
  duration?: string | null;
  duration_vi?: string | null;
  level?: string | null;
  level_vi?: string | null;
  price?: string | null;
  price_vi?: string | null;
  instructor?: string | null;
  instructor_vi?: string | null;
  learningOutcomes?: string[];
  learningOutcomes_vi?: string[];
  sortOrder?: number;
  publishedAt?: string | null;
  title_vi?: string | null;
  description_vi?: string | null;
  eyebrow_vi?: string | null;
  meta_vi?: string | null;
  highlights_vi?: string[];
  sections_vi?: { title: string; body: string }[];
  contentBlocks_vi?: unknown[];
  seoTitle?: string | null;
  seoTitle_vi?: string | null;
  seoDescription?: string | null;
  seoDescription_vi?: string | null;
  seoImage?: string | null;
  canonicalUrl?: string | null;
  relatedIds?: string[];
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

