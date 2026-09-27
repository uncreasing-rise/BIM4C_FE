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
  return [
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), clip.x),
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -clip.minX),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), clip.y),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -clip.minY),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), clip.z),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -clip.minZ),
  ];
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
    else geometry.computeVertexNormals();
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
