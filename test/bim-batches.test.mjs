import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import * as THREE from "three";
import * as BVH from "three-mesh-bvh";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cache = new Map();

function load(path) {
  let filename = resolve(root, path);
  if (!existsSync(filename)) filename += ".ts";
  if (cache.has(filename)) return cache.get(filename);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const cjs = { exports: {} };
  cache.set(filename, cjs.exports);
  // three and three-mesh-bvh must be the same ESM instances the library extends.
  const localRequire = (name) =>
    name === "three" ? THREE : name === "three-mesh-bvh" ? BVH : name.startsWith(".") ? load(resolve(dirname(filename), name)) : require(name);
  new Function("require", "module", "exports", source)(localRequire, cjs, cjs.exports);
  return cjs.exports;
}

const b = load("components/bim-viewer/render-batches");

/** Two quads sharing nothing: group 0 is red (vertices 0-3), group 1 blue (4-7). */
function twoMaterialElement(id, x) {
  const positions = new Float32Array([
    0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0,
    0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
  ]);
  return {
    id, guid: id, name: id, ifcType: "IfcWall", discipline: "architecture", storey: "", material: "",
    color: "#ff0000", psets: [], position: [x, 0, 0], size: [1, 1, 1],
    geometryData: {
      positions,
      normals: new Float32Array(positions.length).fill(0.5),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]),
      groups: [
        { start: 0, count: 6, color: "#ff0000", opacity: 1 },
        { start: 6, count: 6, color: "#0000ff", opacity: 1 },
      ],
    },
  };
}

const clash = load("components/bim-viewer/clash-detection");

/** geometryData from three geometries translated to their offsets (element-local). */
function meshElement(id, discipline, position, pieces) {
  const merged = [];
  for (const [w, h, d, x] of pieces) merged.push(new THREE.BoxGeometry(w, h, d).translate(x, 0, 0).toNonIndexed());
  const positions = new Float32Array(merged.reduce((n, g) => n + g.getAttribute("position").array.length, 0));
  let offset = 0;
  for (const g of merged) {
    positions.set(g.getAttribute("position").array, offset);
    offset += g.getAttribute("position").array.length;
  }
  const indices = new Uint32Array(positions.length / 3).map((_, i) => i);
  const box = new THREE.Box3().setFromArray(positions);
  return {
    id, guid: id, name: id, ifcType: "IfcProxy", discipline, storey: "", material: "", color: "#fff", psets: [],
    position, size: box.getSize(new THREE.Vector3()).toArray(),
    geometryData: { positions, indices },
  };
}
const placed = (key, elements) => ({
  key,
  placement: { position: [0, 0, 0], rotationY: 0 },
  model: { id: key, description: key, elements, elementsCount: elements.length, clashes: [], defaultCamera: { position: [0, 0, 5], target: [0, 0, 0] } },
});

test("clash check confirms real mesh intersections and drops box-only overlaps", async () => {
  // A sleeve-like element: two blocks with a gap; its box spans the gap.
  const sleeve = meshElement("sleeve", "structure", [0, 0, 0], [[1, 1, 1, -1.5], [1, 1, 1, 1.5]]);
  const inGap = meshElement("duct-in-gap", "mep", [0, 0, 0], [[0.5, 0.5, 0.5, 0]]);
  const throughBlock = meshElement("duct-hit", "mep", [1.5, 0, 0], [[0.5, 0.5, 0.5, 0]]);
  const models = [placed("m1", [sleeve, inGap, throughBlock])];
  assert.equal(clash.detectAabbClashes(models).length, 2, "boxes alone report both");
  const verified = await clash.detectClashes(models);
  assert.deepEqual(verified.map((c) => c.elementB === "duct-hit" || c.elementA === "duct-hit"), [true]);
});

