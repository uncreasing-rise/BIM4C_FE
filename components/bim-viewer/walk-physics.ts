/**
 * First-person walking: gravity, stepping up stairs and sliding along walls.
 *
 * The scene is reached only through two probes (see WalkWorld), so the rules
 * are testable without WebGL. Units are metres; y is up.
 */
import * as THREE from "three";

export const WALK = {
  /** Eye height above the floor. */
  eye: 1.7,
  /** Highest step walked up without stopping (stairs are ~0.18 m). */
  step: 0.5,
  /** Body radius kept clear of walls. */
  radius: 0.35,
  gravity: 9.81,
  /** Terminal fall speed, so a long drop stays controllable. */
  maxFallSpeed: 20,
  /** How far below the feet a floor is searched for. */
  floorSearch: 60,
} as const;

export interface WalkWorld {
  /** Distance down from `origin` to the first walkable surface, or null. */
  castDown(origin: THREE.Vector3, maxDistance: number): number | null;
  /** First obstacle along `direction` (unit) from `origin`: distance and surface normal. */
  castAlong(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number,
  ): { distance: number; normal: THREE.Vector3 } | null;
}

export interface WalkOptions {
  gravity: boolean;
  collision: boolean;
  /** Ground plane under the whole site (the grid), used when no floor is found. */
  groundY: number;
}

export interface WalkState {
  /** Eye position. */
  position: THREE.Vector3;
  /** Vertical speed (m/s, negative when falling). */
  vy: number;
}

/** How far the body can travel along `move` (horizontal) before touching an obstacle. */
function clearance(world: WalkWorld, eye: THREE.Vector3, move: THREE.Vector3) {
  const length = move.length();
  if (length < 1e-9) return { allowed: 0, normal: null as THREE.Vector3 | null };
  const direction = move.clone().divideScalar(length);
  const feet = eye.y - WALK.eye;
  let allowed = length;
  let normal: THREE.Vector3 | null = null;
  // Knee height passes over stair treads; head height catches beams and ducts.
  for (const y of [feet + WALK.step, eye.y - 0.1]) {
    // Probe far enough that even a glancing approach sees the wall in time.
    const hit = world.castAlong(new THREE.Vector3(eye.x, y, eye.z), direction, length + WALK.radius * 4);
    if (!hit) continue;
    // Stop where the body is one radius from the wall *perpendicularly*:
    // approaching at an angle, that is further back along the path.
    const facing = Math.abs(direction.dot(hit.normal));
    if (facing < 1e-3) continue; // Moving parallel to this surface.
    const stop = Math.max(0, hit.distance - WALK.radius / facing);
    if (stop < allowed) {
      allowed = stop;
      normal = hit.normal;
    }
  }
  return { allowed, normal };
}

/** Horizontal move with collision: stop at the wall, then slide along it. */
export function collideHorizontal(world: WalkWorld, eye: THREE.Vector3, move: THREE.Vector3): THREE.Vector3 {
  const first = clearance(world, eye, move);
  if (!first.normal) return move.clone();
  const done = move.clone().setLength(first.allowed);
  const flatNormal = first.normal.clone().setY(0);
  if (flatNormal.lengthSq() < 1e-9) return done;
  flatNormal.normalize();
  const rest = move.clone().sub(done);
  const slide = rest.sub(flatNormal.multiplyScalar(rest.dot(flatNormal)));
  const from = eye.clone().add(done);
  const second = clearance(world, from, slide);
  return done.add(second.normal ? slide.setLength(second.allowed) : slide);
}

/**
 * One simulation step. `move` is the requested displacement this step
 * (horizontal from the keys; its y is used only when gravity is off).
 */
export function walkStep(
  state: WalkState,
  move: THREE.Vector3,
  world: WalkWorld,
  options: WalkOptions,
  dt: number,
): WalkState {
  const position = state.position.clone();
  const horizontal = new THREE.Vector3(move.x, 0, move.z);
  position.add(options.collision ? collideHorizontal(world, position, horizontal) : horizontal);
  if (!options.gravity) {
    position.y += move.y;
    return { position, vy: 0 };
  }
  // Probe from step height above the feet: steps up to WALK.step are climbed.
  const feet = position.y - WALK.eye;
  const probe = new THREE.Vector3(position.x, feet + WALK.step, position.z);
  const distance = world.castDown(probe, WALK.step + WALK.floorSearch);
  const floor = distance === null ? options.groundY : Math.max(probe.y - distance, options.groundY);
  const standing = floor + WALK.eye;
  if (position.y > standing + 1e-3) {
    const vy = Math.max(-WALK.maxFallSpeed, state.vy - WALK.gravity * dt);
    position.y = Math.max(standing, position.y + vy * dt);
    return { position, vy: position.y === standing ? 0 : vy };
  }
  position.y = standing;
  return { position, vy: 0 };
}

/**
 * Where to stand when walking starts. Inside the model: stay put (gravity
 * brings you to the floor). Outside: stand on the ground in front of the
 * model on the camera's side, looking at it.
 */
export function entryPose(
  camera: THREE.Vector3,
  bounds: THREE.Box3,
  groundAt: (x: number, z: number) => number | null,
): { position: THREE.Vector3; target: THREE.Vector3; moved: boolean } {
  const inside = bounds.clone().expandByScalar(0.5).containsPoint(camera);
  const center = bounds.getCenter(new THREE.Vector3());
  if (inside) return { position: camera.clone(), target: center.setY(camera.y), moved: false };
  const size = bounds.getSize(new THREE.Vector3());
  const away = new THREE.Vector3(camera.x - center.x, 0, camera.z - center.z);
  if (away.lengthSq() < 1e-9) away.set(0, 0, 1);
  away.normalize();
  // Just beyond the footprint's half-diagonal, plus a few steps.
  const reach = Math.hypot(size.x, size.z) / 2 + 4;
  const x = center.x + away.x * reach;
  const z = center.z + away.z * reach;
  const ground = groundAt(x, z) ?? bounds.min.y;
  const position = new THREE.Vector3(x, ground + WALK.eye, z);
  return { position, target: new THREE.Vector3(center.x, position.y, center.z), moved: true };
}
