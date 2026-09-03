import type { ContentEntry } from "@/types/content";

export function selectRelatedContent(entry: ContentEntry, candidates: ContentEntry[], limit = 3): ContentEntry[] {
  const available = candidates.filter((item) => item.slug !== entry.slug);
  if (entry.relatedIds?.length) {
    const order = new Map(entry.relatedIds.map((id, index) => [id, index]));
    return available.filter((item) => item.id && order.has(item.id)).sort((a, b) => order.get(a.id!)! - order.get(b.id!)!).slice(0, limit);
  }
  return available.filter((item) => item.eyebrow === entry.eyebrow).slice(0, limit);
}
