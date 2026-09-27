import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
import ts from "typescript";
import * as THREE from "three";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const source = ts.transpileModule(readFileSync(resolve(root, "components/bim-viewer/walk-physics.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const m = { exports: {} };
new Function("require", "module", "exports", source)((n) => (n === "three" ? THREE : require(n)), m, m.exports);
const { WALK, walkStep, collideHorizontal, entryPose } = m.exports;

/**
 * A tiny world of axis-aligned boxes, probed like the viewer's meshes:
 * castDown finds the highest top below the origin, castAlong the nearest face.
 */
function world(boxes) {
  const ray = new THREE.Ray();
  const hit = new THREE.Vector3();
  return {
    castDown(origin, max) {
      let best = null;
      for (const b of boxes) {
        ray.set(origin, new THREE.Vector3(0, -1, 0));
        if (ray.intersectBox(b, hit) && origin.distanceTo(hit) <= max) {
          const d = origin.distanceTo(hit);
          if (best === null || d < best) best = d;
        }
      }
      return best;
    },
    castAlong(origin, dir, max) {
      let best = null;
      for (const b of boxes) {
        ray.set(origin, dir);
        if (b.containsPoint(origin)) continue;
        if (ray.intersectBox(b, hit)) {
          const d = origin.distanceTo(hit);
          if (d <= max && (!best || d < best.distance)) {
            // Normal of the face that was hit.
            const c = b.getCenter(new THREE.Vector3());
            const s = b.getSize(new THREE.Vector3()).multiplyScalar(0.5);
            const local = hit.clone().sub(c);
            const n = new THREE.Vector3();
            const ax = ["x", "y", "z"].reduce((a, k) => (Math.abs(local[k] / s[k]) > Math.abs(local[a] / s[a]) ? k : a), "x");
            n[ax] = Math.sign(local[ax]);
            best = { distance: d, normal: n };
          }
        }
      }
      return best;
    },
  };
}
const box = (x0, y0, z0, x1, y1, z1) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));
const floor = box(-50, -0.3, -50, 50, 0, 50);
const options = { gravity: true, collision: true, groundY: -1 };
const run = (w, state, move, steps, opts = options) => {
  for (let i = 0; i < steps; i++) state = walkStep(state, move, w, opts, 1 / 60);
  return state;
};

test("gravity lands the eye 1.7 m above the floor and keeps it there", () => {
  const w = world([floor]);
  const s = run(w, { position: new THREE.Vector3(0, 10, 0), vy: 0 }, new THREE.Vector3(), 240);
  assert.ok(Math.abs(s.position.y - WALK.eye) < 1e-6, `y=${s.position.y}`);
  assert.equal(s.vy, 0);
});

test("a wall stops the body a radius away; moving diagonally slides along it", () => {
  const wall = box(2, 0, -10, 2.3, 3, 10);
  const w = world([floor, wall]);
  const eye = new THREE.Vector3(0, WALK.eye, 0);
  const straight = collideHorizontal(w, eye, new THREE.Vector3(5, 0, 0));
  assert.ok(Math.abs(straight.x - (2 - WALK.radius)) < 1e-6, `x=${straight.x}`);
  const diagonal = collideHorizontal(w, eye, new THREE.Vector3(5, 0, 5));
  assert.ok(diagonal.x <= 2 - WALK.radius + 1e-6, "never through the wall");
  assert.ok(diagonal.z > 4.9, `slides along it: z=${diagonal.z}`);
});

test("stairs are climbed, a tall ledge is not, a low beam blocks the head", () => {
  const steps = [0, 1, 2, 3, 4].map((i) => box(2 + i * 0.28, 0, -1, 2.28 + i * 0.28, (i + 1) * 0.18, 1));
  const landing = box(3.4, 0, -1, 8, 0.9, 1);
  const w = world([floor, ...steps, landing]);
  let s = run(w, { position: new THREE.Vector3(0, WALK.eye, 0), vy: 0 }, new THREE.Vector3(0.05, 0, 0), 120);
  assert.ok(Math.abs(s.position.y - (0.9 + WALK.eye)) < 1e-6, `standing on the landing: y=${s.position.y}`);
  const ledge = world([floor, box(2, 0, -1, 4, 1.2, 1)]);
  s = run(ledge, { position: new THREE.Vector3(0, WALK.eye, 0), vy: 0 }, new THREE.Vector3(0.05, 0, 0), 120);
  assert.ok(s.position.x < 2 - WALK.radius + 1e-6 && Math.abs(s.position.y - WALK.eye) < 1e-6, "stopped at the ledge");
  const beam = world([floor, box(2, 1.5, -5, 2.4, 2.0, 5)]);
  const hit = collideHorizontal(beam, new THREE.Vector3(0, WALK.eye, 0), new THREE.Vector3(5, 0, 0));
  assert.ok(hit.x < 2, "head-height obstacle blocks");
});

test("without gravity or collision the keys move freely, including up and down", () => {
  const w = world([floor, box(2, 0, -10, 2.3, 3, 10)]);
  const s = walkStep({ position: new THREE.Vector3(0, 5, 0), vy: 0 }, new THREE.Vector3(5, 1, 0), w, { gravity: false, collision: false, groundY: 0 }, 1 / 60);
  assert.deepEqual(s.position.toArray(), [5, 6, 0]);
});

test("walking starts on the ground in front of the model when the camera is outside it", () => {
  const bounds = box(-10, 0, -6, 10, 30, 6);
  const outside = entryPose(new THREE.Vector3(0, 40, 80), bounds, () => 0);
  assert.equal(outside.moved, true);
  assert.ok(Math.abs(outside.position.y - WALK.eye) < 1e-9, "eye height on the ground");
  assert.ok(outside.position.z > 6, "on the camera's side, outside the footprint");
  assert.ok(Math.abs(outside.target.y - outside.position.y) < 1e-9, "looking level");
  const inside = entryPose(new THREE.Vector3(1, 5, 1), bounds, () => 0);
  assert.equal(inside.moved, false);
});
