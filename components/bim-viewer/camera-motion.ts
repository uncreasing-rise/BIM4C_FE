/**
 * Camera maths shared by the canvas and the ViewCube, kept free of React so it
 * can be unit tested.
 *
 * Scene axes (see federation.ts): x = east, y = up, z = south. "Front" looks
 * north from the south (+z), matching the existing "front" view preset.
 */
import * as THREE from "three";

export type Vec3 = [number, number, number];
export type CubeFace = "front" | "back" | "left" | "right" | "top" | "bottom";

export const CUBE_FACES: CubeFace[] = ["front", "right", "back", "left", "top", "bottom"];

const FACE_FRAMES: Record<CubeFace, { normal: Vec3; right: Vec3; up: Vec3 }> = {
  front: { normal: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] },
  back: { normal: [0, 0, -1], right: [-1, 0, 0], up: [0, 1, 0] },
  right: { normal: [1, 0, 0], right: [0, 0, -1], up: [0, 1, 0] },
  left: { normal: [-1, 0, 0], right: [0, 0, 1], up: [0, 1, 0] },
  // Seen from above, north (-z) is at the top of the screen, like a plan.
  top: { normal: [0, 1, 0], right: [1, 0, 0], up: [0, 0, -1] },
  bottom: { normal: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1] },
};

/** CSS transform that places a face of the cube (CSS axes: y points down). */
export const FACE_CSS: Record<CubeFace, string> = {
  front: "",
  back: "rotateY(180deg)",
  right: "rotateY(90deg)",
  left: "rotateY(-90deg)",
  top: "rotateX(90deg)",
  bottom: "rotateX(-90deg)",
};

/**
 * Direction from the target towards the camera for one of the 3×3 hot spots
 * on a cube face: the centre is the face view, edges and corners combine the
 * neighbouring faces (col/row are -1, 0 or 1; row 1 is the top of the face).
 */
export function cubeCellDirection(face: CubeFace, col: -1 | 0 | 1, row: -1 | 0 | 1): Vec3 {
  const { normal, right, up } = FACE_FRAMES[face];
  const v = new THREE.Vector3(...normal)
    .addScaledVector(new THREE.Vector3(...right), col)
    .addScaledVector(new THREE.Vector3(...up), row)
    .normalize();
  return v.toArray() as Vec3;
}

/**
 * OrbitControls keeps the camera's up at +y and cannot look exactly straight
 * up or down. Nudging a vertical view slightly south keeps north at the top of
 * the screen for the plan view, without a roll jump when orbiting afterwards.
 */
export function safeViewDirection(direction: Vec3): Vec3 {
  const v = new THREE.Vector3(...direction).normalize();
  if (Math.abs(v.y) > 0.9999) v.set(0, Math.sign(v.y), 1e-4).normalize();
  return v.toArray() as Vec3;
}

/**
 * The ViewCube's CSS matrix for a camera: the camera's view rotation expressed
 * in CSS space, where y points down. Equivalent to F·R·F with F = diag(1,-1,1).
 */
export function cubeCssMatrix(cameraQuaternion: THREE.Quaternion): string {
  const view = new THREE.Matrix4().makeRotationFromQuaternion(cameraQuaternion.clone().invert());
  const e = view.elements.slice();
  for (const i of [1, 4, 6, 9]) e[i] = -e[i];
  return `matrix3d(${e.map((n) => (Math.abs(n) < 1e-10 ? 0 : n)).join(",")})`;
}

/**
 * Orbit pivot for a point the user pressed on. It lies on the current line of
 * sight at the depth of that point, so re-targeting does not turn the camera.
 */
export function pivotOnViewLine(cameraPosition: Vec3, target: Vec3, hit: Vec3, minDepth = 1e-3): Vec3 | null {
  const eye = new THREE.Vector3(...cameraPosition);
  const forward = new THREE.Vector3(...target).sub(eye);
  if (forward.lengthSq() < 1e-12) return null;
  forward.normalize();
  const depth = new THREE.Vector3(...hit).sub(eye).dot(forward);
  if (!(depth > minDepth)) return null;
  return eye.addScaledVector(forward, depth).toArray() as Vec3;
}

