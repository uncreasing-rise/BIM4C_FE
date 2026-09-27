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
    return response?.data ?? {};
  } catch {
    return {};
  }
}
