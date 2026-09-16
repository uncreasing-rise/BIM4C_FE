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

test("BIM Viewer route is properly configured in ROUTES", () => {
  const { ROUTES } = load("constants/routes");
  assert.equal(ROUTES.bimViewer, "/bim-viewer");
});

test("viewer starts with no fabricated building or clash results", () => {
  const { EMPTY_BIM_MODEL } = load("components/bim-viewer/empty-model");
  assert.deepEqual(EMPTY_BIM_MODEL.elements, []);
  assert.deepEqual(EMPTY_BIM_MODEL.clashes, []);
});
