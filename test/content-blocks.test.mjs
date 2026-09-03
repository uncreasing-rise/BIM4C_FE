import assert from "node:assert/strict";
import test from "node:test";
import { contentBlockSchema, parseContentBlocks } from "../features/shared/schemas/content-block.schema.ts";

test("validates supported structured content blocks", () => {
  const block = contentBlockSchema.parse({ id: "intro", type: "rich-text", heading: "Mở đầu", content: "Nội dung tiếng Việt" });
  assert.equal(block.type, "rich-text");
});

test("drops unknown and malformed blocks without crashing", () => {
  const blocks = parseContentBlocks([{ id: "x", type: "unknown" }, { id: "empty", type: "rich-text", content: "" }, { id: "line", type: "divider" }]);
  assert.deepEqual(blocks, [{ id: "line", type: "divider" }]);
});

test("rejects empty galleries and unsafe media URLs", () => {
  assert.equal(contentBlockSchema.safeParse({ id: "gallery", type: "gallery", images: [] }).success, false);
  assert.equal(contentBlockSchema.safeParse({ id: "image", type: "image", image: { url: "javascript:alert(1)", alt: "x" } }).success, false);
});
