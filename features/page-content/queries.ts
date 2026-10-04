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
    return withoutLegalEntity(withoutTeamPhotos(response?.data ?? {}));
  } catch {
    return {};
  }
}

/**
 * The About page shows the team by name, role and expertise, without photos.
 * The API already leaves photos out; this keeps them out of every page's
 * source whatever the API sends.
 */
export function withoutTeamPhotos(content: PageContentMap): PageContentMap {
  const about = content.about;
  if (!about) return content;
  const strip = (block: typeof about.vi) =>
    block?.teamMembers
      ? {
          ...block,
          teamMembers: block.teamMembers.map((member) => {
            if (!member) return member;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { image, ...rest } = member;
            return rest;
          }),
        }
      : block;
  return { ...content, about: { vi: strip(about.vi), en: strip(about.en) } };
}

/**
 * Legal-entity details (registered and international names, legal
 * representative, copyright holder) are not published: only the headquarters
 * address reaches pages, whatever the API sends.
 */
export function withoutLegalEntity(content: PageContentMap): PageContentMap {
  const company = content.company;
  if (!company) return content;
  const strip = (block: typeof company.vi) => {
    const headquarters = block?.enterpriseInfo?.headquarters;
    return headquarters ? { enterpriseInfo: { headquarters } } : {};
  };
  return {
    ...content,
    company: { vi: strip(company.vi), en: strip(company.en) },
  };
}
