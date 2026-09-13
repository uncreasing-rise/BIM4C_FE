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

test("SAMPLE_BIM_MODELS generates valid IFC entities and Psets", () => {
  const { SAMPLE_BIM_MODELS } = load("components/bim-viewer/sample-models");
  assert.ok(SAMPLE_BIM_MODELS.tower);
  assert.ok(SAMPLE_BIM_MODELS.steel);
  assert.ok(SAMPLE_BIM_MODELS.mep);

  // Tower verification
  const tower = SAMPLE_BIM_MODELS.tower;
  assert.ok(tower.elements.length > 0);
  assert.ok(tower.clashes.length > 0);
  assert.equal(typeof tower.defaultCamera.position[0], "number");

  for (const elem of tower.elements) {
    assert.ok(elem.id);
    assert.ok(elem.guid);
    assert.ok(elem.ifcType.startsWith("Ifc"));
    assert.ok(["architecture", "structure", "mep", "clash"].includes(elem.discipline));
    assert.ok(Array.isArray(elem.position));
    assert.equal(elem.position.length, 3);
    assert.ok(Array.isArray(elem.size));
    assert.equal(elem.size.length, 3);
  }
});
