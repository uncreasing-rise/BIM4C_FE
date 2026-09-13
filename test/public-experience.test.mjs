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

test("All returns every project and localized filters match legacy values", () => {
  const { filterProjects } = load(
    "features/projects/selectors/filter-projects",
  );
  const projects = [
    {
      title: "Lumi Hanoi",
      category: "Nhà cao tầng",
      location: "Hà Nội",
      year: "2025",
      status: "Đang thi công",
    },
    {
      title: "Factory",
      category: "Industrial",
      location: "Hai Phong",
      year: "2026",
      status: "Completed",
    },
  ];
  assert.equal(
    filterProjects(projects, {
      category: "All",
      location: "All",
      year: "All",
      status: "All",
    }).length,
    2,
  );
  assert.equal(
    filterProjects(projects, {
      category: "High-rise",
      location: "Hanoi",
      status: "In delivery",
      search: "  LUMI  ",
    }).length,
    1,
  );
  assert.equal(
    filterProjects(projects, { category: "Industrial", year: "2025" }).length,
    0,
  );
});

test("English content translates structured copy but preserves identifiers and editorial changes", () => {
  const { englishContent } = load("lib/content/english-content");
  const original = {
    title: "Tư vấn BIM",
    slug: "tu-van-bim",
    id: "keep-id",
    image: "/images/example.jpg",
    sections: [
      {
        title: "Phạm vi dịch vụ",
        body: "Khảo sát hiện trạng, mục tiêu và mức độ sẵn sàng",
      },
    ],
    contentBlocks: [
      {
        id: "block-a",
        type: "rich-text",
        heading: "Sản phẩm bàn giao",
        content: "BEP, EIR hoặc bộ tiêu chuẩn áp dụng theo phạm vi",
      },
    ],
  };
  const translated = englishContent(original);
  assert.equal(translated.title, "BIM Consulting");
  assert.equal(translated.sections[0].title, "Scope of services");
  assert.equal(translated.contentBlocks[0].heading, "What you receive");
  assert.equal(translated.contentBlocks[0].id, "block-a");
  assert.equal(translated.slug, original.slug);
  assert.equal(translated.image, original.image);
  assert.equal(original.title, "Tư vấn BIM");
  assert.equal(
    englishContent({
      ...original,
      description: "An editor's new English description.",
    }).description,
    "An editor's new English description.",
  );
});

test("all bundled catalogue copy is English after mapping", () => {
  const { englishContent } = load("lib/content/english-content");
  const entries = Object.values(load("mocks/content-data")).flat();
  for (const entry of entries) {
    const translated = englishContent(entry);
    const copy = [
      translated.title,
      translated.description,
      translated.eyebrow,
      ...translated.highlights,
      ...translated.sections.flatMap((section) => [
        section.title,
        section.body,
      ]),
    ].join(" ");
    assert.equal(/[À-ỹĐđ]/u.test(copy), false, entry.slug);
  }
});

test("page normalization preserves search and filters", () => {
  const { normalizedPageRedirect } = load("lib/seo/listing");
  assert.equal(
    normalizedPageRedirect(
      "/du-an",
      { page: "1", category: "Industrial", q: "factory" },
      8,
      6,
    ),
    "/du-an?category=Industrial&q=factory",
  );
  assert.equal(
    normalizedPageRedirect(
      "/du-an",
      { page: "99", category: "Industrial" },
      8,
      6,
    ),
    "/du-an?category=Industrial&page=2",
  );
  assert.equal(
    normalizedPageRedirect("/du-an", { page: "2", q: "project" }, 8, 6),
    null,
  );
});
