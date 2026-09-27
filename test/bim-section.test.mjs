import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import ts from "typescript";
import * as THREE from "three";
import * as BVH from "three-mesh-bvh";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const cache = new Map();
function load(path) {
  let filename = resolve(root, path);
  if (!existsSync(filename)) filename += ".ts";
  if (cache.has(filename)) return cache.get(filename);
  const cjs = { exports: {} };
  cache.set(filename, cjs.exports);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (name) =>
    name === "three" ? THREE : name === "three-mesh-bvh" ? BVH : name.startsWith(".") ? load(resolve(dirname(filename), name)) : require(name);
  new Function("require", "module", "exports", source)(localRequire, cjs, cjs.exports);
  return cjs.exports;
}
const sb = load("components/bim-viewer/section-box");
const { clippingPlanes, defaultClip } = load("components/bim-viewer/viewer-geometry");
const { sessionSchema } = load("components/bim-viewer/session-schema");

const bounds = { min: [-10, 0, -6], max: [10, 12, 6] };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
/** Kept by every plane (three.js keeps points with distance >= 0). */
const kept = (planes, p) => planes.every((plane) => plane.distanceToPoint(p) >= -1e-9);
const yaw = (deg) => new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), THREE.MathUtils.degToRad(deg));

test("a box turned 30° cuts along its own axes and keeps its centre and size", () => {
  const box = { ...defaultClip({ min: [-2, 0, -1], max: [2, 3, 1] }), enabled: true };
  const turned = sb.rotateClip(box, yaw(30), bounds);
  assert.ok(sb.clipPivot(turned).distanceTo(V(0, 1.5, 0)) < 1e-9, "centre stays");
  assert.ok(Math.abs(turned.x - turned.minX - 4) < 1e-9 && Math.abs(turned.z - turned.minZ - 2) < 1e-9, "size stays");
  const planes = clippingPlanes(turned);
  // 1.9 m along the box's own long axis is inside; along scene x it pokes out of the 1 m side.
  const along = V(1.9, 1, 0).applyQuaternion(yaw(30));
  assert.ok(kept(planes, along), "inside along the turned axis");
  assert.ok(!kept(planes, V(0, 1, 1.9).applyQuaternion(yaw(30))), "outside across it");
  assert.ok(kept(clippingPlanes(box), V(1.9, 1, 0)) && !kept(clippingPlanes(box), V(1.9, 1, 0).applyQuaternion(yaw(60))));
  assert.equal(sb.rotateClip(turned, new THREE.Quaternion(), bounds).rotation, undefined, "turning back drops the rotation");
});

test("a turned single plane still passes through its pivot and spans the model", () => {
  const plane = sb.planeClip(bounds, 0);
  const pivot = sb.clipPivot(plane);
  const turned = sb.rotateClip(plane, yaw(45), bounds);
  assert.ok(sb.clipPivot(turned).distanceTo(pivot) < 1e-9, "pivot stays on the plane");
  const planes = clippingPlanes(turned).filter((_, i) => i === sb.planeIndex(0, "max"));
  const normal = V(-1, 0, 0).applyQuaternion(yaw(45));
  assert.ok(kept(planes, pivot.clone().addScaledVector(normal, 1)), "kept side");
  assert.ok(!kept(planes, pivot.clone().addScaledVector(normal, -1)), "removed side");
  const span = sb.localBounds(bounds, yaw(45));
  assert.equal(turned.minY, span.min[1]);
  assert.equal(turned.z, span.max[2]);
});

test("section at a surface lies on the face and removes the viewer's side", () => {
  const point = V(3, 2, 1);
  const towardViewer = V(1, 1, 0).normalize();
  const clip = sb.faceClip(point, towardViewer, bounds);
  assert.equal(clip.planeAxis, 0);
  const active = clippingPlanes(clip)[sb.planeIndex(0, "max")];
  assert.ok(Math.abs(active.distanceToPoint(point)) < 1e-9, "on the face");
  assert.ok(active.distanceToPoint(point.clone().add(towardViewer)) < 0, "viewer side removed");
  assert.ok(active.distanceToPoint(point.clone().sub(towardViewer)) > 0, "far side kept");
});

test("angles in the panel round-trip, flipping keeps the turn, clips stay ordered", () => {
  for (const angles of [{ x: 0, y: 0, z: 30 }, { x: 15, y: -20, z: 75 }]) {
    const q = sb.rotationFromAngles(angles);
    const back = sb.clipAngles({ ...defaultClip(bounds), rotation: q.toArray() });
    assert.deepEqual(back, angles);
  }
  // About Z (up) turns about the scene's vertical.
  assert.ok(Math.abs(sb.rotationFromAngles({ x: 0, y: 0, z: 90 }).angleTo(yaw(90))) < 1e-9);
  const turned = sb.rotateClip(sb.planeClip(bounds, 2), yaw(20), bounds);
  const flipped = sb.flipClip(turned, bounds);
  assert.deepEqual(flipped.rotation, turned.rotation);
  assert.equal(flipped.flip, true);
  assert.ok(sb.clipPivot(flipped).distanceTo(sb.clipPivot(turned)) < 1e-9, "same cut, other side");
  // A plane dragged past the model edge drags its idle opposite face along.
  const past = sb.moveFace(sb.planeClip(bounds, 0), 0, "max", -11, { min: [-12, -1, -7], max: [12, 13, 7] }, 0.01);
  assert.ok(past.x === -11 && past.minX <= past.x);
});

test("saved views accept a turned section and refuse a broken rotation", () => {
  const view = (clip) => ({
    savedViews: [{ id: "v1", name: "Cut", preset: "perspective", elementIds: [], clip }],
  });
  const turned = sb.rotateClip(sb.planeClip(bounds, 1), yaw(30), bounds);
  assert.ok(sessionSchema.safeParse(view(turned)).success);
  assert.ok(!sessionSchema.safeParse(view({ ...turned, rotation: [0, 0, 0, 3] })).success, "not a unit quaternion");
});
