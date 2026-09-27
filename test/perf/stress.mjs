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

// Picking: every element as a BVH mesh, full raycast vs the pick index.
const { createElementMesh, getModelBounds } = load("components/bim-viewer/viewer-geometry");
const { PickIndex } = load("components/bim-viewer/pick-index");
const pool = new Map();
const shared = new Map();
const meshes = model.elements.map((e) => {
  const mesh = createElementMesh(e, pool, shared);
  if (!mesh.geometry.boundsTree) {
    mesh.geometry.computeBoundsTree = BVH.computeBoundsTree;
    mesh.geometry.computeBoundsTree();
  }
  mesh.updateMatrixWorld();
  return mesh;
});
const index = new PickIndex();
t = performance.now();
index.build(meshes);
console.log(`pick index: built over ${meshes.length} meshes in ${(performance.now() - t).toFixed(0)} ms`);
const b = getModelBounds(model);
const box = new THREE.Box3(new THREE.Vector3(...b.min), new THREE.Vector3(...b.max));
const centre = box.getCenter(new THREE.Vector3());
const extent = box.getSize(new THREE.Vector3()).length();
const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, extent * 20);
camera.position.copy(centre).add(new THREE.Vector3(extent, extent * 0.6, extent));
camera.lookAt(centre);
camera.updateMatrixWorld();
const raycaster = new THREE.Raycaster();
raycaster.firstHitOnly = true;
const rays = Array.from({ length: 200 }, (_, i) => new THREE.Vector2(((i * 37) % 160) / 100 - 0.8, ((i * 53) % 160) / 100 - 0.8));
t = performance.now();
for (const p of rays) {
  raycaster.setFromCamera(p, camera);
  raycaster.intersectObjects(meshes, false);
}
const brute = (performance.now() - t) / rays.length;
t = performance.now();
for (const p of rays) {
  raycaster.setFromCamera(p, camera);
  index.firstHit(raycaster, []);
}
console.log(`pick: full raycast ${brute.toFixed(2)} ms, pick index ${((performance.now() - t) / rays.length).toFixed(3)} ms per pick`);
