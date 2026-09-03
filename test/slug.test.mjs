import assert from "node:assert/strict";
import test from "node:test";
import { slugify } from "../lib/utils/slug.ts";

test("normalizes Vietnamese titles to URL-safe slugs", () => {
  assert.equal(slugify("Đào tạo BIM thực chiến"), "dao-tao-bim-thuc-chien");
  assert.equal(slugify("  Dự án số 01  "), "du-an-so-01");
});
