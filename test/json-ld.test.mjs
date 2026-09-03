import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../lib/seo/json-ld.ts";

test("serializes JSON-LD without script-breaking literal angle brackets", () => {
  const result = serializeJsonLd({ name: '</script><script>alert("x")</script>' });
  assert.equal(result.includes("<"), false);
  assert.deepEqual(JSON.parse(result), { name: '</script><script>alert("x")</script>' });
});