test("a clash test between two files only pairs A with B, filtered by type", async () => {
  const typed = (type, e) => ({ ...e, ifcType: type });
  const beam = typed("IfcBeam", meshElement("beam", "structure", [0, 0, 0], [[4, 0.5, 0.5, 0]]));
  const column = typed("IfcColumn", meshElement("column", "structure", [0.5, 0, 0], [[0.4, 3, 0.4, 0]]));
  const duct = typed("IfcDuctSegment", meshElement("duct", "mep", [0.5, 0, 0], [[0.3, 0.3, 3, 0]]));
  const pipe = typed("IfcPipeSegment", meshElement("pipe", "mep", [-1, 0, 0], [[0.1, 0.1, 3, 0]]));
  // A third file overlapping everything must be left out.
  const other = typed("IfcSlab", meshElement("slab", "architecture", [0, 0, 0], [[6, 0.2, 6, 0]]));
  const models = [placed("s", [beam, column]), placed("m", [duct, pipe]), placed("x", [other])];
  const all = await clash.detectClashes(models, { a: { modelKey: "m" }, b: { modelKey: "s" } });
  assert.deepEqual(all.map((c) => [c.elementA, c.elementB]).sort(), [["duct", "beam"], ["duct", "column"], ["pipe", "beam"]].sort());
  assert.ok(all.every((c) => c.modelA === "m" && c.modelB === "s" && c.kind === "hard"), "A side first");
  const ductsOnly = await clash.detectClashes(models, {
    a: { modelKey: "m", types: ["IfcDuctSegment"] },
    b: { modelKey: "s", types: ["IfcBeam"] },
  });
  assert.deepEqual(ductsOnly.map((c) => [c.typeA, c.typeB]), [["IfcDuctSegment", "IfcBeam"]]);
});

test("clearance finds near misses by their real gap; same-discipline pairs are opt-in", async () => {
  const wall = meshElement("wall", "architecture", [0, 0, 0], [[1, 1, 1, 0]]);
  const near = meshElement("near", "mep", [1.03, 0, 0], [[1, 1, 1, 0]]); // 30 mm gap
  const models = [placed("a", [wall]), placed("b", [near])];
  const sets = { a: { modelKey: "a" }, b: { modelKey: "b" } };
  assert.equal((await clash.detectClashes(models, sets)).length, 0, "no hard clash");
  const within = await clash.detectClashes(models, { ...sets, rules: { kind: "clearance", clearance: 0.05 } });
  assert.equal(within.length, 1);
  assert.ok(Math.abs(within[0].distance - 0.03) < 1e-4, `gap ${within[0].distance}`);
  assert.equal(within[0].kind, "clearance");
  assert.equal((await clash.detectClashes(models, { ...sets, rules: { kind: "clearance", clearance: 0.02 } })).length, 0);
  const twin = meshElement("twin", "architecture", [0.5, 0, 0], [[1, 1, 1, 0]]);
  const same = [placed("a", [wall]), placed("b", [twin])];
  assert.equal((await clash.detectClashes(same, sets)).length, 0, "same discipline skipped by default");
  assert.equal((await clash.detectClashes(same, { ...sets, rules: { ignoreSameDiscipline: false } })).length, 1);
});

test("clash candidates stay fast on large models and results are ranked", async () => {
  const elements = [];
  for (let i = 0; i < 20000; i++)
    elements.push({
      id: `e${i}`, guid: `e${i}`, name: `e${i}`, ifcType: "IfcProxy",
      discipline: i % 2 ? "mep" : "structure", storey: "", material: "", color: "#fff", psets: [],
      position: [(i % 200) * 1.5, Math.floor(i / 200) * 0.9, 0], size: [2, 1, 1],
    });
  const started = performance.now();
  const clashes = await clash.detectClashes([placed("m", elements)], { verifyMeshes: false });
  const elapsed = performance.now() - started;
  assert.ok(elapsed < 2000, `took ${elapsed.toFixed(0)} ms`);
  assert.equal(clashes.length, 500);
  const rank = { high: 0, medium: 1, low: 2 };
  for (let i = 1; i < clashes.length; i++)
    assert.ok(rank[clashes[i - 1].severity] <= rank[clashes[i].severity], "most severe first");
});

