// zod/mini (tree-shakable zod v4): this schema is reached from public client
// components through the content mappers, so the classic API would ship
// ~60 KB gzipped to every page.
import * as z from "zod/mini";

const trimmed = () => z.string().check(z.trim());
const id = trimmed().check(z.minLength(1));
const text = trimmed().check(z.minLength(1));
export const isSafeMediaReference = (value: string) => /^\/(?!\/)/.test(value) || /^https:\/\//i.test(value) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(value);
const media = z.object({
  url: trimmed().check(z.minLength(1), z.refine(isSafeMediaReference, "Ảnh phải là URL HTTPS hoặc đường dẫn nội bộ")),
  alt: z._default(trimmed(), ""),
  caption: z.optional(trimmed()),
  width: z.optional(z.int().check(z.positive())),
  height: z.optional(z.int().check(z.positive())),
});

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ id, type: z.literal("rich-text"), heading: z.optional(trimmed()), content: text }),
  z.object({ id, type: z.literal("image"), image: media }),
  z.object({ id, type: z.literal("gallery"), images: z.array(media).check(z.minLength(1), z.maxLength(24)) }),
  z.object({ id, type: z.literal("quote"), quote: text, author: z.optional(trimmed()) }),
  z.object({ id, type: z.literal("feature-list"), heading: z.optional(trimmed()), items: z.array(text).check(z.minLength(1), z.maxLength(50)), ordered: z._default(z.boolean(), false) }),
  z.object({ id, type: z.literal("video"), url: text.check(z.refine(isSafeMediaReference, "Video phải là URL HTTPS hoặc đường dẫn nội bộ")), title: z.optional(trimmed()) }),
  z.object({ id, type: z.literal("divider") }),
]);

export const contentBlocksSchema = z.array(contentBlockSchema).check(z.maxLength(100));
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ContentMediaBlock = z.infer<typeof media>;

export function parseContentBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((block) => {
    const parsed = contentBlockSchema.safeParse(block);
    return parsed.success ? [parsed.data] : [];
  });
}
