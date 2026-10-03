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

test("tool-only meshes stay outside rendering while picking and promotion preserve federation transforms", () => {
  const { placeElementMesh, syncPickingRoot } = load("components/bim-viewer/model-meshes");
  const { PickIndex } = load("components/bim-viewer/pick-index");
  const scene = new THREE.Scene(), rendered = new THREE.Group(), picking = new THREE.Group();
  scene.add(rendered);
  rendered.position.set(10, 2, -3); rendered.rotation.y = Math.PI / 2;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial());
  mesh.position.set(3, 0, 0);
  placeElementMesh(mesh, rendered, picking, false);
  syncPickingRoot(rendered, picking);
  const expected = mesh.getWorldPosition(new THREE.Vector3());
  const drawn = []; scene.traverse(o => drawn.push(o));
  assert.ok(!drawn.includes(mesh));
  const index = new PickIndex(); index.build([mesh]);
  const ray = new THREE.Raycaster(expected.clone().add(new THREE.Vector3(0, 0, 10)), new THREE.Vector3(0, 0, -1));
  assert.equal(index.firstHit(ray, []).object, mesh);
  placeElementMesh(mesh, rendered, picking, true); scene.updateMatrixWorld(true);
  assert.ok(mesh.getWorldPosition(new THREE.Vector3()).distanceTo(expected) < 1e-10);
  placeElementMesh(mesh, rendered, picking, false);
  rendered.position.x += 5; rendered.visible = false;
  syncPickingRoot(rendered, picking);
  assert.equal(mesh.parent.visible, false);
  assert.ok(mesh.getWorldPosition(new THREE.Vector3()).distanceTo(expected.add(new THREE.Vector3(5, 0, 0))) < 1e-10);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test("sliced quantity calculation matches totals and stops when its scope is cancelled", async () => {
  const { quantityTakeoff, quantityTakeoffAsync } = load("components/bim-viewer/quantities");
  const elements = Array.from({ length: 500 }, (_, i) => ({ id: String(i), ifcType: i % 2 ? "IfcWall" : "IfcSlab", psets: [{ name: "Qto", properties: [{ name: "NetVolume", value: i, unit: "m³" }] }] }));
  let yields = 0;
  const controller = new AbortController();
  const rows = await quantityTakeoffAsync(elements, "type", controller.signal, async () => { yields++; });
  assert.deepEqual(rows, quantityTakeoff(elements, "type"));
  assert.ok(yields >= 4);
  let visits = 0;
  await assert.rejects(quantityTakeoffAsync(elements, "type", controller.signal, async () => {
    if (++visits === 2) controller.abort();
  }), { name: "AbortError" });
  assert.equal(visits, 2);
});

test("takeoff normalizes mixed units, preserves zero and rejects ambiguous dimensions", () => {
  const { quantityInSI, quantityTakeoff, elementQuantities, takeoffCsv } = load("components/bim-viewer/quantities");
  assert.deepEqual(quantityInSI(1e9, "mm³", 3), { value: 1, unit: "m³" });
  assert.deepEqual(quantityInSI(10000, "cm2", 2), { value: 1, unit: "m²" });
  assert.ok(Math.abs(quantityInSI(1, "cubic foot", 3).value - .028316846592) < 1e-12);
  for (const unit of [undefined, "unknown", "m2", "kg"]) assert.equal(quantityInSI(12, unit, 3), null);
  assert.equal(quantityInSI(-1, "m³", 3), null);
  const element = (id, properties) => ({ id, ifcType: "IfcWall", psets: [{ name: "Qto_WallBaseQuantities", properties }] });
  const a = element("a", [{ name: "NetVolume", value: 1e9, unit: "mm³" }, { name: "Height", value: 3000, unit: "mm" }]);
  const b = element("b", [{ name: "NetVolume", value: 2, unit: "m3" }]);
  const c = element("c", [{ name: "NetVolume", value: 0, unit: "m³" }, { name: "GrossVolume", value: 7, unit: "m³" }]);
  const row = quantityTakeoff([a, b, c], "type")[0];
  assert.equal(row.volume, 3);
  assert.equal(row.coverage.volume, 3);
  assert.equal(row.coverage.length, 0);
  assert.equal(elementQuantities(a).length, null);
  assert.equal(elementQuantities(element("area", [{ name: "GrossArea", value: 20, unit: "m²" }, { name: "NetSideArea", value: 12, unit: "m²" }])).area.value, 12);
  assert.match(takeoffCsv(quantityTakeoff([c], "type"), []), /"0","m³"/);
});

test("mesh volume rejects opposite open faces, wrong winding and invalid indices", () => {
  const { meshVolume } = load("components/bim-viewer/quantities");
  const box = new THREE.BoxGeometry(2, 3, 4);
  const positions = box.attributes.position.array;
  const indices = box.index.array;
  assert.ok(Math.abs(meshVolume({ positions, indices }) - 24) < 1e-9, "split face vertices still close");
  const open = [];
  for (let t = 0; t < indices.length; t += 3) {
    if (Math.abs(box.attributes.normal.getY(indices[t])) < .5) open.push(...indices.slice(t, t + 3));
  }
  assert.equal(meshVolume({ positions, indices: open }), null, "opposite holes cannot cancel the closure check");
  const reversed = [...indices]; [reversed[0], reversed[1]] = [reversed[1], reversed[0]];
  assert.equal(meshVolume({ positions, indices: reversed }), null);
  assert.equal(meshVolume({ positions, indices: [0, 1, 999] }), null);
  box.dispose();
});

test("edge snapping projects back to the cursor under strong perspective", () => {
  const { snapPoint } = load("components/bim-viewer/snapping");
  const project = ([x, y, z]) => [100 * x / z, 100 * y / z];
  const input = {
    triangle: [[0, 0, 1], [10, 0, 10], [0, 10, 10]],
    featureEdges: [true, false, false], hitPoint: [0, 0, 1],
    project, depth: (p) => p[2], pointer: [50, 0], tolerancePx: 16,
    settings: { vertex: false, midpoint: false, edge: true, center: false },
  };
  const result = snapPoint(input);
  assert.equal(result.kind, "edge");
  assert.ok(Math.abs(project(result.point)[0] - 50) < 1e-10);
  assert.ok(Math.abs(result.point[0] - 10 / 11) < 1e-10);
  assert.equal(snapPoint({ ...input, featureEdges: [false, false, false], pointer: [0, 0], settings: { ...input.settings, vertex: true } }).kind, "face", "interior tessellation vertices are not corners");
});

test("an arc with three coincident points has no finite circle", () => {
  const { arcThrough } = load("components/bim-viewer/measurement-math");
  const point = { x: 1, y: 2, z: 3 };
  assert.equal(arcThrough([point, point, point]), null);
});

test("stored display preferences reject invalid render environments and projections", () => {
  const { displaySettingsSchema } = load("components/bim-viewer/session-schema");
  assert.equal(displaySettingsSchema.safeParse({ environment: "broken" }).success, false);
  assert.equal(displaySettingsSchema.safeParse({ projection: "broken" }).success, false);
  assert.equal(displaySettingsSchema.safeParse({ edges: "true" }).success, false);
  assert.deepEqual(displaySettingsSchema.parse({ environment: "dark", projection: "orthographic" }), {
    environment: "dark", projection: "orthographic",
  });
  assert.deepEqual(displaySettingsSchema.parse({ grid: false }), { grid: false });
});

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

test("polyline length and polygon area/perimeter work on any plane and survive a session round trip", () => {
  const { polylineLength, polygonMetrics, isOpenEnded, MEASURE_POINTS } = load("components/bim-viewer/measurement-math");
  const p = (x, y, z) => ({ x, y, z });
  assert.equal(polylineLength([p(0,0,0), p(3,0,0), p(3,0,4)]), 7);
  assert.equal(polylineLength([p(1,2,3)]), 0);
  // 4 × 3 rectangle on the floor (scene Y up): area, footprint and perimeter agree.
  assert.deepEqual(polygonMetrics([p(0,0,0), p(4,0,0), p(4,0,3), p(0,0,3)]), { area: 12, planArea: 12, perimeter: 14 });
  // The same rectangle on a wall: full area, no footprint; winding does not matter.
  assert.deepEqual(polygonMetrics([p(0,0,0), p(0,3,0), p(4,3,0), p(4,0,0)]), { area: 12, planArea: 0, perimeter: 14 });
  // L-shaped (concave) floor outline: 4×4 minus 2×2.
  assert.equal(polygonMetrics([p(0,0,0), p(4,0,0), p(4,0,2), p(2,0,2), p(2,0,4), p(0,0,4)]).area, 12);
  assert.equal(polygonMetrics([p(0,0,0), p(1,0,0)]), null);
  assert.equal(isOpenEnded("polygon"), true);
  assert.equal(isOpenEnded("triangle"), false);
  assert.equal(MEASURE_POINTS.polyline, 2);
  const { sessionSchema } = load("components/bim-viewer/session-schema");
  const outline = [p(0,0,0), p(4,0,0), p(4,0,3), p(0,0,3)].map((point) => ({ ...point, snap: "vertex" }));
  const session = { measurements: [{ id: "a", mode: "polygon", points: outline }, { id: "b", mode: "polyline", points: outline.slice(0, 2) }] };
  assert.deepEqual(sessionSchema.parse(JSON.parse(JSON.stringify(session))), session);
  assert.equal(sessionSchema.safeParse({ measurements: [{ id: "a", mode: "polygon", points: outline.slice(0, 2) }] }).success, false);
  assert.equal(sessionSchema.safeParse({ measurements: [{ id: "b", mode: "polyline", points: outline.slice(0, 1) }] }).success, false);
});

test("sessions keep saved-view projection and model state, selection sets and issue viewpoints", () => {
  const { sessionSchema } = load("components/bim-viewer/session-schema");
  const camera = { position: [1, 2, 3], target: [0, 0, 0], up: [0, 1, 0], fov: 50 };
  const session = {
    savedViews: [{
      id: "v1", name: "Ortho", preset: "top", elementIds: [], camera, projection: "orthographic",
      models: [{ key: "m1", visible: false, alignment: "origin", offset: { x: 1, y: 2, z: 0, rotationDeg: 90 } }],
    }],
    selectionSets: [{ id: "s1", name: "Cột tầng 1", guids: ["2O2Fr$t4X7Zf8NOew3FLOH"] }],
    issues: [{ id: "i1", title: "T", description: "", elementIds: ["m1/ifc-5"], status: "open", createdAt: "2026-09-28", camera, bcfGuid: "0b1c2d3e-0000-4000-8000-000000000001", type: "Issue" }],
  };
  assert.deepEqual(sessionSchema.parse(JSON.parse(JSON.stringify(session))), session);
  assert.equal(sessionSchema.safeParse({ savedViews: [{ ...session.savedViews[0], projection: "fisheye" }] }).success, false);
  assert.equal(sessionSchema.safeParse({ savedViews: [{ ...session.savedViews[0], models: [{ key: "m1", visible: true, alignment: "tilted", offset: { x: 0, y: 0, z: 0, rotationDeg: 0 } }] }] }).success, false);
});

test("sessions survive reopening the same files in another order, and leave user text alone", () => {
  const ids = load("components/bim-viewer/session-ids");
  const A = "a".repeat(64), B = "b".repeat(64);
  const saved = ids.modelTokens([{ key: "m1", hash: A }, { key: "m2", hash: B }]);
  const session = {
    hiddenElements: ["m1/ifc-5", "m2/ifc-9"],
    measurements: [{ id: "ms-1", mode: "point", points: [{ x: 0, y: 0, z: 0, snap: "face", modelKey: "m2" }] }],
    savedViews: [{ id: "v", name: "m1/ifc-5 stays", preset: "top", modelKey: "m1", elementIds: ["m2/ifc-9"], models: [{ key: "m2", visible: true }] }],
    issues: [{ id: "i", title: "m1/ifc-5", description: "see m2/ifc-9", elementIds: ["m1/ifc-5"], clashId: "local-m1/ifc-5-m2/ifc-9" }],
    clashStatus: { "local-m1/ifc-5-m2/ifc-9": "resolved" },
  };
  const stable = ids.stabilizeSession(session, saved);
  assert.deepEqual(stable.hiddenElements, [`h:${"a".repeat(16)}/ifc-5`, `h:${"b".repeat(16)}/ifc-9`]);
  assert.equal(stable.issues[0].title, "m1/ifc-5", "typed text is not an id");
  assert.equal(stable.savedViews[0].name, "m1/ifc-5 stays");
  // Reopened as B then A: B is now m1, A is m2.
  const reopened = ids.modelTokens([{ key: "m1", hash: B }, { key: "m2", hash: A }]);
  assert.equal(ids.sessionIdentity(saved), ids.sessionIdentity(reopened));
  const back = ids.localizeSession(JSON.parse(JSON.stringify(stable)), reopened);
  assert.deepEqual(back.hiddenElements, ["m2/ifc-5", "m1/ifc-9"]);
  assert.equal(back.measurements[0].points[0].modelKey, "m1");
  assert.equal(back.savedViews[0].modelKey, "m2");
  assert.deepEqual(back.savedViews[0].elementIds, ["m1/ifc-9"]);
  assert.equal(back.savedViews[0].models[0].key, "m1");
  assert.equal(back.issues[0].clashId, "local-m2/ifc-5-m1/ifc-9");
  assert.deepEqual(Object.keys(back.clashStatus), ["local-m2/ifc-5-m1/ifc-9"]);
  assert.equal(back.issues[0].description, "see m2/ifc-9");
  // Two copies of one file keep distinct tokens; a file without a hash disables tokens.
  assert.deepEqual([...ids.modelTokens([{ key: "m1", hash: A }, { key: "m2", hash: A }]).values()], [`h:${"a".repeat(16)}`, `h:${"a".repeat(16)}~1`]);
  assert.equal(ids.modelTokens([{ key: "m1" }]), null);
});

test("BCF 2.1 zip round-trips topics, cameras, selections and snapshots", () => {
  const { buildBcfZip, parseBcfZip } = load("components/bim-viewer/bcf");
  const { unzipSync, strFromU8, zipSync, strToU8 } = require("fflate");
  const snapshot = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
  const topics = [
    {
      guid: "0b1c2d3e-0000-4000-8000-000000000001",
      title: `Ống gió <DN400> & dầm "B2"`,
      description: "Va chạm tại trục 3/C",
      status: "open",
      type: "Clash",
      createdAt: "2026-09-28T01:02:03.000Z",
      author: "BIM4C",
      components: ["2O2Fr$t4X7Zf8NOew3FLOH", "1hOSvn6df7F8_7GcBWlS2V"],
      camera: { position: [10, -5, 3.2], direction: [-1, 1, -0.2], up: [0, 0, 1], fov: 55 },
      snapshot: { data: snapshot, type: "png" },
    },
    { guid: "0b1c2d3e-0000-4000-8000-000000000002", title: "No view", description: "", status: "resolved", type: "Issue", createdAt: "2026-09-28T00:00:00.000Z", author: "", components: [] },
  ];
  const zip = buildBcfZip(topics);
  const files = unzipSync(zip);
  assert.match(strFromU8(files["bcf.version"]), /VersionId="2\.1"/);
  assert.ok(files[`${topics[0].guid}/viewpoint.bcfv`]);
  assert.equal(files[`${topics[1].guid}/viewpoint.bcfv`], undefined);
  const back = parseBcfZip(zip).sort((a, b) => a.guid.localeCompare(b.guid));
  assert.equal(back.length, 2);
  assert.equal(back[0].title, topics[0].title);
  assert.equal(back[0].status, "open");
  assert.equal(back[1].status, "resolved");
  assert.equal(back[0].type, "Clash");
  assert.deepEqual(back[0].components, topics[0].components);
  assert.deepEqual(back[0].camera, topics[0].camera);
  assert.deepEqual([...back[0].snapshot.data], [...snapshot]);
  assert.equal(back[1].camera, undefined);

  // A file shaped like other tools' output: namespaced tags, "Closed", an orthogonal camera.
  const foreign = zipSync({
    "bcf.version": strToU8('<Version VersionId="2.1"/>'),
    "abc/markup.bcf": strToU8(`<?xml version="1.0"?><Markup><Topic Guid="abc" TopicType="Fault" TopicStatus="Closed"><Title>Door &amp; wall</Title><CreationDate>2026-01-01T00:00:00Z</CreationDate></Topic><Viewpoints Guid="v1"><Viewpoint>v1.bcfv</Viewpoint></Viewpoints></Markup>`),
    "abc/v1.bcfv": strToU8(`<bcf:VisualizationInfo xmlns:bcf="x"><Components><Selection><Component IfcGuid="3cUkl32yn9qRSPvBJVyWYp" /></Selection></Components><OrthogonalCamera><CameraViewPoint><X>1</X><Y>2</Y><Z>3</Z></CameraViewPoint><CameraDirection><X>0</X><Y>0</Y><Z>-1</Z></CameraDirection><CameraUpVector><X>0</X><Y>1</Y><Z>0</Z></CameraUpVector><ViewToWorldScale>20</ViewToWorldScale></OrthogonalCamera></bcf:VisualizationInfo>`),
  });
  // Scene camera (Y up, look-at) -> BCF (IFC Z up, direction) -> scene again.
  const { cameraToBcf, cameraFromBcf } = load("components/bim-viewer/bcf");
  const origin = [100, 0, -50];
  const scene = { position: [0, 10, 20], target: [0, 10, 0], up: [0, 1, 0], fov: 50 };
  const bcfCamera = cameraToBcf(scene, origin);
  assert.deepEqual(bcfCamera.position, [100, 30, 10]);
  assert.deepEqual(bcfCamera.direction, [0, 1, 0]);
  assert.deepEqual(bcfCamera.up, [0, 0, 1]);
  assert.deepEqual(cameraFromBcf(bcfCamera, origin, 20), scene);
  const [topic] = parseBcfZip(foreign);
  assert.equal(topic.title, "Door & wall");
  assert.equal(topic.status, "resolved");
  assert.deepEqual(topic.components, ["3cUkl32yn9qRSPvBJVyWYp"]);
  assert.deepEqual(topic.camera, { position: [1, 2, 3], direction: [0, 0, -1], up: [0, 1, 0], fov: 60 });
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

test("measure tools split like Navisworks: multiple points, accumulate, finishing and preview anchors", () => {
  const m = load("components/bim-viewer/measurement-math");
  const p = (x, y, z) => ({ x, y, z });
  // Point to multiple points: every target from the base.
  assert.deepEqual(m.multipointDistances([p(0,0,0), p(3,4,0), p(0,0,2)]), [5, 2]);
  // Accumulate: separate pairs, not a chain; an unpaired last point is ignored.
  const acc = m.accumulateSegments([p(0,0,0), p(1,0,0), p(10,0,0), p(10,2,0), p(50,0,0)]);
  assert.equal(acc.segments.length, 2);
  assert.equal(acc.total, 3);
  assert.deepEqual(m.finishedPoints("accumulate", [p(0,0,0), p(1,0,0), p(2,0,0)]), [p(0,0,0), p(1,0,0)]);
  assert.equal(m.finishedPoints("accumulate", [p(0,0,0)]), null);
  assert.equal(m.finishedPoints("multipoint", [p(0,0,0)]), null);
  assert.equal(m.finishedPoints("polygon", [p(0,0,0), p(1,0,0)]), null);
  for (const mode of ["multipoint", "accumulate", "polyline", "polygon"]) assert.equal(m.isOpenEnded(mode), true);
  for (const mode of ["distance", "shortest", "angle", "point"]) assert.equal(m.isOpenEnded(mode), false);
  // The preview line starts at the base, after the last point, or nowhere between accumulate segments.
  const pts = [p(0,0,0), p(1,0,0), p(2,0,0)];
  assert.equal(m.rubberBandAnchor("multipoint", pts), pts[0]);
  assert.equal(m.rubberBandAnchor("polyline", pts), pts[2]);
  assert.equal(m.rubberBandAnchor("accumulate", pts), pts[2]);
  assert.equal(m.rubberBandAnchor("accumulate", pts.slice(0, 2)), null);
  assert.equal(m.rubberBandAnchor("shortest", pts), null);
  assert.equal(m.rubberBandAnchor("distance", []), null);
});

test("measure locks hold the next point on an IFC axis or the first surface's normal, also from empty space", () => {
  const m = load("components/bim-viewer/measurement-math");
  const close = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);
  // IFC Y (north) is scene -z; IFC Z (up) is scene y.
  assert.deepEqual(m.lockConstraint("y").direction, [0, 0, -1]);
  assert.deepEqual(m.lockConstraint("z").direction, [0, 1, 0]);
  assert.equal(m.lockConstraint("perpendicular"), null); // no surface picked
  assert.equal(m.lockConstraint(null, [0, 1, 0]), null);
  const x = m.lockConstraint("x");
  assert.ok(close(m.constrainPoint([1, 1, 1], [5, 7, -3], x), [5, 1, 1]));
  // Perpendicular to a floor (normal up) is vertical; parallel keeps the floor's height.
  const perpendicular = m.lockConstraint("perpendicular", [0, 2, 0]);
  assert.ok(close(m.constrainPoint([0, 3, 0], [4, 8, 1], perpendicular), [0, 8, 0]));
  const parallel = m.lockConstraint("parallel", [0, 1, 0]);
  assert.ok(close(m.constrainPoint([0, 3, 0], [4, 8, 1], parallel), [4, 3, 1]));
  // Over empty space: the ray's closest point on the axis, its crossing of the plane.
  assert.ok(close(m.constrainRay([0, 0, 0], [5, 10, 0], [0, -1, 0], x), [5, 0, 0]));
  assert.ok(close(m.constrainRay([0, 3, 0], [2, 10, 2], [0, -1, 0], parallel), [2, 3, 2]));
  assert.equal(m.constrainRay([0, 0, 0], [0, 1, 0], [1, 0, 0], x), null); // ray along the axis
  assert.equal(m.constrainRay([0, 3, 0], [0, 10, 0], [0, 1, 0], parallel), null); // plane behind
});

test("angle arcs stay in the angle's plane at the given radius; units and precision format lengths and areas", () => {
  const m = load("components/bim-viewer/measurement-math");
  const p = (x, y, z) => ({ x, y, z });
  const arc = m.angleArc([p(4,1,1), p(1,1,1), p(1,1,6)], 0.5, 8);
  assert.equal(arc.length, 9);
  for (const [x, y, z] of arc) {
    assert.ok(Math.abs(Math.hypot(x - 1, y - 1, z - 1) - 0.5) < 1e-9);
    assert.ok(Math.abs(y - 1) < 1e-9);
  }
  assert.deepEqual(arc[0].map((n) => +n.toFixed(9)), [1.5, 1, 1]);
  assert.deepEqual(m.angleArc([p(-1,0,0), p(0,0,0), p(1,0,0)], 1), []); // straight angle
  const units = (unit, precision) => ({ unit, precision });
  assert.equal(m.formatMeasure(1.23456, 1, units("m", 3), "en"), "1.235 m");
  assert.equal(m.formatMeasure(1.23456, 1, units("mm", 0), "en"), "1,235 mm");
  assert.equal(m.formatMeasure(2, 2, units("cm", 0), "en"), "20,000 cm²");
  assert.equal(m.formatMeasure(0.3048, 1, units("ft", 2), "en"), "1.00 ft");
  assert.equal(m.formatMeasure(1.5, 1, units("m", 2), "vi"), "1,50 m");
  const { measureUnitsSchema } = load("components/bim-viewer/session-schema");
  assert.equal(measureUnitsSchema.safeParse({ unit: "km", precision: 2 }).success, false);
  assert.equal(measureUnitsSchema.safeParse({ unit: "mm", precision: 9 }).success, false);
});

test("sessions store the new measure modes and refuse broken ones; limits match the viewer's", () => {
  const { sessionSchema } = load("components/bim-viewer/session-schema");
  const { MAX_MEASURE_POINTS } = load("components/bim-viewer/measurement-math");
  const pt = (x) => ({ x, y: 0, z: 0, snap: "face", normal: [0, 1, 0] });
  const ok = (mode, points) => sessionSchema.safeParse({ measurements: [{ id: "m", mode, points }] }).success;
  const session = { measurements: [
    { id: "a", mode: "multipoint", points: [pt(0), pt(1), pt(2)] },
    { id: "b", mode: "accumulate", points: [pt(0), pt(1), pt(5), pt(6)] },
    { id: "c", mode: "shortest", points: [pt(0), pt(1)] },
  ] };
  assert.deepEqual(sessionSchema.parse(JSON.parse(JSON.stringify(session))), session);
  assert.equal(ok("accumulate", [pt(0), pt(1), pt(2)]), false); // unpaired point
  assert.equal(ok("multipoint", [pt(0)]), false);
  assert.equal(ok("shortest", [pt(0), pt(1), pt(2)]), false);
  const many = Array.from({ length: MAX_MEASURE_POINTS }, (_, i) => pt(i));
  assert.equal(ok("polyline", many), true);
  assert.equal(ok("polyline", [...many, pt(-1)]), false);
});

test("shortest distance: BVH closest points come back in each mesh's own frame", () => {
  // BimCanvas maps the first point with mesh A's matrix and the second with B's.
  const a = new THREE.BoxGeometry(1, 1, 1);
  const b = new THREE.BoxGeometry(1, 1, 1);
  const worldA = new THREE.Matrix4();
  const worldB = new THREE.Matrix4().compose(new THREE.Vector3(5, 0, 0), new THREE.Quaternion(), new THREE.Vector3(2, 1, 1));
  const bvh = new BVH.MeshBVH(a, { indirect: true });
  const onA = { point: new THREE.Vector3(), distance: Infinity, faceIndex: 0 };
  const onB = { point: new THREE.Vector3(), distance: Infinity, faceIndex: 0 };
  assert.ok(bvh.closestPointToGeometry(b, worldA.clone().invert().multiply(worldB), onA, onB));
  const pa = onA.point.applyMatrix4(worldA), pb = onB.point.applyMatrix4(worldB);
  // A spans x ≤ 0.5; B (2 m wide, centred at 5) starts at x = 4.
  assert.ok(Math.abs(pa.x - 0.5) < 1e-6 && Math.abs(pb.x - 4) < 1e-6);
  assert.ok(Math.abs(pa.distanceTo(pb) - 3.5) < 1e-6);
});

test(".bim4c packages round-trip element data and Fragments bytes, with file ids and no triangles", async () => {
  const { encodePackage, decodePackage, isPackage } = load("components/bim-viewer/bim-package");
  const fragments = new Uint8Array([1, 2, 3, 250, 251]);
  const model = {
    filename: "tower.ifc",
    id: "tower", description: "", defaultCamera: { position: [10,10,10], target: [0,0,0] },
    contentHash: "ab".repeat(32),
    fragments,
    elementsCount: 1,
    clashes: [{ id: "m3/c1", title: "Clash", description: "", severity: "low", disciplineA: "mep", disciplineB: "architecture", elementA: "ifc-42", elementB: "ifc-42", point: [0,0,0], status: "open" }],
    elements: [{
      id: "m3/ifc-42", modelKey: "m3", guid: "g", name: "Wall", ifcType: "IfcWall", psets: [{ name: "Pset", properties: [{ name: "Fire", value: "EI60" }] }],
      discipline: "architecture", storey: "L1", material: "Concrete", color: "#ffffff",
      position: [1, 2, 3], size: [1, 1, 1], geometryData: { positions: new Float32Array(9), indices: new Uint32Array(3) },
    }],
  };
  const bytes = await encodePackage(model);
  assert.equal(isPackage(bytes), true);
  const back = await decodePackage(bytes);
  assert.deepEqual([...back.fragments], [...fragments]);
  assert.equal(back.contentHash, "ab".repeat(32));
  assert.equal(back.elements[0].id, "ifc-42", "the file's own id, not the viewer's namespaced one");
  assert.equal(back.elements[0].modelKey, undefined);
  assert.equal(back.elements[0].geometryData, undefined, "Fragments holds the triangles");
  assert.equal(back.elements[0].psets[0].properties[0].value, "EI60");
  assert.equal(back.clashes[0].id, "c1");
  await assert.rejects(decodePackage(new Uint8Array(40)), /PACKAGE_INVALID/);
  const future = bytes.slice();
  new DataView(future.buffer).setUint32(8, 99, true);
  await assert.rejects(decodePackage(future), /PACKAGE_TOO_NEW/);
  await assert.rejects(decodePackage(await encodePackage({ ...model, defaultCamera: undefined })), /PACKAGE_INVALID/);
  await assert.rejects(decodePackage(await encodePackage({ ...model, elementsCount: 2, elements: [model.elements[0], model.elements[0]] })), /PACKAGE_INVALID/);
  const invalidVersion = bytes.slice();
  new DataView(invalidVersion.buffer).setUint32(8, 0, true);
  await assert.rejects(decodePackage(invalidVersion), /PACKAGE_INVALID/);
  await assert.rejects(decodePackage(bytes.slice(0, bytes.length - fragments.length)), /PACKAGE_INVALID/);
  await assert.rejects(encodePackage({ ...model, fragments: undefined }), /PACKAGE_NO_FRAGMENTS/);
});

test("Fragments element ids map to IFC express ids, including federated (namespaced) ids", () => {
  const { localIdOf } = load("components/bim-viewer/fragments-engine");
  assert.equal(localIdOf("ifc-3076"), 3076);
  assert.equal(localIdOf("m2/ifc-3076"), 3076);
  assert.equal(localIdOf("h:9617a45c/ifc-12"), 12);
  assert.equal(localIdOf("demo-slab"), null);
});

test("geometry worker failures and cancellation release waiting tools; reopening can retry", async () => {
  const { hydrateElements, hydrated, cancelHydration } = load("components/bim-viewer/fragments-engine");
  const model = { fragments: new Uint8Array([1]), elements: [{ id: "ifc-1" }] };
  const engine = { geometry: async () => { throw new Error("worker failed"); } };
  const waiter = hydrated(model);
  const run = hydrateElements(engine, "m1", model, () => {}, () => false);
  await assert.rejects(run, /worker failed/);
  await assert.rejects(waiter, /worker failed/);
  model.elements = [];
  await hydrateElements(engine, "m1", model, () => {}, () => false);
  await hydrated(model);
  const removed = { fragments: new Uint8Array([1]), elements: [] };
  const waiting = hydrated(removed);
  cancelHydration(removed);
  await assert.rejects(waiting, { name: "AbortError" });
  const pending = { fragments: new Uint8Array([1]), elements: [] };
  const controller = new AbortController();
  const cancelled = hydrated(pending, controller.signal);
  controller.abort();
  await assert.rejects(cancelled, { name: "AbortError" });
});

test("version comparison detects shape changes with identical bounds and triangle counts", async () => {
  const { compareModels, compareModelsAsync } = load("components/bim-viewer/compare");
  const element = { id: "old", guid: "G", name: "Mesh", ifcType: "IfcWall", material: "", storey: "", psets: [], position: [0,0,0], size: [1,1,1], geometryData: { positions: [0,0,0, 1,0,0, 0,1,0], indices: [0,1,2] } };
  const next = { ...element, id: "new", geometryData: { positions: [0,0,0, 1,0,0, 0,0.5,0], indices: [0,1,2] } };
  assert.deepEqual(compareModels([element], [next]).geometry, ["new"]);
  const renumbered = { ...element, id: "new", geometryData: { positions: [0,1,0, 0,0,0, 1,0,0], indices: [0,2,1] } };
  assert.deepEqual(compareModels([element], [renumbered]).unchanged, ["new"]);
  assert.deepEqual(await compareModelsAsync([element], [next]), compareModels([element], [next]));
});

test("appearance profiler colours by field or property, in values or numeric bands, with a no-value entry", () => {
  const a = load("components/bim-viewer/appearance");
  const el = (id, ifcType, storey, props = {}) => ({
    id, guid: `g-${id}`, ifcType, storey, material: "", discipline: "architecture", name: id, modelKey: "m1",
    psets: [
      { name: "IFC", properties: [{ name: "ExpressID", value: 1 }] },
      { name: "Pset_Common", properties: Object.entries(props).map(([name, value]) => ({ name, value })) },
    ],
  });
  const elements = [
    el("w1", "IfcWall", "L1", { FireRating: "EI60", Width: 0.2 }),
    el("w2", "IfcWall", "L2", { FireRating: "EI90", Width: 0.3 }),
    el("w3", "IfcWall", "L2", { Width: "0,4" }),
    el("s1", "IfcSlab", "L1", { FireRating: "EI60", Width: 1 }),
  ];
  const profile = (source, mode = "values") => ({ source, mode, bands: 3, colors: {}, hidden: [] });
  // By type: most common first, each a distinct palette colour.
  const byType = a.buildLegend(elements, profile({ kind: "field", field: "ifcType" }));
  assert.deepEqual(byType.map((e) => [e.label, e.count]), [["IfcWall", 3], ["IfcSlab", 1]]);
  assert.notEqual(byType[0].color, byType[1].color);
  // By a text property: an element without it is listed as "no value", last.
  const byFire = a.buildLegend(elements, profile({ kind: "property", name: "FireRating" }));
  assert.deepEqual(byFire.map((e) => [e.label, e.count]), [["EI60", 2], ["EI90", 1], [a.NO_VALUE_KEY, 1]]);
  assert.deepEqual(byFire.at(-1).ids, ["w3"]);
  // Numeric bands, including a comma decimal: 0.2–0.467–0.733–1.
  const byWidth = a.buildLegend(elements, profile({ kind: "property", name: "Width" }, "ranges"));
  assert.deepEqual(byWidth.map((e) => e.count), [3, 1]);
  assert.equal(byWidth[0].color, a.rangeColor(0));
  assert.equal(byWidth.at(-1).color, a.rangeColor(1));
  // Property list skips the parser's IFC set and flags numeric properties.
  const props = a.listProperties(elements);
  assert.deepEqual(props.map((p) => p.name), ["Width", "FireRating"]);
  assert.equal(props[0].numeric, true);
  assert.equal(props[1].numeric, false);
  // A picked legend colour and a hidden value.
  const custom = { ...profile({ kind: "field", field: "ifcType" }), colors: { "v:IfcSlab": "#000000" }, hidden: ["v:IfcWall"] };
  const legend = a.buildLegend(elements, custom);
  const resolved = a.resolveAppearance(elements, legend, custom, []);
  assert.equal(resolved.colors.get("s1"), "#000000");
  assert.deepEqual([...resolved.hidden].sort(), ["w1", "w2", "w3"]);
});

test("manual looks by GUID override the profile and merge colour and transparency", () => {
  const a = load("components/bim-viewer/appearance");
  const elements = [{ id: "m1/ifc-1", guid: "A", psets: [], ifcType: "IfcWall" }, { id: "m1/ifc-2", guid: "B", psets: [], ifcType: "IfcWall" }];
  let manual = a.setManualLooks([], ["A"], { color: "#ff0000" });
  manual = a.setManualLooks(manual, ["A", "B"], { opacity: 0.3 });
  assert.deepEqual(manual.find((l) => l.guid === "A"), { guid: "A", color: "#ff0000", opacity: 0.3 });
  const profile = { source: { kind: "field", field: "ifcType" }, mode: "values", bands: 5, colors: {}, hidden: [] };
  const resolved = a.resolveAppearance(elements, a.buildLegend(elements, profile), profile, manual);
  assert.equal(resolved.colors.get("m1/ifc-1"), "#ff0000", "the element's own colour wins over its legend colour");
  assert.equal(resolved.opacities.get("m1/ifc-2"), 0.3);
  // Clearing the colour keeps the transparency; clearing both drops the look.
  manual = a.setManualLooks(manual, ["A"], { color: null });
  assert.deepEqual(manual.find((l) => l.guid === "A"), { guid: "A", opacity: 0.3 });
  manual = a.setManualLooks(manual, ["A", "B"], { opacity: null });
  assert.deepEqual(manual, []);
  // Fully opaque is no override.
  assert.deepEqual(a.setManualLooks([], ["A"], { opacity: 1 }), []);
});

test("arc measurement: circle through three points in any plane, swept angle and arc length", () => {
  const { arcThrough } = load("components/bim-viewer/measurement-math");
  const p = (x, y, z) => ({ x, y, z });
  // Quarter circle of radius 2 around (1, 5, 0) in a vertical plane.
  const q = arcThrough([p(3, 5, 0), p(1 + Math.SQRT2, 5 + Math.SQRT2, 0), p(1, 7, 0)]);
  assert.ok(Math.abs(q.radius - 2) < 1e-9);
  assert.deepEqual(q.centre.map((v) => +v.toFixed(9)), [1, 5, 0]);
  assert.ok(Math.abs(q.angle - 90) < 1e-9);
  assert.ok(Math.abs(q.length - Math.PI) < 1e-9);
  // Through B the long way round: three quarters.
  const long = arcThrough([p(3, 5, 0), p(-1, 5, 0), p(1, 7, 0)]);
  assert.ok(Math.abs(long.angle - 270) < 1e-9);
  const samples = long.sample(12);
  assert.equal(samples.length, 13);
  for (const s of samples) assert.ok(Math.abs(Math.hypot(s[0] - 1, s[1] - 5, s[2]) - 2) < 1e-9);
  assert.deepEqual(samples.at(-1).map((v) => +v.toFixed(9)), [1, 7, 0]);
  // Collinear points have no circle.
  assert.equal(arcThrough([p(0, 0, 0), p(1, 1, 1), p(2, 2, 2)]), null);
});

test("circle centres are found on round edges (pipe ends), not on polygons or triangulation diagonals", () => {
  const { findCircles, fitCircle } = load("components/bim-viewer/circles");
  const { buildFeatureEdges } = load("components/bim-viewer/snapping");
  const pipe = new THREE.CylinderGeometry(0.15, 0.15, 2, 24).translate(3, 1, -2);
  const circles = findCircles(pipe.getAttribute("position").array, pipe.index.array, buildFeatureEdges(pipe.getAttribute("position").array, pipe.index.array));
  assert.equal(circles.length, 2, "one circle per pipe end");
  for (const c of circles) {
    assert.ok(Math.abs(c.radius - 0.15) < 1e-6);
    assert.ok(Math.abs(c.centre[0] - 3) < 1e-6 && Math.abs(c.centre[2] + 2) < 1e-6);
    assert.ok(Math.abs(Math.abs(c.normal[1]) - 1) < 1e-6);
  }
  assert.deepEqual(circles.map((c) => +c.centre[1].toFixed(6)).sort(), [0, 2]);
  // A box has square loops: no circles.
  const box = new THREE.BoxGeometry(1, 1, 1);
  const pos = box.getAttribute("position").array;
  assert.equal(findCircles(pos, box.index.array, buildFeatureEdges(pos, box.index.array)).length, 0);
  // A square is not a circle even though its corners are equidistant — too few points is handled
  // by the loop length; an ellipse fails the radius test.
  const ellipse = Array.from({ length: 16 }, (_, i) => [Math.cos((i / 16) * 2 * Math.PI) * 2, 0, Math.sin((i / 16) * 2 * Math.PI)]);
  assert.equal(fitCircle(ellipse), null);
});

test("clash review groups results by element, level, type pair and nearby area, and follows them across runs", () => {
  const r = load("components/bim-viewer/clash-review");
  const clash = (id, a, b, typeA, typeB, point) => ({ id, elementA: a, elementB: b, title: `${a} × ${b}`, typeA, typeB, point, severity: "high", status: "open" });
  const clashes = [
    clash("c1", "duct1", "beam1", "IfcDuctSegment", "IfcBeam", [0, 3, 0]),
    clash("c2", "duct1", "beam2", "IfcDuctSegment", "IfcBeam", [2, 3, 0]),
    clash("c3", "pipe1", "slab1", "IfcPipeSegment", "IfcSlab", [4, 3, 0]), // chained to c2 within 3 m
    clash("c4", "pipe2", "wall1", "IfcPipeSegment", "IfcWall", [50, 7, 0]),
  ];
  const levels = { duct1: "L1", pipe1: "L1", pipe2: "L2" };
  const byA = r.groupClashes(clashes, "elementA", (id) => levels[id] ?? "");
  assert.deepEqual(byA.map((g) => [g.label, g.clashes.length]), [["duct1", 2], ["pipe1", 1], ["pipe2", 1]]);
  assert.deepEqual(r.groupClashes(clashes, "level", (id) => levels[id] ?? "").map((g) => [g.label, g.clashes.length]), [["L1", 3], ["L2", 1]]);
  assert.deepEqual(r.groupClashes(clashes, "typePair", () => "").map((g) => g.label)[0], "IfcBeam × IfcDuctSegment");
  const areas = r.groupClashes(clashes, "proximity", () => "", 3);
  assert.deepEqual(areas.map((g) => [g.label, g.clashes.map((c) => c.id)]), [["#1", ["c1", "c2", "c3"]], ["#2", ["c4"]]]);
  // Runs: c1 still there, c5 new, c2 gone (resolved by the change).
  const diff = r.compareRuns(["c1", "c2"], ["c1", "c5"]);
  assert.deepEqual(diff, { added: ["c5"], active: ["c1"], gone: ["c2"] });
  assert.deepEqual(r.compareRuns(null, ["c1"]).added, ["c1"], "a first run finds everything new");
  // History keeps who changed what; assignment and note are current values.
  let review = r.reviewChange({}, "c1", { status: "in_review", by: "An" }, "2026-09-28T10:00:00Z");
  review = r.reviewChange(review, "c1", { assignee: "MEP team" }, "2026-09-28T11:00:00Z");
  review = r.reviewChange(review, "c1", { note: "Lower the duct 100 mm" }, "2026-09-28T12:00:00Z");
  assert.equal(review.c1.assignee, "MEP team");
  assert.equal(review.c1.note, "Lower the duct 100 mm");
  assert.deepEqual(review.c1.history.map((h) => h.status ?? h.assignee ?? h.note), ["in_review", "MEP team", "Lower the duct 100 mm"]);
  assert.equal(r.reviewChange(review, "c1", { assignee: "" }).c1.assignee, undefined, "clearing unassigns");
  // The CSV report has a BOM, quotes commas, flags new clashes.
  const csv = r.clashReportCsv(byA, review, {
    headers: ["G", "A", "TA", "B", "TB", "S", "St", "Gap", "X", "Y", "Z", "As", "N", "Last"],
    status: { open: "Open", in_review: "Reviewed", approved: "Approved", resolved: "Resolved" },
    severity: { high: "High", medium: "Medium", low: "Low" },
  }, (id) => id === "c2");
  assert.ok(csv.startsWith("﻿G,A,"));
  assert.match(csv, /Open \*/);
  assert.match(csv, /MEP team,Lower the duct 100 mm,2026-09-28 12:00/);
});

test("clash rules skip parts of one assembly and user-listed type pairs", async () => {
  const clash = load("components/bim-viewer/clash-detection");
  const el = (id, ifcType, discipline, x, spatialPath) => ({
    id, guid: id, name: id, ifcType, discipline, storey: "", material: "", color: "#fff", psets: [], modelKey: "m1",
    position: [x, 0, 0], size: [1, 1, 1], spatialPath,
  });
  const storey = { id: 5, type: "IFCBUILDINGSTOREY", name: "L1" };
  const wall = { id: 9, type: "IFCCURTAINWALL", name: "CW" };
  const model = { key: "m1", placement: { position: [0, 0, 0], rotationY: 0 }, model: { elements: [
    el("panel", "IfcPlate", "architecture", 0, [storey, wall]),
    el("mullion", "IfcMember", "structure", 0.5, [storey, wall]),
    el("slab", "IfcSlab", "structure", 0.2, [storey]),
    el("column", "IfcColumn", "structure", 0.3, [storey]),
  ] } };
  const pairs = (rules) => clash.clashCandidates([model], { rules: { ignoreSameDiscipline: false, ...rules } })
    .map((p) => [p.a.element.id, p.b.element.id].sort().join("-")).sort();
  const all = pairs({ ignoreSameAssembly: false });
  assert.ok(all.includes("mullion-panel"));
  assert.ok(!pairs({}).includes("mullion-panel"), "the curtain wall's own parts are one assembly");
  assert.ok(pairs({}).includes("column-slab"), "sharing only a storey is not an assembly");
  assert.ok(!pairs({ ignoredTypePairs: ["IfcColumn|IfcSlab"] }).includes("column-slab"));
  assert.ok(!pairs({ ignoredTypePairs: [clash.typePairKey("IfcSlab", "IfcColumn")] }).includes("column-slab"), "either order");
});

test("floor plans: a horizontal cut of a wall gives its outline in sheet coordinates (north up), and an A3 sheet at a standard scale", () => {
  const p = load("components/bim-viewer/plan-drawing");
  // A 4 m × 0.2 m × 3 m wall standing at x 10–14, z 5–5.2, floor at y 0.
  const wall = new THREE.BoxGeometry(4, 3, 0.2).translate(12, 1.5, 5.1);
  const identity = new THREE.Matrix4().elements;
  const cut = p.cutMesh(wall.getAttribute("position").array, wall.index.array, identity, 1.2);
  assert.ok(cut.length >= 16, "at least the four sides");
  const xs = cut.filter((_, i) => i % 2 === 0), ys = cut.filter((_, i) => i % 2 === 1);
  assert.deepEqual([Math.min(...xs), Math.max(...xs)].map((v) => +v.toFixed(6)), [10, 14]);
  assert.deepEqual([Math.min(...ys), Math.max(...ys)].map((v) => +v.toFixed(6)), [5, 5.2], "sheet y is scene z (south down)");
  // Above or below the wall: nothing; a moved mesh is cut where it stands.
  assert.equal(p.cutMesh(wall.getAttribute("position").array, wall.index.array, identity, 3.5).length, 0);
  const lifted = new THREE.Matrix4().makeTranslation(100, 10, 0).elements;
  const moved = p.cutMesh(wall.getAttribute("position").array, wall.index.array, lifted, 11.2);
  assert.ok(Math.abs(Math.min(...moved.filter((_, i) => i % 2 === 0)) - 110) < 1e-9);
  // Scales: 60 m × 30 m fits A3's drawing area at 1:200, not 1:100.
  assert.equal(p.fitScale(60, 30, 400, 249), 200);
  const drawing = { name: "Level 1", height: 1.2, floor: 0, elements: [{ id: "w", cut, below: [] }], grids: [{ tag: "A", x1: 10, y1: 0, x2: 10, y2: 10 }] };
  drawing.bounds = p.drawingBounds(drawing.elements, drawing.grids);
  const svg = p.sheetSvg(drawing, { project: "Tower <1>", sheet: "Level 1", date: "29/09/2026", scaleLabel: "Scale", north: "N" });
  assert.match(svg, /^<\?xml/);
  assert.match(svg, /width="420mm" height="297mm"/);
  assert.match(svg, /Scale: 1:\d+ \(A3\)/);
  assert.match(svg, /Tower &lt;1&gt;/, "text is escaped");
  assert.match(svg, />A<\/text>/, "grid bubbles");
  // A vertical section through the wall, seen from the south: up is up, width along x.
  const section = p.cutMeshPlane(wall.getAttribute("position").array, wall.index.array, identity, p.sectionCut([12, 0, 5.1], [0, 0, -1]));
  const sx = section.filter((_, i) => i % 2 === 0), sy = section.filter((_, i) => i % 2 === 1);
  assert.deepEqual([Math.min(...sx), Math.max(...sx)].map((v) => +v.toFixed(6)), [-2, 2], "sheet x runs to the viewer's right");
  assert.deepEqual([Math.min(...sy), Math.max(...sy)].map((v) => +v.toFixed(6)), [-3, 0], "sheet y points down: the wall top is at -3");
  const sectionSvg = p.sheetSvg({ ...drawing, kind: "section", grids: [] }, { project: "P", sheet: "S", date: "d", scaleLabel: "Scale", north: "N" });
  assert.doesNotMatch(sectionSvg, />N<\/text>/, "no north arrow on a section");
});

test("grids repeated on every level and in every file show each axis once, at its lowest copy", () => {
  const g = load("components/bim-viewer/grid-bubbles");
  assert.equal(g.gridKey("Y1", [0, 0], [10, 0]), g.gridKey("Y1", [10, 0.01], [0, 0]), "either direction, decimetre tolerance");
  assert.notEqual(g.gridKey("Y1", [0, 0], [10, 0]), g.gridKey("Y2", [0, 0], [10, 0]));
  const axis = (tag, y, x = 0) => {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, -5), new THREE.Vector3(x, y, 5)]));
    line.userData.tag = tag;
    return line;
  };
  // Two files × three levels of the same Y1/Y2 axes.
  const files = [0, 1].map(() => {
    const root = new THREE.Group();
    for (const level of [9, 0, 4.5]) root.add(axis("Y1", level, 0), axis("Y2", level, 6));
    return root;
  });
  assert.equal(g.showOneCopyPerAxis(files), 2);
  const shown = [];
  for (const root of files) root.traverse((o) => { if (o.isLine && o.visible) shown.push([o.userData.tag, o.geometry.getAttribute("position").getY(0)]); });
  assert.deepEqual(shown.sort(), [["Y1", 0], ["Y2", 0]], "the lowest copy of each axis");
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
        : name === "three"
          ? THREE
          : name === "three-mesh-bvh"
            ? BVH
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
  // No preloaded demo: the viewer opens empty and asks for the visitor's own files.
  assert.doesNotMatch(page, /DEMO_MODELS|loadDemoModel/);
  assert.match(page, /selectedElementIds/);
  assert.match(canvas, /selectedElementIds\.has/);
  assert.match(canvas, /elementIds\?\.length/);
  // The filters are translated through the dictionary (ui.bimTree).
  assert.match(panel, /bimTree\.filterDiscipline/);
  assert.match(panel, /bimTree\.filterStorey/);
  assert.match(panel, /bimTree\.spatialTree/);
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
