import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cache = new Map();
function load(path) {
  let filename = resolve(root, path);
  if (!existsSync(filename)) filename += ".ts";
  if (cache.has(filename)) return cache.get(filename);
  if (filename.endsWith(".json"))
    return JSON.parse(readFileSync(filename, "utf8"));
  const cjsModule = { exports: {} };
  cache.set(filename, cjsModule.exports);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (name) =>
    name.startsWith("@/")
      ? load(name.slice(2))
      : name.startsWith(".")
        ? load(resolve(dirname(filename), name))
        : require(name);
  new Function("require", "module", "exports", source)(
    localRequire,
    cjsModule,
    cjsModule.exports,
  );
  return cjsModule.exports;
}

test("listing page numbers have one canonical form", () => {
  const { canonicalPageQuery } = load("lib/seo/page-param");
  const fix = (query) => {
    const result = canonicalPageQuery(new URLSearchParams(query));
    return result === null ? null : result.toString();
  };
  assert.equal(fix("page=2"), null);
  assert.equal(fix("category=BIM&page=3"), null);
  assert.equal(fix(""), null);
  assert.equal(fix("page=1&q=bim"), "q=bim");
  assert.equal(fix("page=02"), "page=2");
  assert.equal(fix("page=abc&category=BIM"), "category=BIM");
  assert.equal(fix("page=0"), "");
  assert.equal(fix("page=-3"), "");
  assert.equal(fix("page=2&page=5"), "page=2");
});

test("every listing fetches and counts pages with the same size", () => {
  const { PAGE_SIZE } = load("lib/seo/page-param");
  const listings = { "dich-vu": "services", "du-an": "projects", "khoa-hoc": "courses", "chuyen-mon": "posts", "tin-tuc": "posts", blog: "posts" };
  for (const [dir, key] of Object.entries(listings)) {
    const source = readFileSync(resolve(root, `app/[locale]/(public)/${dir}/page.tsx`), "utf8");
    assert.match(source, new RegExp("limit: PAGE_SIZE\\." + key + ","), `${dir} fetches PAGE_SIZE.${key}`);
    assert.match(source, new RegExp("\\.meta\\.total,\\s*PAGE_SIZE\\." + key + ","), `${dir} counts pages with PAGE_SIZE.${key}`);
    assert.doesNotMatch(source, /limit: \d+/, `${dir} has no hard-coded page size`);
    assert.ok(PAGE_SIZE[key] > 0);
  }
  assert.equal(PAGE_SIZE.posts, 5, "posts: one featured story plus four beside it");
});