test("long work yields without timers, which background tabs throttle to 1 per second", async () => {
  const { yieldToBrowser, timeSlicer } = load("components/bim-viewer/yield");
  const realSetTimeout = globalThis.setTimeout;
  let timers = 0;
  globalThis.setTimeout = (...args) => (timers++, realSetTimeout(...args));
  try {
    for (let i = 0; i < 20; i++) await yieldToBrowser();
    const slice = timeSlicer(0);
    for (let i = 0; i < 20; i++) await slice();
  } finally {
    globalThis.setTimeout = realSetTimeout;
  }
  assert.equal(timers, 0);
});

test("a part keeps only the vertices it uses, re-indexed from zero", () => {
  const e = twoMaterialElement("a", 0);
  const g = b.compactPart({ ...e.geometryData, start: 6, count: 6 });
  assert.equal(g.getAttribute("position").count, 4);
  assert.deepEqual([...g.index.array], [0, 1, 2, 0, 2, 3]);
  assert.deepEqual([...g.getAttribute("position").array.slice(0, 3)], [0, 0, 1]);
});

test("an opaque model is drawn as one batch, not one mesh per element", async () => {
  const elements = Array.from({ length: 50 }, (_, i) => twoMaterialElement(`e${i}`, i * 2));
  const materials = new Map();
  const result = await b.buildElementBatches(elements, (color, opacity) => {
    const key = `${color}:${opacity}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial());
    return materials.get(key);
  });
  assert.equal(result.batches.size, 1, "colours ride on instances: one draw batch");
  assert.equal(result.slots.size, 50);
  assert.equal(result.slots.get("e7").length, 2, "one slot per material part");
  const [red] = result.slots.get("e7");
  const m = new THREE.Matrix4();
  red.batch.getMatrixAt(red.instance, m);
  assert.deepEqual(new THREE.Vector3().setFromMatrixPosition(m).toArray(), [14, 0, 0]);
  assert.ok(result.bytes > 0);
});

test("hiding, selecting and exploding one element only touches its own instances", async () => {
  const elements = [twoMaterialElement("a", 0), twoMaterialElement("b", 5)];
  const shared = new THREE.MeshStandardMaterial();
  const { slots } = await b.buildElementBatches(elements, () => shared);
  b.applySlotState(slots.get("a"), false, false, new THREE.Vector3());
  b.applySlotState(slots.get("b"), true, true, new THREE.Vector3(0, 2, 0));
  for (const slot of slots.get("a")) assert.equal(slot.batch.getVisibleAt(slot.instance), false);
  const [bRed] = slots.get("b");
  assert.equal(bRed.batch.getVisibleAt(bRed.instance), true);
  const color = new THREE.Color();
  bRed.batch.getColorAt(bRed.instance, color);
  assert.notEqual(color.getHex(), 0xff0000, "selection tints the instance");
  const m = new THREE.Matrix4();
  bRed.batch.getMatrixAt(bRed.instance, m);
  assert.deepEqual(new THREE.Vector3().setFromMatrixPosition(m).toArray(), [5, 2, 0]);
  // Deselecting restores the exact element colour.
  b.applySlotState(slots.get("b"), true, false, new THREE.Vector3());
  bRed.batch.getColorAt(bRed.instance, color);
  assert.equal(color.getHex(), 0xff0000);
});

test("clash review statuses are kept in the session and validated", () => {
  const { sessionSchema } = load("components/bim-viewer/session-schema");
  const ok = sessionSchema.safeParse({ clashStatus: { "local-m1/ifc-1-m2/ifc-9": "resolved" } });
  assert.ok(ok.success);
  assert.ok(!sessionSchema.safeParse({ clashStatus: { x: "done" } }).success, "unknown status");
});
