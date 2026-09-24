import { createHash, timingSafeEqual } from "node:crypto";

export const DEFAULT_REVALIDATION_TAGS = [
  "projects",
  "courses",
  "services",
  "posts",
  "homepage",
  "settings",
] as const;

const TAG_PATTERN = /^[a-z0-9][a-z0-9-]{0,119}$/;
const MAX_TAGS = 50;

/** Constant-time secret comparison (hashing first equalizes the lengths). */
export function secretMatches(provided: string | null | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(provided), digest(expected));
}

/**
 * Accepts only well-formed cache tags (e.g. `projects`, `project-some-slug`),
 * de-duplicated and capped, so a caller cannot flood `revalidateTag`.
 * Falls back to the default content tags when none are supplied.
 */
export function sanitizeTags(input: unknown): string[] {
  if (!Array.isArray(input) || input.length === 0) return [...DEFAULT_REVALIDATION_TAGS];
  const tags = [
    ...new Set(input.filter((tag): tag is string => typeof tag === "string" && TAG_PATTERN.test(tag))),
  ];
  return tags.slice(0, MAX_TAGS);
}
