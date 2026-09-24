import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";
import ts from "typescript";
import * as THREE from "three";
import * as BVH from "three-mesh-bvh";
import { generateDemoIfc } from "./fixtures/ifc/generate-ifc.mjs";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();
function load(file) {
  const path = resolve(root, file.endsWith(".ts") ? file : `${file}.ts`);
  if (cache.has(path)) return cache.get(path);
  const mod = { exports: {} };
  cache.set(path, mod.exports);
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", code)(
    (name) =>
      name === "three"
        ? THREE
        : name === "three-mesh-bvh"
          ? BVH
          : name.startsWith(".")
            ? load(resolve(dirname(path), name))
            : require(name),
    mod,
    mod.exports,
  );
  return mod.exports;
}

const IFC = require("web-ifc");
const { parseIfcData } = load("components/bim-viewer/ifc-parser");
const fed = load("components/bim-viewer/federation");
const { buildFeatureEdges, edgeKey, snapPoint } = load("components/bim-viewer/snapping");

const api = new IFC.IfcAPI();
before(async () => await api.Init());
after(() => api.Dispose());

const lastId = (text) => Math.max(...[...text.matchAll(/^#(\d+)=/gm)].map((m) => Number(m[1])));
const appendLines = (text, lines) => text.replace("ENDSEC;\nEND-ISO", `${lines.join("\n")}\nENDSEC;\nEND-ISO`);

/** Moves the site placement to an IFC world coordinate (X east, Y north, Z up). */
function placeSiteAt(text, [x, y, z]) {
  const site = text.match(/#(\d+)=IFCLOCALPLACEMENT\(\$,(#\d+)\);/);
  const point = lastId(text) + 1;
  const axis = point + 1;
  return appendLines(text.replace(site[0], `#${site[1]}=IFCLOCALPLACEMENT($,#${axis});`), [
    `#${point}=IFCCARTESIANPOINT((${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}));`,
    `#${axis}=IFCAXIS2PLACEMENT3D(#${point},$,$);`,
  ]);
}

const parse = (text, name) => parseIfcData(api, new Uint8Array(Buffer.from(text)), name);
const worldCenterOf = (parsed, element, sceneOrigin) => {
  const placement = fed.resolvePlacement(
    { model: parsed, alignment: "shared", offset: { x: 0, y: 0, z: 0, rotationDeg: 0 } },
    sceneOrigin,
  );
  return fed.sceneToWorld(fed.applyPlacement(element.position, placement), sceneOrigin);
};

test("two files with shared survey coordinates land exactly where they were modelled", () => {
  const base = generateDemoIfc();
  const a = parse(placeSiteAt(base, [512345.678, 1234567.891, 12.5]), "a.ifc");
  const b = parse(placeSiteAt(base, [512385.678, 1234597.891, 12.5]), "b.ifc");
  const sceneOrigin = fed.modelOrigin(a);

  // Same element in both files: B was authored 40 m east and 30 m north of A.
  const elementA = a.elements[0];
  const elementB = b.elements.find((e) => e.guid === elementA.guid);
  const worldA = worldCenterOf(a, elementA, sceneOrigin);
  const worldB = worldCenterOf(b, elementB, sceneOrigin);
  assert.ok(Math.abs(worldB[0] - worldA[0] - 40) < 1e-3, `ΔX ${worldB[0] - worldA[0]}`);
  assert.ok(Math.abs(worldB[1] - worldA[1] - 30) < 1e-3, `ΔY ${worldB[1] - worldA[1]}`);
  assert.ok(Math.abs(worldB[2] - worldA[2]) < 1e-3);
  // Absolute survey coordinates survive (float64), not just the difference.
  assert.ok(worldA[0] > 512300 && worldA[0] < 512400, `X ${worldA[0]}`);
  assert.ok(worldA[1] > 1234500 && worldA[1] < 1234600, `Y ${worldA[1]}`);

  // Geometry buffers stay small (float32-safe) despite the survey offset.
  for (const parsed of [a, b])
    for (const e of parsed.elements) assert.ok(Math.max(...e.position.map(Math.abs)) < 1000);
});

test("origin alignment ignores coordinates and manual offsets are applied in IFC axes", () => {
  const a = parse(placeSiteAt(generateDemoIfc(), [500000, 1200000, 0]), "a.ifc");
  const sceneOrigin = [0, 0, 0];
  const placement = fed.resolvePlacement(
    { model: a, alignment: "origin", offset: { x: 5, y: 7, z: 2, rotationDeg: 90 } },
    sceneOrigin,
  );
  // IFC (5, 7, 2) → scene (5, 2, -7)
  assert.deepEqual(placement.position, [5, 2, -7]);
  // +90° about vertical turns local east (+X) into north (+Y).
  const rotated = fed.sceneToWorld(fed.applyPlacement([1, 0, 0], { position: [0, 0, 0], rotationY: placement.rotationY }), [0, 0, 0]);
  assert.ok(Math.abs(rotated[0]) < 1e-9 && Math.abs(rotated[1] - 1) < 1e-9);
});

test("IfcMapConversion is read in metres and converts world coordinates to E/N/H", () => {
  let text = generateDemoIfc({ millimetres: true });
  const context = text.match(/#(\d+)=IFCGEOMETRICREPRESENTATIONCONTEXT/)[1];
  const crs = lastId(text) + 1;
  // 30° grid rotation (cos, sin), eastings/northings in project millimetres.
  text = appendLines(text, [
    `#${crs}=IFCPROJECTEDCRS('EPSG:3405','VN-2000 / UTM 48N',$,$,$,$,$);`,
    `#${crs + 1}=IFCMAPCONVERSION(#${context},#${crs},583000000.,2330000000.,15000.,0.866025403784,0.5,1.);`,
  ]);
  const parsed = parse(text, "geo.ifc");
  const map = parsed.mapConversion;
  assert.equal(map.crsName, "EPSG:3405");
  assert.equal(map.eastings, 583000);
  assert.equal(map.northings, 2330000);
  assert.equal(map.orthogonalHeight, 15);
  assert.ok(Math.abs(map.rotation - Math.PI / 6) < 1e-9);
  const [e, n, h] = fed.worldToMap([10, 0, 3], map);
  assert.ok(Math.abs(e - (583000 + 10 * Math.cos(Math.PI / 6))) < 1e-6);
  assert.ok(Math.abs(n - (2330000 + 10 * Math.sin(Math.PI / 6))) < 1e-6);
  assert.equal(h, 18);
});

test("distance summary reports deltas in IFC axes (east, north, elevation)", () => {
  // Scene +y is elevation, scene -z is north.
  const s = fed.distanceSummary({ x: 0, y: 0, z: 0 }, { x: 3, y: 12, z: -4 });
  assert.deepEqual([s.dx, s.dy, s.dz], [3, 4, 12]);
  assert.equal(s.horizontal, 5);
  assert.equal(s.distance, 13);
});

test("placed bounds follow rotation and unions cover every model", () => {
  const b = { min: [0, 0, 0], max: [2, 1, 1] };
  const turned = fed.placedBounds(b, { position: [10, 0, 0], rotationY: Math.PI / 2 });
  assert.deepEqual(turned.min.map((n) => Math.round(n * 1e9) / 1e9), [10, 0, -2]);
  assert.deepEqual(turned.max.map((n) => Math.round(n * 1e9) / 1e9), [11, 1, 0]);
  assert.deepEqual(fed.unionBounds([b, turned]).max, [11, 1, 1]);
  assert.equal(fed.unionBounds([]), null);
});

// A unit square in the XZ plane made of two triangles sharing a diagonal.
const square = {
  positions: new Float32Array([0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
};

test("the diagonal of a flat quad is not a snappable edge", () => {
  const features = buildFeatureEdges(square.positions, square.indices);
  assert.equal(features.size, 4);
  assert.ok(!features.has(edgeKey(square.positions, 0, 2)));
  assert.ok(features.has(edgeKey(square.positions, 0, 1)));
});

test("a box has 12 feature edges despite 18 triangle edges", () => {
  const box = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
  const positions = box.getAttribute("position").array;
  const indices = Uint32Array.from({ length: positions.length / 3 }, (_, i) => i);
  assert.equal(buildFeatureEdges(positions, indices).size, 12);
});

test("snapping prefers vertex, then midpoint, then edge, then face", () => {
  // Orthographic-style projection: 100 px per metre on X/Z.
  const project = ([x, , z]) => [x * 100, z * 100];
  const triangle = [[0, 0, 0], [1, 0, 0], [1, 0, 1]];
  const settings = { vertex: true, midpoint: true, edge: true };
  const base = { triangle, featureEdges: [true, true, false], project, tolerancePx: 10, settings };

  let r = snapPoint({ ...base, hitPoint: [0.97, 0, 0.04], pointer: [97, 4] });
  assert.equal(r.kind, "vertex");
  assert.deepEqual(r.point, [1, 0, 0]);

  r = snapPoint({ ...base, hitPoint: [0.52, 0, 0.03], pointer: [52, 3] });
  assert.equal(r.kind, "midpoint");
  assert.deepEqual(r.point, [0.5, 0, 0]);

  r = snapPoint({ ...base, hitPoint: [0.3, 0, 0.05], pointer: [30, 5] });
  assert.equal(r.kind, "edge");
  assert.ok(Math.abs(r.point[0] - 0.3) < 1e-9 && r.point[2] === 0);

  // Near the (non-feature) diagonal: stays on the face.
  r = snapPoint({ ...base, hitPoint: [0.6, 0, 0.55], pointer: [60, 55] });
  assert.equal(r.kind, "face");
  assert.deepEqual(r.point, [0.6, 0, 0.55]);

  // Disabled snap kinds are skipped.
  r = snapPoint({ ...base, settings: { vertex: false, midpoint: false, edge: true }, hitPoint: [0.97, 0, 0.04], pointer: [97, 4] });
  assert.equal(r.kind, "edge");
});

const { axisDragValue, moveFace } = load("components/bim-viewer/section-box");

test("dragging a section handle follows the pointer ray along its axis", () => {
  // Camera looking down -Z at a handle on the X axis; pointer ray passes x = 3.
  assert.equal(axisDragValue([3, 0, 10], [0, 0, -1], [1, 0, 0], 0), 3);
  // Oblique ray still resolves to the closest point on the axis.
  const v = axisDragValue([0, 5, 10], [0.6, -0.5, -Math.sqrt(1 - 0.36 - 0.25)], [0, 0, 0], 0);
  assert.ok(Number.isFinite(v));
  // Looking straight along the axis is unstable and refused.
  assert.equal(axisDragValue([0, 0, 10], [0, 0, -1], [0, 0, 0], 2), null);
});

test("section faces stay inside limits and never cross", () => {
  const clip = { minX: 0, x: 10, minY: 0, y: 5, minZ: 0, z: 5, enabled: true };
  const limits = { min: [-1, -1, -1], max: [11, 6, 6] };
  assert.equal(moveFace(clip, 0, "max", 50, limits, 0.01).x, 11);
  assert.equal(moveFace(clip, 0, "max", -50, limits, 0.01).x, 0.01);
  assert.equal(moveFace(clip, 1, "min", 4, limits, 0.01).minY, 4);
  assert.equal(moveFace(clip, 1, "min", 9, limits, 0.01).minY, 4.99);
});
