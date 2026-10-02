import { apiClient } from "@/lib/api/client";
import type { PageContentMap } from "./types";

/** Never throws: an unreachable API or deleted rows yield an empty map and blocks hide. */
export async function getPageContent(): Promise<PageContentMap> {
  try {
    const response = await apiClient.get<{ data?: PageContentMap }>(
      "/page-content",
      {
        next: { revalidate: 60, tags: ["page-content"] },
      },
    );
    return withoutTeamIdentity(response?.data ?? {});
  } catch {
    return {};
  }
}

/**
 * The About page shows the team by role and expertise only. The API already
 * leaves names and photos out; this keeps them out of every page's source
 * whatever the API sends.
 */
export function withoutTeamIdentity(content: PageContentMap): PageContentMap {
  const about = content.about;
  if (!about) return content;
  const strip = (block: typeof about.vi) =>
    block?.teamMembers
      ? {
          ...block,
          teamMembers: block.teamMembers.map((member) => {
            if (!member) return member;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { name, image, ...rest } = member;
            return rest;
          }),
        }
      : block;
  return { ...content, about: { vi: strip(about.vi), en: strip(about.en) } };
}
