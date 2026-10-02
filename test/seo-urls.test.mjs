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

test("each post has one public URL: news categories under /tin-tuc, the rest under /chuyen-mon", () => {
  const { postGroup, postPath } = load("features/blog/post-group");
  assert.equal(postGroup({ categorySlug: "su-kien" }), "news");
  assert.equal(postPath({ slug: "khai-truong", categorySlug: "tin-tuc" }), "/tin-tuc/khai-truong");
  assert.equal(postGroup({ categorySlug: "quan-ly-du-an-bim" }), "technical");
  assert.equal(postPath({ slug: "bim-4d", categorySlug: "quan-ly-du-an-bim" }), "/chuyen-mon/bim-4d");
  assert.equal(postPath({ slug: "no-category" }), "/chuyen-mon/no-category");
});

test("the frontend's news categories match the backend's", () => {
  const { NEWS_SLUGS } = load("features/blog/post-group");
  const backend = readFileSync(resolve(root, "../BE/src/modules/posts/posts.service.ts"), "utf8");
  const listed = backend.match(/export const NEWS_SLUGS = \[([^\]]*)\]/)?.[1];
  assert.ok(listed, "NEWS_SLUGS not found in posts.service.ts");
  assert.deepEqual(NEWS_SLUGS, [...listed.matchAll(/'([^']+)'/g)].map((m) => m[1]));
});

test("page titles exist in both languages and never repeat the brand", () => {
  const { PAGE_META, withoutBrandSuffix } = load("lib/seo/page-meta");
  for (const [key, byLocale] of Object.entries(PAGE_META))
    for (const locale of ["vi", "en"]) {
      assert.ok(byLocale[locale]?.title && byLocale[locale]?.description, `${key}.${locale}`);
      assert.doesNotMatch(byLocale[locale].title, /BIM4C/, `${key}.${locale} title adds the brand itself`);
    }
  assert.notEqual(PAGE_META.about.vi.description, PAGE_META.about.en.description);
  assert.equal(withoutBrandSuffix("Ứng dụng BIM 4D | BIM4C | BIM4C"), "Ứng dụng BIM 4D");
  assert.equal(withoutBrandSuffix("BIM4C — BIM, Design & Training"), "BIM4C — BIM, Design & Training");
});
