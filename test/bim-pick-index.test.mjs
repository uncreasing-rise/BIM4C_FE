import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import * as THREE from "three";
import * as BVH from "three-mesh-bvh";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const source = ts.transpileModule(readFileSync(resolve(root, "components/bim-viewer/pick-index.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const m = { exports: {} };
new Function("require", "module", "exports", source)((n) => (n === "three" ? THREE : require(n)), m, m.exports);
const { PickIndex, rayEnter } = m.exports;

/** Deterministic pseudo-random numbers, so a failure reproduces. */
function random(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

function scene(count) {
  const rnd = random(7);
  const meshes = [];
  for (let i = 0; i < count; i++) {
    const g = new THREE.BoxGeometry(0.2 + rnd() * 3, 0.2 + rnd() * 3, 0.2 + rnd() * 3);
    g.computeBoundsTree = BVH.computeBoundsTree;
    g.computeBoundsTree();
    const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    mesh.raycast = BVH.acceleratedRaycast;
    mesh.position.set(rnd() * 60 - 30, rnd() * 30, rnd() * 60 - 30);
    mesh.rotation.set(rnd(), rnd(), rnd());
    mesh.updateMatrixWorld();
    meshes.push(mesh);
  }
  return meshes;
}

const nearestVisible = (hits, planes) =>
  hits.find((h) => planes.every((p) => p.distanceToPoint(h.point) >= -1e-6)) ?? null;

test("the index finds exactly the hit a full raycast finds, with and without clipping", () => {
  const meshes = scene(600);
  const index = new PickIndex();
  index.build(meshes);
  const rnd = random(99);
  const ray = new THREE.Raycaster();
  const clip = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 12), new THREE.Plane(new THREE.Vector3(1, 0, 0), 5)];
  for (const planes of [[], clip]) {
    let hits = 0;
    for (let i = 0; i < 400; i++) {
      const origin = new THREE.Vector3(rnd() * 120 - 60, rnd() * 60, rnd() * 120 - 60);
      const target = new THREE.Vector3(rnd() * 40 - 20, rnd() * 20, rnd() * 40 - 20);
      ray.set(origin, target.sub(origin).normalize());
      const expected = nearestVisible(ray.intersectObjects(meshes, false), planes);
      const actual = index.firstHit(ray, planes);
      assert.equal(Boolean(actual), Boolean(expected), `ray ${i}`);
      if (expected) {
        hits++;
        assert.ok(Math.abs(actual.distance - expected.distance) < 1e-6, `ray ${i}: ${actual.distance} vs ${expected.distance}`);
        assert.equal(actual.object, expected.object);
      }
    }
    assert.ok(hits > 50, `enough rays hit something (${hits})`);
  }
});

test("rejected meshes are skipped and the next surface behind them is returned", () => {
  const meshes = scene(0);
  const make = (z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.2), new THREE.MeshBasicMaterial());
    mesh.position.set(0, 0, z);
    mesh.updateMatrixWorld();
    return mesh;
  };
  const front = make(-5);
  const back = make(-10);
  meshes.push(front, back);
  const index = new PickIndex();
  index.build(meshes);
  const ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1));
  assert.equal(index.firstHit(ray, []).object, front);
  assert.equal(index.firstHit(ray, [], (mesh) => mesh !== front).object, back);
  ray.far = 7;
  assert.equal(index.firstHit(ray, [], (mesh) => mesh !== front), null, "beyond far");
});

test("rayEnter: 0 from inside, entry distance from outside, -1 on a miss", () => {
  const box = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
  assert.equal(rayEnter(new THREE.Ray(new THREE.Vector3(), new THREE.Vector3(1, 0, 0)), box, 100), 0);
  assert.equal(rayEnter(new THREE.Ray(new THREE.Vector3(-5, 0, 0), new THREE.Vector3(1, 0, 0)), box, 100), 4);
  assert.equal(rayEnter(new THREE.Ray(new THREE.Vector3(-5, 3, 0), new THREE.Vector3(1, 0, 0)), box, 100), -1);
  assert.equal(rayEnter(new THREE.Ray(new THREE.Vector3(-5, 0, 0), new THREE.Vector3(1, 0, 0)), box, 3), -1);
});

test("a ray with NaN in it hits nothing and tests no element", () => {
  const meshes = scene(50);
  const index = new PickIndex();
  index.build(meshes);
  const ray = new THREE.Raycaster(new THREE.Vector3(NaN, NaN, NaN), new THREE.Vector3(0, 0, -1));
  let tested = 0;
  assert.equal(index.firstHit(ray, [], () => (tested++, true)), null);
  assert.equal(tested, 0);
});
