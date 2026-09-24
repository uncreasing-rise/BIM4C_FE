import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Transpiles a dependency-free TS module (dictionaries, config) and returns its exports. */
function loadModule(path, stubs = {}) {
  const source = ts.transpileModule(readFileSync(resolve(root, path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const cjs = { exports: {} };
  new Function("require", "module", "exports", source)((name) => stubs[name] ?? {}, cjs, cjs.exports);
  return cjs.exports;
}

const { negotiateLocale, DEFAULT_LOCALE } = loadModule("lib/i18n/config.ts");
const { uiEn } = loadModule("lib/i18n/dictionaries/ui.en.ts");
const { uiVi } = loadModule("lib/i18n/dictionaries/ui.vi.ts");
const { enDictionary } = loadModule("lib/i18n/dictionaries/en.ts");
const { viDictionary } = loadModule("lib/i18n/dictionaries/vi.ts");

test("Accept-Language negotiation honours weights and falls back to the default locale", () => {
  assert.equal(DEFAULT_LOCALE, "en");
  assert.equal(negotiateLocale("vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"), "vi");
  assert.equal(negotiateLocale("en-US,en;q=0.9,vi;q=0.8"), "en");
  assert.equal(negotiateLocale("vi"), "vi");
  assert.equal(negotiateLocale("fr-FR,fr;q=0.9"), "en");
  assert.equal(negotiateLocale("fr-FR,vi;q=0.5"), "vi");
  assert.equal(negotiateLocale("en;q=0.2,vi;q=0.8"), "vi");
  assert.equal(negotiateLocale("vi;q=0"), "en");
  assert.equal(negotiateLocale(""), "en");
  assert.equal(negotiateLocale(null), "en");
  assert.equal(negotiateLocale("*"), "en");
});

function assertSameShape(a, b, path = "") {
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), `keys differ at "${path || "root"}"`);
  for (const key of Object.keys(a)) {
    const p = path ? `${path}.${key}` : key;
    assert.equal(typeof a[key], typeof b[key], `type differs at "${p}"`);
    if (a[key] && typeof a[key] === "object" && !Array.isArray(a[key])) assertSameShape(a[key], b[key], p);
  }
}

function emptyStrings(value, path = "") {
  if (typeof value === "string") return value.trim() ? [] : [path];
  if (typeof value === "function") return emptyStrings(String(value(1, 1, 1)), path);
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => emptyStrings(v, path ? `${path}.${k}` : k));
  return [];
}

test("component UI strings exist in both languages with the same structure", () => {
  assertSameShape(uiEn, uiVi);
  assert.equal(uiVi.formats.modelsInScene(3), "3 mô hình trong cảnh");
  assert.equal(uiEn.formats.modelsInScene(1), "1 model in scene");
  assert.equal(uiEn.formats.modelsInScene(2), "2 models in scene");
});

test("no dictionary contains an empty translation", () => {
  for (const [name, dictionary] of Object.entries({ enDictionary, viDictionary, uiEn, uiVi })) {
    assert.deepEqual(emptyStrings(dictionary), [], `${name} has empty strings`);
  }
});

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(p);
  }
  return out;
}

test("components take translations from the dictionaries, not inline locale ternaries", () => {
  // `locale === "vi" ? "…" : "…"` (or isVi / vi) with a literal branch is a
  // translation that bypasses the dictionary tests above. Intl locale codes
  // and URL paths are not translations and are allowed.
  const inline = /(?:locale === "vi"|current === "vi"|\bisVi\b|(?<![.\w])vi\b)\s*\?\s*(["'`])((?:(?!\1)[^\\\n]|\\.)*)\1/g;
  const allowed = /^(vi-VN|en-US|en-GB|vi|en)$|^\//;
  const offenders = [];
  for (const file of walk(join(root, "components"))) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(inline)) {
      if (allowed.test(match[2])) continue;
      const line = source.slice(0, match.index).split("\n").length;
      offenders.push(`${relative(root, file).replaceAll("\\", "/")}:${line}  ${match[0].slice(0, 80)}`);
    }
  }
  assert.deepEqual(offenders, [], `Move these strings to lib/i18n/dictionaries/ui.{en,vi}.ts:\n${offenders.join("\n")}`);
});
