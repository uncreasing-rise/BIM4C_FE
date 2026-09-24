import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import ts from "typescript";
import {
  DEFAULT_REVALIDATION_TAGS,
  sanitizeTags,
  secretMatches,
} from "../lib/security/revalidation.ts";

const root = resolve(import.meta.dirname, "..");

// auth.ts uses the "@/" alias, so transpile it with a stubbed env module.
function loadAdminAuth() {
  const source = ts.transpileModule(readFileSync(resolve(root, "features/admin/auth.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const cjs = { exports: {} };
  const stubs = { "@/lib/config/env": { env: { apiUrl: "" } } };
  new Function("require", "module", "exports", source)((name) => stubs[name], cjs, cjs.exports);
  return cjs.exports;
}

test("revalidation secret comparison requires an exact match", () => {
  const secret = "s".repeat(40);
  assert.equal(secretMatches(secret, secret), true);
  assert.equal(secretMatches(`${secret}x`, secret), false);
  assert.equal(secretMatches("", secret), false);
  assert.equal(secretMatches(null, secret), false);
  assert.equal(secretMatches(secret, undefined), false);
});

test("revalidation tags are validated, de-duplicated and capped", () => {
  assert.deepEqual(sanitizeTags(undefined), [...DEFAULT_REVALIDATION_TAGS]);
  assert.deepEqual(sanitizeTags([]), [...DEFAULT_REVALIDATION_TAGS]);
  assert.deepEqual(
    sanitizeTags(["projects", "projects", "project-cau-rong", "../etc", "UPPER", 42, "a b"]),
    ["projects", "project-cau-rong"],
  );
  const many = Array.from({ length: 200 }, (_, index) => `tag-${index}`);
  assert.equal(sanitizeTags(many).length, 50);
});

test("admin permission checks fail closed without an identity", () => {
  const { can } = loadAdminAuth();
  assert.equal(can(null, "projects.read"), false);
  assert.equal(can({ roles: ["EDITOR"], permissions: ["projects.read"] }, "projects.read"), true);
  assert.equal(can({ roles: ["EDITOR"], permissions: ["projects.read"] }, "users.read"), false);
  assert.equal(can({ roles: ["ADMIN"], permissions: [] }, "users.read"), true);
});
