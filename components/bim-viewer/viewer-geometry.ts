import * as THREE from "three";
import { acceleratedRaycast, MeshBVH } from "three-mesh-bvh";
import { clipRange, framePose, PRESET_DIRECTIONS } from "./camera-motion";
import type {
  BimBounds,
  BimClipPlanes,
  BimElementData,
  BimModelDefinition,
  BimViewPreset,
} from "./types";

export function getModelBounds(model: BimModelDefinition): BimBounds {
  if (model.bounds) return model.bounds;
  const box = new THREE.Box3();
  for (const e of model.elements) {
    const q = e.quaternion
      ? new THREE.Quaternion(...e.quaternion)
      : new THREE.Quaternion().setFromEuler(
          new THREE.Euler(...(e.rotation ?? [0, 0, 0])),
        );
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...e.position),
      q,
      new THREE.Vector3(...e.size),
    );
    box.union(
      new THREE.Box3(
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(0.5, 0.5, 0.5),
      ).applyMatrix4(m),
    );
  }
  if (box.isEmpty())
    box.set(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
  return { min: box.min.toArray(), max: box.max.toArray() };
}

export function defaultClip(bounds: BimBounds): BimClipPlanes {
  return {
    minX: bounds.min[0],
    minY: bounds.min[1],
    minZ: bounds.min[2],
    x: bounds.max[0],
    y: bounds.max[1],
    z: bounds.max[2],
    enabled: false,
  };
}

export function clippingPlanes(clip: BimClipPlanes): THREE.Plane[] {
  if (!clip.enabled) return [];
  // Rotation keeps dot products, so only the normals turn (see BimClipPlanes.rotation).
  const turn = clip.rotation ? new THREE.Quaternion(...clip.rotation) : null;
  const planes = [
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), clip.x),
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -clip.minX),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), clip.y),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -clip.minY),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), clip.z),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -clip.minZ),
  ];
  if (turn) for (const plane of planes) plane.normal.applyQuaternion(turn);
  return planes;
}

export function visibleHit(hits: THREE.Intersection[], planes: THREE.Plane[]) {
  return hits.find((hit) =>
    planes.every((plane) => plane.distanceToPoint(hit.point) >= -1e-6),
  );
}

export function explodedPosition(
  element: BimElementData,
  center: THREE.Vector3,
  factor: number,
) {
  const initial = new THREE.Vector3(...element.position);
  return initial.clone().add(
    initial
      .clone()
      .sub(center)
      .multiplyScalar(factor * 0.5),
  );
}

export function fitCamera(
  camera: THREE.PerspectiveCamera,
  bounds: THREE.Box3,
  preset: BimViewPreset,
) {
  const pose = framePose(bounds, PRESET_DIRECTIONS[preset], camera.fov, camera.aspect);
  const center = new THREE.Vector3(...pose.target);
  const radius = Math.max(0.01, bounds.getSize(new THREE.Vector3()).length() / 2);
  const range = clipRange(radius, center.distanceTo(new THREE.Vector3(...pose.position)));
  // Up stays +y for every preset; see safeViewDirection for the plan view.
  camera.up.set(0, 1, 0);
  camera.position.set(...pose.position);
  camera.near = range.near;
  camera.far = range.far;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return center;
}

export function createElementMesh(
  e: BimElementData,
  pool: Map<string, THREE.MeshStandardMaterial>,
  geometries: Map<string, THREE.BufferGeometry>,
  options: { lazyNormals?: boolean } = {},
) {
  const material = (color: string, opacity = 1) => {
    const key = `${color}:${opacity}`;
    if (!pool.has(key))
      pool.set(
        key,
        new THREE.MeshStandardMaterial({
          color,
          opacity,
          transparent: opacity < 1,
          side: THREE.DoubleSide,
          roughness: 0.86,
          metalness: 0.02,
        }),
      );
    return pool.get(key)!;
  };
  let geometry: THREE.BufferGeometry;
  let materials: THREE.Material | THREE.Material[];
  if (e.geometryData) {
    const data = e.geometryData;
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        data.positions instanceof Float32Array
          ? data.positions
          : new Float32Array(data.positions),
        3,
      ),
    );
    geometry.setIndex(
      new THREE.BufferAttribute(
        data.indices instanceof Uint32Array ||
          data.indices instanceof Uint16Array
          ? data.indices
          : new Uint32Array(data.indices),
        1,
      ),
    );
    if (data.normals)
      geometry.setAttribute(
        "normal",
        new THREE.BufferAttribute(
          data.normals instanceof Float32Array
            ? data.normals
            : new Float32Array(data.normals),
          3,
        ),
      );
    // Pick-only meshes (Fragments draws) get normals when first drawn.
    else if (!options.lazyNormals) geometry.computeVertexNormals();
    if (data.groups?.length) {
      materials = data.groups.map((g, i) => {
        geometry.addGroup(g.start, g.count, i);
        return material(g.color, g.opacity);
      });
    } else materials = material(e.color);
    if (data.bvh)
      geometry.boundsTree = MeshBVH.deserialize(data.bvh, geometry, {
        setIndex: false,
      });
  } else {
    const key =
      e.geometryType === "pipe" || e.geometryType === "cylinder"
        ? e.geometryType
        : "box";
    if (!geometries.has(key)) {
      const g =
        key === "box"
          ? new THREE.BoxGeometry(1, 1, 1)
          : new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
      if (key === "pipe") g.rotateZ(Math.PI / 2);
      geometries.set(key, g);
    }
    geometry = geometries.get(key)!;
    materials = material(e.color, e.ifcType === "IfcCurtainWall" ? 0.4 : 1);
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.raycast = acceleratedRaycast;
  mesh.position.set(...e.position);
  if (!e.geometryData) {
    mesh.scale.set(...e.size);
    if (e.quaternion) mesh.quaternion.set(...e.quaternion);
    else if (e.rotation) mesh.rotation.set(...e.rotation);
  }
  mesh.userData = { id: e.id, element: e, baseMaterial: materials };
  return mesh;
}

