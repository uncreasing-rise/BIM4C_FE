import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test, { before, after } from "node:test";
import ts from "typescript";
import * as THREE from "three";
import * as BVH from "three-mesh-bvh";
import { generateDemoIfc } from "../scripts/generate-ifc-demo.mjs";
const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();
function load(file) {
  const path = resolve(root, file.endsWith(".ts") ? file : file + ".ts");
  if (cache.has(path)) return cache.get(path);
  const mod = { exports: {} };
  cache.set(path, mod.exports);
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
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
const {
  createElementMesh,
  defaultClip,
  clippingPlanes,
  visibleHit,
  explodedPosition,
  fitCamera,
  disposeObject,
} = load("components/bim-viewer/viewer-geometry");
const api = new IFC.IfcAPI();
before(async () => await api.Init());
after(() => api.Dispose());
const parse = (text, name = "fixture.ifc") =>
  parseIfcData(api, new Uint8Array(Buffer.from(text)), name);
const fixture = (name) =>
  readFileSync(resolve(root, "test/fixtures/ifc", name), "utf8");
let demo;
test("IFC geometry-free and invalid files fail without fabricating shapes", () => {
  assert.throws(() => parse(fixture("no-geometry.ifc")), /IFC_NO_GEOMETRY/);
  assert.throws(() => parse(""), /IFC_FILE_EMPTY/);
  assert.throws(() => parse("this is not IFC"), /IFC_INVALID|IFC_NO_GEOMETRY/);
});
test("every part of a multipart IFC element is retained and locally centered", () => {
  const model = parse(fixture("multipart.ifc"));
  assert.equal(model.elements.length, 1);
  const e = model.elements[0];
  assert.equal(e.geometryData.groups.length, 2);
  assert.ok(Math.abs(e.size[0] - 7) < 1e-5);
  assert.equal(e.dimensionsSource, "bounds");
  assert.equal(e.dimensions.volume, undefined);
  assert.equal(e.dimensions.area, undefined);
  const scene = new THREE.Scene();
  const pool = new Map(),
    geometries = new Map();
  const mesh = createElementMesh(e, pool, geometries);
  scene.add(mesh);
  const bounds = new THREE.Box3().setFromObject(mesh);
  assert.ok(
    bounds
      .getCenter(new THREE.Vector3())
      .distanceTo(new THREE.Vector3(...e.position)) < 1e-5,
  );
  assert.ok(mesh.geometry.boundsTree);
  assert.equal(model.diagnostics.missingGeometry, 18);
  disposeObject(scene);
});
test("demo reads actual storeys, materials, inherited MEP types, Psets and quantities", () => {
  demo = parse(generateDemoIfc());
  assert.equal(demo.elements.length, 27);
  assert.equal(demo.schema, "IFC4");
  assert.deepEqual(demo.diagnostics, {
    missingGeometry: 0,
    failedGeometry: 0,
    failedProperties: 0,
  });
  assert.deepEqual([...new Set(demo.elements.map((e) => e.storey))].sort(), [
    "Level 1",
    "Level 2",
    "Level 3",
  ]);
  const wall = demo.elements.find((e) => e.name === "Wall L2");
  assert.equal(wall.material, "Demo concrete");
  assert.equal(wall.spatialPath[0].name, "BIM4C IFC demonstration");
  assert.ok(
    wall.spatialPath.some((n) => n.type.toUpperCase() === "IFCBUILDING"),
  );
  assert.ok(
    wall.psets.some((p) =>
      p.properties.some(
        (x) => x.name === "Reference" && x.value === "DEMO-WALL",
      ),
    ),
  );
  assert.ok(
    wall.psets.some((p) =>
      p.properties.some((x) => x.name === "LoadBearing" && x.value === "FALSE"),
    ),
  );
  const quantity = wall.psets
    .flatMap((p) => p.properties)
    .find((p) => p.name === "NetVolume");
  assert.ok(Math.abs(quantity.value - 13.2) < 1e-5);
  assert.equal(quantity.unit, "CUBIC_METRE");
  assert.equal(
    demo.elements.filter(
      (e) =>
        e.ifcType.toUpperCase() === "IFCDUCTFITTING" && e.discipline === "mep",
    ).length,
    3,
  );
});
test("millimetre IFC geometry normalizes to metres while retaining source units", () => {
  const metric = parse(generateDemoIfc({ millimetres: true }));
  const a = demo ?? parse(generateDemoIfc());
  for (let i = 0; i < 3; i++) {
    assert.ok(Math.abs(metric.bounds.min[i] - a.bounds.min[i]) < 0.001);
    assert.ok(Math.abs(metric.bounds.max[i] - a.bounds.max[i]) < 0.001);
  }
});
test("model handle closes even when extracting geometry throws", () => {
  const original = api.StreamAllMeshes;
  const originalClose = api.CloseModel;
  let closed = 0;
  api.StreamAllMeshes = () => {
    throw Error("test failure");
  };
  api.CloseModel = (id) => {
    closed++;
    originalClose.call(api, id);
  };
  try {
    assert.throws(() => parse(generateDemoIfc()), /test failure/);
    assert.equal(closed, 1);
  } finally {
    api.StreamAllMeshes = original;
    api.CloseModel = originalClose;
  }
});
test("no artificial clipping occurs when disabled, including beyond 1000 metres", () => {
  const bounds = { min: [2000, 2000, 2000], max: [3000, 3000, 3000] };
  const clip = defaultClip(bounds);
  assert.deepEqual(clippingPlanes(clip), []);
  const planes = clippingPlanes({ ...clip, enabled: true });
  assert.equal(planes.length, 6);
  assert.ok(
    planes.every(
      (p) => p.distanceToPoint(new THREE.Vector3(2500, 2500, 2500)) >= 0,
    ),
  );
  const hidden = { point: new THREE.Vector3(3100, 2500, 2500) },
    visible = { point: new THREE.Vector3(2900, 2500, 2500) };
  assert.equal(visibleHit([hidden, visible], planes), visible);
});
test("pipe length follows X and collapse restores exact IFC position", () => {
  const e = {
    id: "p",
    position: [8, 4, 2],
    size: [16, 0.45, 0.45],
    geometryType: "pipe",
    color: "#ffffff",
    ifcType: "IfcPipeSegment",
  };
  const mesh = createElementMesh(e, new Map(), new Map());
  const size = new THREE.Box3()
    .setFromObject(mesh)
    .getSize(new THREE.Vector3());
  assert.ok(size.distanceTo(new THREE.Vector3(16, 0.45, 0.45)) < 1e-5);
  const center = new THREE.Vector3(1, 2, 3);
  assert.notDeepEqual(explodedPosition(e, center, 1).toArray(), e.position);
  assert.deepEqual(explodedPosition(e, center, 0).toArray(), e.position);
});
test("camera fits all eight bounds corners at mobile and desktop aspects, at displaced origins", () => {
  const box = new THREE.Box3(
    new THREE.Vector3(5000, -100, 1000),
    new THREE.Vector3(7000, 800, 2500),
  );
  for (const aspect of [0.4, 1.6])
    for (const view of ["perspective", "top", "front", "right", "isometric"]) {
      const camera = new THREE.PerspectiveCamera(45, aspect);
      fitCamera(camera, box, view);
      for (const x of [box.min.x, box.max.x])
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z]) {
            const point = new THREE.Vector3(x, y, z).project(camera);
            assert.ok(
              Math.abs(point.x) < 1 &&
                Math.abs(point.y) < 1 &&
                point.z < 1 &&
                point.z > -1,
              `${aspect} ${view}`,
            );
          }
    }
});
