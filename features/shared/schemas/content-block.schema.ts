import { z } from "zod";

const id = z.string().trim().min(1);
const text = z.string().trim().min(1);
export const isSafeMediaReference = (value: string) => /^\/(?!\/)/.test(value) || /^https:\/\//i.test(value) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(value);
const media = z.object({
  url: z.string().trim().min(1).refine(isSafeMediaReference, "Ảnh phải là URL HTTPS hoặc đường dẫn nội bộ"),
  alt: z.string().trim().default(""),
  caption: z.string().trim().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ id, type: z.literal("rich-text"), heading: z.string().trim().optional(), content: text }),
  z.object({ id, type: z.literal("image"), image: media }),
  z.object({ id, type: z.literal("gallery"), images: z.array(media).min(1).max(24) }),
  z.object({ id, type: z.literal("quote"), quote: text, author: z.string().trim().optional() }),
  z.object({ id, type: z.literal("feature-list"), heading: z.string().trim().optional(), items: z.array(text).min(1).max(50), ordered: z.boolean().default(false) }),
  z.object({ id, type: z.literal("video"), url: text.refine(isSafeMediaReference, "Video phải là URL HTTPS hoặc đường dẫn nội bộ"), title: z.string().trim().optional() }),
  z.object({ id, type: z.literal("divider") }),
]);

export const contentBlocksSchema = z.array(contentBlockSchema).max(100);
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ContentMediaBlock = z.infer<typeof media>;

export function parseContentBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((block) => {
    const parsed = contentBlockSchema.safeParse(block);
    return parsed.success ? [parsed.data] : [];
  });
}