export function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material)
      for (const m of Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material])
        materials.add(m);
  });
  geometries.forEach((g) => {
    g.boundsTree = undefined;
    g.dispose();
  });
  materials.forEach((m) => m.dispose());
  root.clear();
}

/**
 * Clean floating-point/tessellation noise within ±5mm of standard round decimal increments (e.g. 11.997m -> 12.000m).
 */
export function cleanTessellationNoise(val: number, tolerance = 0.005): number {
  if (!Number.isFinite(val)) return val;
  const round1m = Math.round(val);
  if (Math.abs(val - round1m) <= tolerance) return round1m;
  const round10cm = Math.round(val * 10) / 10;
  if (Math.abs(val - round10cm) <= tolerance) return round10cm;
  const round1cm = Math.round(val * 100) / 100;
  if (Math.abs(val - round1cm) <= tolerance) return round1cm;
  return Math.round(val * 1000) / 1000;
}

/**
 * Compute the tightest Oriented Bounding Box (OBB) in the horizontal plane (X-Z)
 * along with vertical height (Y), removing orientation artifacts for rotated buildings and infrastructure.
 */
export function computeOrientedBounds(positions: ArrayLike<number>): {
  length: number;
  width: number;
  height: number;
  rotationAngleDeg: number;
} | null {
  if (!positions || positions.length < 9) return null;
  const count = positions.length / 3;
  let minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumZ = 0;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    sumX += x;
    sumZ += z;
  }
  const meanX = sumX / count;
  const meanZ = sumZ / count;
  const rawHeight = Math.max(0, maxY - minY);

  // 2D Covariance in X-Z
  let cxx = 0, czz = 0, cxz = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const dx = positions[i] - meanX;
    const dz = positions[i + 2] - meanZ;
    cxx += dx * dx;
    czz += dz * dz;
    cxz += dx * dz;
  }

  // Principal component angle
  const baseAngle = 0.5 * Math.atan2(2 * cxz, cxx - czz);

  // Sample angles around principal angle and cardinal directions to find minimum area bounding box
  let bestArea = Infinity;
  let bestDim: [number, number] = [0, 0];
  let bestAngle = 0;

  const testAngles = [baseAngle, baseAngle + Math.PI / 4, 0, Math.PI / 6, Math.PI / 3, Math.PI / 4];
  for (let a = 0; a < 36; a++) {
    testAngles.push((a * Math.PI) / 36);
  }

  for (const angle of testAngles) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < positions.length; i += 3) {
      const dx = positions[i] - meanX;
      const dz = positions[i + 2] - meanZ;
      const u = dx * cos + dz * sin;
      const v = -dx * sin + dz * cos;
      if (u < minU) minU = u;
      if (u > maxU) maxU = u;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }

    const du = maxU - minU;
    const dv = maxV - minV;
    const area = du * dv;
    if (area < bestArea) {
      bestArea = area;
      bestDim = [du, dv];
      bestAngle = angle;
    }
  }

  const rawLength = Math.max(bestDim[0], bestDim[1]);
  const rawWidth = Math.min(bestDim[0], bestDim[1]);
  const rotDeg = Math.round((Math.abs(bestAngle) * 180) / Math.PI) % 90;

  return {
    length: cleanTessellationNoise(rawLength),
    width: cleanTessellationNoise(rawWidth),
    height: cleanTessellationNoise(rawHeight),
    rotationAngleDeg: rotDeg,
  };
}
