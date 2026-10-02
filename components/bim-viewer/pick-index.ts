import * as THREE from "three";

/**
 * Bounding-volume tree over the element meshes, so a ray only tests the
 * elements it passes near instead of every element in the model (17k
 * elements: ~8 ms per pick without it). Built from world bounds; rebuild it
 * whenever the set of meshes or their positions change.
 */
interface Node {
  box: THREE.Box3;
  left?: Node;
  right?: Node;
  items?: number[];
}

const LEAF_SIZE = 8;
const AXES = ["x", "y", "z"] as const;

/** Distance along the ray where it enters `box` (0 when it starts inside), or -1. */
export function rayEnter(ray: THREE.Ray, box: THREE.Box3, far: number): number {
  let tmin = 0;
  let tmax = far;
  for (const axis of AXES) {
    const origin = ray.origin[axis];
    const direction = ray.direction[axis];
    const lo = box.min[axis];
    const hi = box.max[axis];
    if (Math.abs(direction) < 1e-12) {
      if (origin < lo || origin > hi) return -1;
      continue;
    }
    let t0 = (lo - origin) / direction;
    let t1 = (hi - origin) / direction;
    if (t0 > t1) [t0, t1] = [t1, t0];
    if (t0 > tmin) tmin = t0;
    if (t1 < tmax) tmax = t1;
    if (tmin > tmax) return -1;
  }
  return tmin;
}

export class PickIndex {
  private meshes: THREE.Mesh[] = [];
  private boxes: THREE.Box3[] = [];
  private root: Node | null = null;

  get size() {
    return this.meshes.length;
  }

  build(meshes: THREE.Mesh[]) {
    this.meshes = meshes;
    this.boxes = meshes.map((mesh) => {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      return mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
    });
    const centers = this.boxes.map((box) => box.getCenter(new THREE.Vector3()));
    const size = new THREE.Vector3();
    const split = (items: number[]): Node => {
      const box = new THREE.Box3();
      for (const i of items) box.union(this.boxes[i]);
      if (items.length <= LEAF_SIZE) return { box, items };
      box.getSize(size);
      const axis = size.x >= size.y && size.x >= size.z ? "x" : size.y >= size.z ? "y" : "z";
      items.sort((a, b) => centers[a][axis] - centers[b][axis]);
      const middle = items.length >> 1;
      return { box, left: split(items.slice(0, middle)), right: split(items.slice(middle)) };
    };
    this.root = meshes.length ? split(meshes.map((_, i) => i)) : null;
  }

  /**
   * Nearest hit that no clipping plane removes, like
   * `visibleHit(raycaster.intersectObjects(meshes), planes)` but visiting
   * elements front to back and stopping once nothing nearer is possible.
   */
  firstHit(
    raycaster: THREE.Raycaster,
    planes: THREE.Plane[],
    accept?: (mesh: THREE.Mesh) => boolean,
  ): THREE.Intersection | null {
    if (!this.root) return null;
    const ray = raycaster.ray;
    const far = raycaster.far;
    // NaN fails every comparison in rayEnter, so a broken ray would "enter"
    // every box and test (and build a BVH for) every element.
    const { origin, direction } = ray;
    if (!Number.isFinite(origin.x + origin.y + origin.z + direction.x + direction.y + direction.z)) return null;
    const candidates: { t: number; i: number }[] = [];
    const stack: Node[] = [this.root];
    while (stack.length) {
      const node = stack.pop()!;
      if (rayEnter(ray, node.box, far) < 0) continue;
      if (node.items) {
        for (const i of node.items) {
          const t = rayEnter(ray, this.boxes[i], far);
          if (t >= 0) candidates.push({ t, i });
        }
      } else stack.push(node.left!, node.right!);
    }
    candidates.sort((a, b) => a.t - b.t);
    // With clipping, a mesh's nearest triangle may be cut away while a
    // deeper one of the same mesh is visible, so every hit is needed.
    const firstOnly = planes.length === 0;
    const accelerated = raycaster as THREE.Raycaster & { firstHitOnly?: boolean };
    const previous = accelerated.firstHitOnly;
    accelerated.firstHitOnly = firstOnly;
    const hits: THREE.Intersection[] = [];
    let best: THREE.Intersection | null = null;
    try {
      for (const { t, i } of candidates) {
        if (best && t > best.distance) break;
        const mesh = this.meshes[i];
        if (accept && !accept(mesh)) continue;
        hits.length = 0;
        mesh.raycast(raycaster, hits);
        for (const hit of hits) {
          if (hit.distance < raycaster.near || hit.distance > far) continue;
          if (best && hit.distance >= best.distance) continue;
          if (planes.every((plane) => plane.distanceToPoint(hit.point) >= -1e-6)) best = hit;
        }
      }
    } finally {
      accelerated.firstHitOnly = previous;
    }
    return best;
  }
}
