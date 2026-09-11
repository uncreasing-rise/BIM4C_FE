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
  const module = { exports: {} };
  cache.set(filename, module.exports);
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
    module,
    module.exports,
  );
  return module.exports;
}

test("i18n config exports primary English and secondary Vietnamese locales", () => {
  const { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_LABELS } = load("lib/i18n/config");
  assert.equal(DEFAULT_LOCALE, "en");
  assert.deepEqual(SUPPORTED_LOCALES, ["en", "vi"]);
  assert.equal(LOCALE_LABELS.en.code, "EN");
  assert.equal(LOCALE_LABELS.vi.code, "VI");
});

test("English and Vietnamese dictionaries have identical top-level structure and keys", () => {
  const { enDictionary } = load("lib/i18n/dictionaries/en");
  const { viDictionary } = load("lib/i18n/dictionaries/vi");

  assert.ok(enDictionary);
  assert.ok(viDictionary);

  const enKeys = Object.keys(enDictionary).sort();
  const viKeys = Object.keys(viDictionary).sort();
  assert.deepEqual(enKeys, viKeys);

  for (const key of enKeys) {
    const enSubKeys = Object.keys(enDictionary[key]).sort();
    const viSubKeys = Object.keys(viDictionary[key]).sort();
    assert.deepEqual(enSubKeys, viSubKeys, `Dictionary section "${key}" keys do not match`);
  }
});

test("localizeContent accurately returns English translated vs raw Vietnamese content", () => {
  const { localizeContent } = load("lib/i18n/localize");
  const sample = {
    title: "Tư vấn BIM",
    description: "Giải pháp chiến lược",
  };

  const enResult = localizeContent(sample, "en");
  assert.equal(enResult.title, "BIM Consulting");

  const viResult = localizeContent(sample, "vi");
  assert.equal(viResult.title, "Tư vấn BIM");
});

test("localizeContent prioritizes explicit bilingual fields (title_vi, description_vi, etc.)", () => {
  const { localizeContent } = load("lib/i18n/localize");
  const bilingualEntry = {
    title: "Custom English Title",
    description: "Custom English Description",
    title_vi: "Tiêu đề tiếng Việt do người dùng nhập",
    description_vi: "Mô tả tiếng Việt chi tiết",
    eyebrow: "SOLUTIONS",
    eyebrow_vi: "GIẢI PHÁP",
  };

  const enResult = localizeContent(bilingualEntry, "en");
  assert.equal(enResult.title, "Custom English Title");
  assert.equal(enResult.description, "Custom English Description");

  const viResult = localizeContent(bilingualEntry, "vi");
  assert.equal(viResult.title, "Tiêu đề tiếng Việt do người dùng nhập");
  assert.equal(viResult.description, "Mô tả tiếng Việt chi tiết");
  assert.equal(viResult.eyebrow, "GIẢI PHÁP");
});

