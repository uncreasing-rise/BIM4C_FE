// Performance harness: node test/perf/stress.mjs
// Generates the synthetic stress tower and times each viewer stage with the
// real code (parse, draw batching, clash detection). Not part of npm test.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import * as BVH from "three-mesh-bvh";
import { generateStressIfc } from "../fixtures/ifc/generate-ifc.mjs";

const FE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(FE + "/package.json");
const ts = require("typescript");
const cache = new Map();
function load(file) {
  const path = resolve(FE, file.endsWith(".ts") ? file : file + ".ts");
  if (cache.has(path)) return cache.get(path);
  const mod = { exports: {} };
  cache.set(path, mod.exports);
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", code)(
    (name) => (name === "three" ? THREE : name === "three-mesh-bvh" ? BVH : name.startsWith(".") ? load(resolve(dirname(path), name)) : require(name)),
    mod,
    mod.exports,
  );
  return mod.exports;
}
const IFC = require("web-ifc");
const { parseIfcData } = load("components/bim-viewer/ifc-parser");
const { buildElementBatches } = load("components/bim-viewer/render-batches");
const { detectClashes, clashCandidates } = load("components/bim-viewer/clash-detection");

const api = new IFC.IfcAPI();
api.SetWasmPath(FE + "/node_modules/web-ifc/", true);
await api.Init();
const data = new TextEncoder().encode(generateStressIfc());
let t = performance.now();
const model = parseIfcData(api, data, "stress.ifc");
console.log(`parse: ${model.elements.length} elements in ${(performance.now() - t).toFixed(0)} ms`, model.diagnostics);

t = performance.now();
const material = new THREE.MeshStandardMaterial();
const batches = await buildElementBatches(model.elements, () => material);
console.log(`batches: ${batches.batches.size} draw batches, ${(batches.bytes / 1048576).toFixed(1)} MB, ${(performance.now() - t).toFixed(0)} ms`);

const placed = [{ key: "m", model, placement: { position: [0, 0, 0], rotationY: 0 } }];
t = performance.now();
const candidates = clashCandidates(placed);
console.log(`clash candidates (boxes): ${candidates.length} in ${(performance.now() - t).toFixed(0)} ms`);
t = performance.now();
const clashes = await detectClashes(placed, { maxResults: 100000 });
console.log(`clashes (mesh-verified): ${clashes.length} in ${(performance.now() - t).toFixed(0)} ms`);
const pairs = {};
for (const c of clashes) {
  const kinds = [c.title.split(" × ")[0].split(" ")[0], c.title.split(" × ")[1].split(" ")[0]].sort().join("×");
  pairs[kinds] = (pairs[kinds] ?? 0) + 1;
}
console.log("by pair:", pairs);
