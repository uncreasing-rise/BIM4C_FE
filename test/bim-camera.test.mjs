import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import * as THREE from "three";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function load(path) {
  let filename = resolve(root, path);
  if (!existsSync(filename)) filename += ".ts";
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const cjs = { exports: {} };
  new Function("require", "module", "exports", source)((name) => (name === "three" ? THREE : require(name)), cjs, cjs.exports);
  return cjs.exports;
}

const m = load("components/bim-viewer/camera-motion");
const close = (a, b, eps = 1e-6) => a.every((v, i) => Math.abs(v - b[i]) < eps);

/** Camera looking at the origin from `direction`, as OrbitControls would place it. */
function cameraFrom(direction) {
  const camera = new THREE.PerspectiveCamera(45, 1);
  camera.position.set(...m.safeViewDirection(direction)).multiplyScalar(10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

/** Applies the ViewCube CSS matrix to a CSS-space vector. */
function cssApply(matrix, v) {
  const e = matrix.slice("matrix3d(".length, -1).split(",").map(Number);
  return new THREE.Vector3(...v).applyMatrix4(new THREE.Matrix4().fromArray(e)).toArray();
}

// Face normals in the cube's own CSS space (y down), per the FACE_CSS transforms.
const CSS_NORMALS = {
  front: [0, 0, 1], back: [0, 0, -1], right: [1, 0, 0], left: [-1, 0, 0], top: [0, -1, 0], bottom: [0, 1, 0],
};

test("the ViewCube shows the face the camera looks at, facing the viewer", () => {
  for (const face of m.CUBE_FACES) {
    const camera = cameraFrom(m.cubeCellDirection(face, 0, 0));
    const screen = cssApply(m.cubeCssMatrix(camera.quaternion), CSS_NORMALS[face]);
    assert.ok(screen[2] > 0.999, `${face} should face the viewer, got ${screen}`);
  }
});

test("in plan view north is at the top of the screen and east to the right", () => {
  const camera = cameraFrom([0, 1, 0]);
  const matrix = m.cubeCssMatrix(camera.quaternion);
  // Cube-local CSS: north = three -z = CSS -z; east = +x. Screen CSS: up = -y.
  assert.ok(cssApply(matrix, [0, 0, -1])[1] < -0.999, "north up");
  assert.ok(cssApply(matrix, [1, 0, 0])[0] > 0.999, "east right");
});

test("face, edge and corner hot spots point between their neighbouring faces", () => {
  assert.ok(close(m.cubeCellDirection("front", 0, 0), [0, 0, 1]));
  assert.ok(close(m.cubeCellDirection("front", 1, 0), [Math.SQRT1_2, 0, Math.SQRT1_2]));
  const s = 1 / Math.sqrt(3);
  // Top-right corner of the front face = front, right and top.
  assert.ok(close(m.cubeCellDirection("front", 1, 1), [s, s, s]));
  // The same corner reached from the top face (its bottom-right cell).
  assert.ok(close(m.cubeCellDirection("top", 1, -1), [s, s, s]));
  assert.ok(close(m.cubeCellDirection("right", -1, 1), [s, s, s]));
});

test("ViewCube arrows turn 90° between cube views and stop at the poles", () => {
  const front = [0, 0, 1], right = [1, 0, 0], top = [0, 1, 0], back = [0, 0, -1];
  // "Left" moves the camera to the model's left: front → left face.
  assert.ok(close(m.turnDirection(front, "left"), [-1, 0, 0]));
  assert.ok(close(m.turnDirection(front, "right"), right));
  assert.ok(close(m.turnDirection(m.turnDirection(front, "left"), "right"), front), "left then right returns");
  assert.ok(close(m.turnDirection(front, "up"), top));
  assert.ok(close(m.turnDirection(front, "down"), [0, -1, 0]));
  // Plan view is stored nudged south; down goes back to the front.
  assert.ok(close(m.turnDirection(m.safeViewDirection(top), "down"), front));
  assert.ok(close(m.turnDirection(m.safeViewDirection(top), "up"), top), "no flip over the pole");
  assert.ok(close(m.turnDirection(back, "up"), top));
  const s = Math.SQRT1_2;
  assert.ok(close(m.turnDirection([s, 0, s], "left"), [-s, 0, s]), "corner views turn too");
  assert.ok(close(m.snapToCube([0.9, 0.1, 0.05]), right));
});

test("a single section plane cuts on one face and can cross the whole model", () => {
  const sb = load("components/bim-viewer/section-box");
  const bounds = { min: [0, 0, 0], max: [10, 20, 30] };
  const box = { ...sb.planeClip(bounds, 1), planeAxis: undefined };
  assert.equal(sb.activeFaces(box).length, 6);
  assert.equal(sb.activeFaces({ ...box, enabled: false }).length, 0);
  const plan = sb.planeClip(bounds, 1);
  assert.deepEqual(sb.activeFaces(plan), [{ axis: 1, side: "max" }]);
  assert.equal(plan.y, 10, "starts through the middle");
  assert.deepEqual(sb.activeFaces(sb.planeClip(bounds, 1, true)), [{ axis: 1, side: "min" }]);
  assert.equal(sb.planeIndex(1, "max"), 2);
  // A box face stops at its opposite face; a lone plane may sweep the model.
  const limits = { min: [-1, -1, -1], max: [11, 21, 31] };
  assert.equal(sb.moveFace(plan, 1, "max", -0.5, limits, 0.01).y, -0.5);
  assert.equal(sb.moveFace(box, 1, "max", -0.5, limits, 0.01).y, 0.01);
});

test("levels are ordered by elevation and cut 1.2 m above the finished floor", () => {
  const { computeLevels, planCutHeight } = load("components/bim-viewer/levels");
  const storey = (id, name) => [{ id: 1, type: "IfcBuilding", name: "B" }, { id, type: "IfcBuildingStorey", name }];
  const el = (id, sid, name, y, h) => ({ id, spatialPath: storey(sid, name), position: [0, y, 0], size: [1, h, 1] });
  const elements = [
    el("slab2", 20, "Level 2", 3.45, 0.3), el("col2a", 20, "Level 2", 5.25, 3.3), el("col2b", 20, "Level 2", 5.25, 3.3),
    el("slab1", 10, "Level 1", -0.15, 0.3), el("col1a", 10, "Level 1", 1.65, 3.3), el("col1b", 10, "Level 1", 1.65, 3.3),
    { id: "loose", position: [0, 0, 0], size: [1, 1, 1] },
  ];
  const levels = computeLevels([{ key: "m1", model: { filename: "a.ifc", elements }, placement: { position: [0, 10, 0], rotationY: 0 } }]);
  assert.deepEqual(levels.map((l) => l.name), ["Level 1", "Level 2"]);
  assert.deepEqual(levels[0].ids.sort(), ["col1a", "col1b", "slab1"]);
  assert.ok(Math.abs(levels[0].bottom - 9.7) < 1e-9, "includes the model placement");
  const byId = new Map(elements.map((e) => [e.id, e]));
  // Columns start at y=0 (+10 placement): the cut is at 11.2, not above the slab soffit.
  assert.ok(Math.abs(planCutHeight(levels[0], byId, 10) - 11.2) < 1e-9);
});

test("window selection needs the whole element inside; crossing only a touch", () => {
  const bs = load("components/bim-viewer/box-select");
  // Identity-like projection: world x/y are screen pixels, everything in front.
  const project = (p) => [p.x, p.y, true];
  const box = new THREE.Box3(new THREE.Vector3(10, 10, 0), new THREE.Vector3(20, 20, 1));
  const around = bs.rectFrom(0, 0, 30, 30);
  const half = bs.rectFrom(15, 0, 40, 40);
  assert.equal(bs.boxMode(0, 30), "window");
  assert.equal(bs.boxMode(30, 0), "crossing");
  assert.equal(bs.boxPicked(box, around, "window", project), true);
  assert.equal(bs.boxPicked(box, half, "window", project), false);
  assert.equal(bs.boxPicked(box, half, "crossing", project), true);
  assert.equal(bs.boxPicked(box, bs.rectFrom(50, 50, 60, 60), "crossing", project), false);
  // A section plane keeping x < 5 removes the element entirely.
  const cut = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 5);
  assert.equal(bs.boxPicked(box, around, "crossing", project, [cut]), false);
  // Partly behind the camera: never a window pick.
  const behind = (p) => [p.x, p.y, p.z < 0.5];
  assert.equal(bs.boxPicked(box, around, "window", behind), false);
});

test("quantity take-off sums file quantities, net before gross, and flags elements without any", () => {
  const q = load("components/bim-viewer/quantities");
  const el = (id, ifcType, storey, props) => ({
    id, ifcType, storey, material: "Concrete",
    psets: [{ name: "Qto_WallBaseQuantities (#9)", properties: props }],
  });
  const elements = [
    el("w1", "IfcWall", "L1", [{ name: "NetVolume", value: 2, unit: "m3" }, { name: "GrossVolume", value: 3 }, { name: "Length", value: 5, unit: "m" }]),
    el("w2", "IfcWall", "L2", [{ name: "GrossVolume", value: 4, unit: "m3" }]),
    el("s1", "IfcSlab", "L1", [{ name: "GrossArea", value: 100, unit: "m2" }]),
    el("d1", "IfcDoor", "L1", [{ name: "Reference", value: "D-01" }]),
  ];
  const byType = q.quantityTakeoff(elements, "type");
  const wall = byType.find((r) => r.key === "IfcWall");
  assert.equal(wall.volume, 6, "net 2 (not gross 3) + gross fallback 4");
  assert.equal(wall.length, 5);
  assert.equal(wall.units.volume, "m3");
  assert.equal(byType.find((r) => r.key === "IfcDoor").withoutQuantities, 1);
  assert.deepEqual(q.quantityTakeoff(elements, "storey").map((r) => [r.key, r.count]), [["L1", 3], ["L2", 1]]);
  const csv = q.takeoffCsv(byType, ["Group", "Count", "V", "Vu", "A", "Au", "L", "Lu", "Missing"]);
  assert.ok(csv.startsWith("﻿"));
  assert.match(csv, /"IfcWall","2","6","m3"/);
});

test("markups are resolution-independent vectors with escaped text", () => {
  const mk = load("components/bim-viewer/markup");
  const [l, r] = mk.arrowHead([0, 0], [100, 0], 10);
  assert.ok(l[0] < 100 && r[0] < 100 && Math.abs(l[1] + r[1]) < 1e-9, "head sits back from the tip, symmetric");
  const rect = { id: "r", kind: "rect", color: "#ef4444", width: 2, points: [[0.1, 0.1], [0.5, 0.3]] };
  assert.match(mk.shapeSvg(rect, 1000, 500), /x="100" y="50" width="400" height="100"/);
  assert.match(mk.shapeSvg(rect, 2000, 1000), /width="800" height="200"/, "scales with the view");
  const text = { id: "t", kind: "text", color: "#000", width: 2, points: [[0, 0]], text: "<Ống> & dầm" };
  assert.match(mk.shapeSvg(text, 100, 100), /&lt;Ống&gt; &amp; dầm/);
  const svg = mk.markupSvg([rect, text], 800, 600);
  assert.ok(svg.startsWith("<svg") && svg.includes('viewBox="0 0 800 600"'));
  const dense = Array.from({ length: 100 }, (_, i) => [i / 1000, 0]);
  const kept = mk.simplify(dense, 1000, 1000, 5);
  assert.ok(kept.length < 30 && kept.at(-1) === dense.at(-1), "thins points but keeps the end");
  assert.match(mk.penPath([[0, 0], [10, 0], [20, 10]]), /^M0,0 Q10,0 15,5 L20,10$/);
  // Imported sessions cannot inject markup through colour or width.
  const evil = { ...rect, color: '"><script>alert(1)</script>', width: "9\" onload=\"x" };
  const out = mk.shapeSvg(evil, 100, 100);
  assert.ok(!out.includes("<script") && !out.includes("onload"), out);
});

test("version comparison matches GlobalIds and tells geometry from property changes", () => {
  const { compareModels } = load("components/bim-viewer/compare");
  const el = (key, guid, x, props = [{ name: "FireRating", value: "EI60" }]) => ({
    id: `${key}/${guid}`, guid, name: guid, ifcType: "IfcWall", material: "C30", storey: "L1",
    position: [x, 0, 0], size: [1, 3, 0.2], geometryData: { indices: new Uint32Array(36) },
    psets: [{ name: "IFC", properties: [{ name: "ExpressID", value: key === "a" ? 10 : 99 }] }, { name: "Pset_WallCommon (#5)", properties: props }],
  });
  const oldModel = [el("a", "same", 0), el("a", "moved", 1), el("a", "prop", 2), el("a", "gone", 3)];
  const newModel = [el("b", "same", 0), el("b", "moved", 1.5), el("b", "prop", 2, [{ name: "FireRating", value: "EI90" }]), el("b", "new", 4)];
  const diff = compareModels(oldModel, newModel);
  assert.deepEqual(diff.unchanged, ["b/same"], "express ids and pset #ids are not changes");
  assert.deepEqual(diff.geometry, ["b/moved"]);
  assert.deepEqual(diff.properties, ["b/prop"]);
  assert.deepEqual(diff.added, ["b/new"]);
  assert.deepEqual(diff.removed, ["a/gone"]);
  // A model shifted as a whole is not "everything moved".
  const shifted = compareModels(oldModel, newModel.map((e) => ({ ...e, position: [e.position[0] + 100, 0, 0] })), ([x, y, z]) => [x + 100, y, z]);
  assert.ok(shifted.unchanged.includes("b/same"));
});

test("orthographic framing matches the perspective size at the target", () => {
  const half = m.orthoHalfHeight(10, 90);
  assert.ok(Math.abs(half - 10) < 1e-9);
});

test("the orbit pivot stays on the line of sight, so re-targeting never turns the view", () => {
  const pivot = m.pivotOnViewLine([0, 0, 10], [0, 0, 0], [3, 4, 2]);
  assert.ok(close(pivot, [0, 0, 2]));
  assert.equal(m.pivotOnViewLine([0, 0, 10], [0, 0, 0], [0, 0, 20]), null, "behind the camera");
});

test("pose interpolation keeps the camera outside the model and reaches both ends exactly", () => {
  const from = { position: [0, 0, 10], target: [0, 0, 0] };
  const to = { position: [0, 0, -40], target: [0, 0, 0] };
  assert.ok(close(m.interpolatePose(from, to, 0).position, from.position));
  assert.ok(close(m.interpolatePose(from, to, 1).position, to.position, 1e-5));
  for (const t of [0.25, 0.5, 0.75]) {
    const p = new THREE.Vector3(...m.interpolatePose(from, to, t).position);
    assert.ok(p.length() >= 10 - 1e-6, `swings around the target at t=${t}`);
  }
  assert.equal(m.easeInOutCubic(0), 0);
  assert.equal(m.easeInOutCubic(1), 1);
});

test("every model browser branch knows all element ids beneath it", () => {
  const { buildSpatialTree } = load("components/bim-viewer/spatial-tree");
  const path = (storey) => [
    { id: 1, type: "IfcBuilding", name: "Tower" },
    { id: storey, type: "IfcBuildingStorey", name: `Level ${storey}` },
  ];
  const item = (id, storey) => ({ model: { key: "m1", model: { filename: "a.ifc" } }, element: { id, spatialPath: path(storey) } });
  const [file] = buildSpatialTree([item("m1/a", 2), item("m1/b", 2), item("m1/c", 3)]);
  assert.deepEqual(file.ids, ["m1/a", "m1/b", "m1/c"]);
  const [building] = file.children;
  assert.deepEqual(building.ids, ["m1/a", "m1/b", "m1/c"]);
  assert.deepEqual(building.children.map((storey) => storey.ids), [["m1/a", "m1/b"], ["m1/c"]]);
});

test("saved views keep their isolation through a session round trip", () => {
  const { sessionSchema } = load("components/bim-viewer/session-schema");
  const view = { id: "v1", name: "Core", preset: "perspective", elementIds: [], isolatedElements: ["m1/ifc-12"] };
  assert.deepEqual(sessionSchema.parse({ savedViews: [view] }).savedViews[0].isolatedElements, ["m1/ifc-12"]);
});

test("framing fits every corner of the box, including straight-down plan views", () => {
  const box = new THREE.Box3(new THREE.Vector3(5000, -100, 1000), new THREE.Vector3(7000, 800, 2500));
  for (const aspect of [0.4, 1.6])
    for (const direction of [[0, 1, 0], [0, -1, 0], [1, 0.75, 1], [0, 0, 1]]) {
      const pose = m.framePose(box, direction, 45, aspect);
      const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1e6);
      camera.position.set(...pose.position);
      camera.lookAt(...pose.target);
      camera.updateMatrixWorld();
      for (const x of [box.min.x, box.max.x])
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z]) {
            const p = new THREE.Vector3(x, y, z).project(camera);
            assert.ok(Math.abs(p.x) < 1 && Math.abs(p.y) < 1, `${aspect} ${direction}`);
          }
    }
});
