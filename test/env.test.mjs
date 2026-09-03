import assert from "node:assert/strict";
import test from "node:test";

import { isMockApiEnabled } from "../lib/config/env.ts";

test("mock API is enabled only by the exact explicit value true", () => {
  assert.equal(isMockApiEnabled("true"), true);
  assert.equal(isMockApiEnabled(undefined), false);
  assert.equal(isMockApiEnabled("false"), false);
  assert.equal(isMockApiEnabled("TRUE"), false);
  assert.equal(isMockApiEnabled("1"), false);
  assert.equal(isMockApiEnabled("yes"), false);
});
