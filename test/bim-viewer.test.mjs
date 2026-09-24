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

test("three-point metrics handle right angles, tilted triangles, straight angles and repeated points", () => {
  const { triangleMetrics } = load("components/bim-viewer/measurement-math");
  const p = (x, y, z) => ({ x, y, z });
  assert.deepEqual(triangleMetrics([p(3,0,0), p(0,0,0), p(0,4,0)]), { angle: 90, area: 6 });
  assert.deepEqual(triangleMetrics([p(3,0,0), p(0,0,0), p(0,0,4)]), { angle: 90, area: 6 });
  assert.deepEqual(triangleMetrics([p(-1,0,0), p(0,0,0), p(1,0,0)]), { angle: 180, area: 0 });
  assert.equal(triangleMetrics([p(0,0,0), p(0,0,0), p(1,0,0)]), null);
  assert.equal(triangleMetrics([]), null);
  const { sessionSchema } = load("components/bim-viewer/session-schema");
  for (const mode of ["angle", "triangle"]) {
    const points = [p(3,0,0), p(0,0,0), p(0,4,0)].map((point) => ({ ...point, snap: "face" }));
    const session = { measurements: [{ id: "m1", mode, points }] };
    assert.deepEqual(sessionSchema.parse(JSON.parse(JSON.stringify(session))), session);
    assert.equal(sessionSchema.safeParse({ measurements: [{ id: "m1", mode, points: points.slice(0,2) }] }).success, false);
  }
});

test("spatial tree preserves IFC ancestry, file boundaries and all elements beyond 80", () => {
  const { buildSpatialTree } = load("components/bim-viewer/spatial-tree");
  const path = [{ id: 1, type: "IfcProject", name: "Project" }, { id: 2, type: "IfcBuilding", name: "Tower" }, { id: 3, type: "IfcBuildingStorey", name: "Level 1" }];
  const items = Array.from({ length: 205 }, (_, i) => ({ model: { key: "a", model: { filename: "a.ifc" } }, element: { id: `a/${i}`, spatialPath: path } }));
  items.push({ model: { key: "b", model: { filename: "b.ifc" } }, element: { id: "b/1", spatialPath: path } });
  const tree = buildSpatialTree(items);
  assert.equal(tree.length, 2);
  assert.equal(tree[0].count, 205);
  assert.equal(tree[1].count, 1);
  const storey = tree[0].children[0].children[0].children[0];
  assert.equal(storey.count, 205);
  assert.equal(storey.elements[204].id, "a/204");
  assert.equal(buildSpatialTree([ { ...items[0], element: { id: "orphan", storey: "Level X" } } ])[0].children[0].elements[0].id, "orphan");
});

test("saved camera, clipping and model-local measurement anchors survive JSON round trip", () => {
  const { sessionSchema } = load("components/bim-viewer/session-schema");
  const view = {
    id: "v1", name: "Coordination", preset: "perspective", elementIds: ["m1/wall"],
    camera: { position: [10, 20, 30], target: [1, 2, 3], up: [0, 1, 0], fov: 45 },
    clip: { minX: -1, minY: -2, minZ: -3, x: 4, y: 5, z: 6, enabled: true },
    hiddenElements: ["m1/door"],
    layers: { architecture: true, structure: false, mep: true, clash: false },
    explode: 0,
  };
  const measurement = { id: "p1", mode: "point", points: [{ x: 10, y: 2, z: 3, snap: "vertex", modelKey: "m1", guid: "wall", localPoint: [1, 2, 3] }] };
  const data = { version: 1, savedViews: [view], measurements: [measurement] };
  assert.deepEqual(sessionSchema.parse(JSON.parse(JSON.stringify(data))), data);
  for (const camera of [
    { ...view.camera, fov: 0 },
    { ...view.camera, up: [0, 0, 0] },
    { ...view.camera, position: [Infinity, 0, 0] },
  ]) assert.equal(sessionSchema.safeParse({ savedViews: [{ ...view, camera }] }).success, false);
  assert.equal(sessionSchema.safeParse({ savedViews: [{ ...view, clip: { ...view.clip, minX: 10 } }] }).success, false);
});

test("session rejects malformed measurements before replacing viewer state", () => {
  const { sessionSchema } = load("components/bim-viewer/session-schema");
  const p = { x: 1, y: 2, z: 3, snap: "face" };
  assert.equal(
    sessionSchema.safeParse({
      measurements: [{ id: "m", mode: "distance", points: [p] }],
    }).success,
    false,
  );
  assert.equal(
    sessionSchema.safeParse({
      measurements: [
        { id: "m", mode: "point", points: [{ ...p, x: Infinity }] },
      ],
    }).success,
    false,
  );
  assert.equal(sessionSchema.safeParse({ explode: 100 }).success, false);
  assert.equal(
    sessionSchema.safeParse({ version: 2, measurements: [] }).success,
    false,
  );
  const session = {
    version: 1,
    measurements: [{ id: "m", mode: "distance", points: [p, { ...p, x: 4 }] }],
  };
  assert.deepEqual(
    sessionSchema.parse(JSON.parse(JSON.stringify(session))),
    session,
  );
});

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

test("viewer loads the public IFC demo and exposes selection workflow", () => {
  const page = readFileSync(
    resolve(root, "components/bim-viewer/BimViewerPage.tsx"),
    "utf8",
  );
  const canvas = readFileSync(
    resolve(root, "components/bim-viewer/BimCanvas.tsx"),
    "utf8",
  );
  const panel = readFileSync(
    resolve(root, "components/bim-viewer/BimModelsPanel.tsx"),
    "utf8",
  );
  assert.match(page, /parseIfcFromUrl/);
  assert.match(page, /\/models\/bim4c-commercial-tower\.ifc/);
  assert.match(page, /selectedElementIds/);
  assert.match(canvas, /selectedElementIds\.has/);
  assert.match(canvas, /elementIds\?\.length/);
  assert.match(panel, /Filter by discipline/);
  assert.match(panel, /Filter by storey/);
  assert.match(panel, /Spatial model tree/);
});

test("local clash detection reports only cross-discipline AABB overlaps", () => {
  const { detectAabbClashes } = load("components/bim-viewer/clash-detection");
  const element = (id, discipline, position) => ({
    id,
    guid: id,
    name: id,
    ifcType: "IfcProxy",
    discipline,
    storey: "Level 1",
    material: "",
    color: "#fff",
    psets: [],
    position,
    size: [2, 2, 2],
  });
  const model = (key, discipline, position) => ({
    key,
    placement: { position: [0, 0, 0], rotationY: 0 },
    model: {
      id: key,
      description: key,
      elements: [element(`${key}-element`, discipline, position)],
      elementsCount: 1,
      clashes: [],
      defaultCamera: { position: [0, 0, 5], target: [0, 0, 0] },
    },
  });
  assert.equal(
    detectAabbClashes([
      model("arch", "architecture", [0, 0, 0]),
      model("mep", "mep", [0.5, 0, 0]),
    ]).length,
    1,
  );
  assert.equal(
    detectAabbClashes([
      model("a", "architecture", [0, 0, 0]),
      model("b", "architecture", [0.5, 0, 0]),
    ]).length,
    0,
  );
});
