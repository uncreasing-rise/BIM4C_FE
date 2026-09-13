import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";
import type { ContentEntry } from "@/types/content";

export function slugifyHeading(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function legacyBlocks(entry: ContentEntry): ContentBlock[] {
  return entry.sections.flatMap((section, index) => {
    const slug = slugifyHeading(section.title) || `section-${index + 1}`;
    const blocks: ContentBlock[] = [
      {
        id: slug,
        type: "rich-text",
        heading: section.title,
        content: section.body,
      },
    ];
    if (section.images?.length === 1)
      blocks.push({
        id: `${slug}-image`,
        type: "image",
        image: section.images[0],
      });
    if ((section.images?.length ?? 0) > 1)
      blocks.push({
        id: `${slug}-gallery`,
        type: "gallery",
        images: section.images!,
      });
    if (section.unorderedList?.length)
      blocks.push({
        id: `${slug}-features`,
        type: "feature-list",
        items: section.unorderedList,
        ordered: false,
      });
    if (section.orderedList?.length)
      blocks.push({
        id: `${slug}-steps`,
        type: "feature-list",
        items: section.orderedList,
        ordered: true,
      });
    if (section.quote)
      blocks.push({
        id: `${slug}-quote`,
        type: "quote",
        quote: section.quote,
      });
    if (section.videoUrl)
      blocks.push({
        id: `${slug}-video`,
        type: "video",
        url: section.videoUrl,
      });
    return blocks;
  });
}