export interface OrbitPose {
  position: Vec3;
  target: Vec3;
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

/**
 * Camera pose between two orbit poses. The view direction turns on a sphere
 * around the moving target (a straight line would fly through the model) and
 * the distance changes geometrically so zooming feels even.
 */
export function interpolatePose(from: OrbitPose, to: OrbitPose, t: number): OrbitPose {
  const k = Math.min(1, Math.max(0, t));
  const fromOffset = new THREE.Vector3(...from.position).sub(new THREE.Vector3(...from.target));
  const toOffset = new THREE.Vector3(...to.position).sub(new THREE.Vector3(...to.target));
  const d0 = Math.max(fromOffset.length(), 1e-6);
  const d1 = Math.max(toOffset.length(), 1e-6);
  const turn = new THREE.Quaternion().setFromUnitVectors(
    fromOffset.clone().divideScalar(d0),
    toOffset.clone().divideScalar(d1),
  );
  const partial = new THREE.Quaternion().slerp(turn, k);
  const distance = Math.exp(Math.log(d0) + (Math.log(d1) - Math.log(d0)) * k);
  const target = new THREE.Vector3(...from.target).lerp(new THREE.Vector3(...to.target), k);
  const direction = fromOffset.divideScalar(d0).applyQuaternion(partial);
  return {
    position: target.clone().addScaledVector(direction, distance).toArray() as Vec3,
    target: target.toArray() as Vec3,
  };
}

/** The 26 directions a ViewCube can show: 6 faces, 12 edges, 8 corners. */
const CUBE_DIRECTIONS: THREE.Vector3[] = [];
for (const x of [-1, 0, 1])
  for (const y of [-1, 0, 1])
    for (const z of [-1, 0, 1])
      if (x || y || z) CUBE_DIRECTIONS.push(new THREE.Vector3(x, y, z).normalize());

/** Nearest of the 26 ViewCube directions. */
export function snapToCube(direction: Vec3): Vec3 {
  const v = new THREE.Vector3(...direction).normalize();
  let best = CUBE_DIRECTIONS[0];
  for (const d of CUBE_DIRECTIONS) if (d.dot(v) > best.dot(v)) best = d;
  return best.toArray() as Vec3;
}

export type CubeTurn = "left" | "right" | "up" | "down";

/**
 * The ViewCube's arrow buttons: turn the view 90° and land on a cube view.
 * Left/right orbit about the vertical axis; up/down tilt over the top or
 * under the bottom (from a side face, "up" goes to the plan view).
 */
export function turnDirection(direction: Vec3, turn: CubeTurn): Vec3 {
  const v = new THREE.Vector3(...direction).normalize();
  if (turn === "left" || turn === "right") {
    // "Left" moves the camera round to the model's left-hand side.
    const angle = (turn === "left" ? -1 : 1) * (Math.PI / 2);
    return snapToCube(v.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).toArray() as Vec3);
  }
  // Tilt in the vertical plane of the view, stopping at the poles (going
  // over the top would turn the picture upside down with a fixed up axis).
  const heading = new THREE.Vector3(v.x, 0, v.z);
  // Plan views are nudged south (safeViewDirection), so "down" from the top
  // lands on the front view.
  if (heading.lengthSq() < 1e-8) heading.set(0, 0, 1);
  heading.normalize();
  const elevation = Math.asin(THREE.MathUtils.clamp(v.y, -1, 1));
  const next = THREE.MathUtils.clamp(elevation + (turn === "up" ? 1 : -1) * (Math.PI / 2), -Math.PI / 2, Math.PI / 2);
  return snapToCube(
    heading.multiplyScalar(Math.cos(next)).add(new THREE.Vector3(0, Math.sin(next), 0)).toArray() as Vec3,
  );
}

/**
 * Orthographic frustum matching the perspective view at the orbit target, so
 * switching projection keeps the model the same size on screen.
 */
export function orthoHalfHeight(distanceToTarget: number, fovDeg: number) {
  return Math.max(1e-4, distanceToTarget * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
}

/** View direction (target → camera) of each toolbar preset. */
export const PRESET_DIRECTIONS: Record<string, Vec3> = {
  perspective: [1, 0.75, 1],
  isometric: [1, 0.75, 1],
  top: [0, 1, 0],
  front: [0, 0, 1],
  right: [1, 0, 0],
};

/** Near/far planes that keep depth precision for a model of this size. */
export function clipRange(radius: number, distance: number) {
  return {
    near: Math.max(0.001, radius / 10000),
    far: Math.max(100, distance + radius * 20),
  };
}

/** Pose that frames a box from a direction, for a perspective camera. */
export function framePose(
  box: THREE.Box3,
  direction: Vec3,
  fovDeg: number,
  aspect: number,
): OrbitPose {
  const center = box.getCenter(new THREE.Vector3());
  const radius = Math.max(0.01, box.getSize(new THREE.Vector3()).length() / 2);
  const vFov = THREE.MathUtils.degToRad(fovDeg);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const distance = (radius / Math.sin(Math.min(vFov, hFov) / 2)) * 1.15;
  const dir = new THREE.Vector3(...safeViewDirection(direction));
  return {
    position: center.clone().addScaledVector(dir, distance).toArray() as Vec3,
    target: center.toArray() as Vec3,
  };
}
