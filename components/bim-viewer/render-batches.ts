/**
 * Draw-call batching for large models.
 *
 * Every element also keeps its own (never drawn) mesh for picking, snapping
 * and measuring; what the GPU draws is one BatchedMesh per material, so a
 * 50 000-element model costs a few dozen draw calls instead of 50 000.
 */
import * as THREE from "three";
import type { BimElementData } from "./types";

/** One drawn piece of an element: a single-material part inside a batch. */
export interface BatchSlot {
  batch: THREE.BatchedMesh;
  instance: number;
  color: THREE.Color;
  /** Element-local → model frame, before any explode offset. */
  base: THREE.Matrix4;
}

export interface ElementBatches {
  batches: Map<string, THREE.BatchedMesh>;
  slots: Map<string, BatchSlot[]>;
  /** Bytes held by the batch geometry buffers. */
  bytes: number;
}

interface Part {
  element: BimElementData;
  key: string;
  color: string;
  opacity: number;
  positions: ArrayLike<number>;
  normals?: ArrayLike<number>;
  indices: ArrayLike<number>;
  /** Index range of this part inside `indices`. */
  start: number;
  count: number;
  base: THREE.Matrix4;
}

// Colour lives in the per-instance colour, so only opacity needs its own
// material: an opaque model is a single draw call, glass adds one per opacity.
const materialKey = (_color: string, opacity: number) =>
  opacity >= 1 ? "opaque" : `alpha:${opacity}`;

let primitives: Map<string, THREE.BufferGeometry> | null = null;
function primitive(kind: string) {
  primitives ??= new Map();
  if (!primitives.has(kind)) {
    const g =
      kind === "box"
        ? new THREE.BoxGeometry(1, 1, 1)
        : new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    if (kind === "pipe") g.rotateZ(Math.PI / 2);
    primitives.set(kind, g);
  }
  return primitives.get(kind)!;
}

/** Splits every element into single-material parts, mirroring createElementMesh. */
export function elementParts(e: BimElementData): Part[] {
  const position = new THREE.Vector3(...e.position);
  if (e.geometryData) {
    const d = e.geometryData;
    const base = new THREE.Matrix4().makeTranslation(position);
    const groups = d.groups?.length
      ? d.groups
      : [{ start: 0, count: d.indices.length, color: e.color, opacity: 1 }];
    return groups.map((g) => ({
      element: e,
      key: materialKey(g.color, g.opacity),
      color: g.color,
      opacity: g.opacity,
      positions: d.positions,
      normals: d.normals,
      indices: d.indices,
      start: g.start,
      count: g.count,
      base,
    }));
  }
  const kind = e.geometryType === "pipe" || e.geometryType === "cylinder" ? e.geometryType : "box";
  const g = primitive(kind);
  const quaternion = e.quaternion
    ? new THREE.Quaternion(...e.quaternion)
    : new THREE.Quaternion().setFromEuler(new THREE.Euler(...(e.rotation ?? [0, 0, 0])));
  const opacity = e.ifcType === "IfcCurtainWall" ? 0.4 : 1;
  return [
    {
      element: e,
      key: materialKey(e.color, opacity),
      color: e.color,
      opacity,
      positions: g.getAttribute("position").array,
      normals: g.getAttribute("normal").array,
      indices: g.index!.array,
      start: 0,
      count: g.index!.count,
      base: new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(...e.size)),
    },
  ];
}

/**
 * The vertices one part actually uses, re-indexed from zero. A multi-material
 * element would otherwise copy all of its vertices into every batch.
 */
export function compactPart(part: Pick<Part, "positions" | "normals" | "indices" | "start" | "count">) {
  const remap = new Map<number, number>();
  const indices = new Uint32Array(part.count);
  for (let i = 0; i < part.count; i++) {
    const source = part.indices[part.start + i];
    let target = remap.get(source);
    if (target === undefined) {
      target = remap.size;
      remap.set(source, target);
    }
    indices[i] = target;
  }
  const positions = new Float32Array(remap.size * 3);
  const normals = part.normals ? new Float32Array(remap.size * 3) : null;
  for (const [source, target] of remap) {
    for (let k = 0; k < 3; k++) {
      positions[target * 3 + k] = part.positions[source * 3 + k];
      if (normals) normals[target * 3 + k] = part.normals![source * 3 + k];
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  if (normals) geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  else geometry.computeVertexNormals();
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return geometry;
}

/**
 * Builds the batches for a model. `shouldYield` lets the caller keep the page
 * responsive (it is awaited between elements); `material` supplies one shared
 * material per colour/opacity.
 */
export async function buildElementBatches(
  elements: BimElementData[],
  material: (color: string, opacity: number) => THREE.Material,
  shouldYield: () => Promise<boolean> = async () => false,
): Promise<ElementBatches | null> {
  // Sizing pass: BatchedMesh buffers are allocated once, up front.
  const sizes = new Map<string, { vertices: number; indices: number; instances: number; color: string; opacity: number }>();
  const parts: Part[] = [];
  for (const e of elements)
    for (const part of elementParts(e)) {
      parts.push(part);
      const size = sizes.get(part.key) ?? { vertices: 0, indices: 0, instances: 0, color: part.color, opacity: part.opacity };
      // Upper bound; compaction only ever needs fewer vertices.
      size.vertices += Math.min(part.count, part.positions.length / 3);
      size.indices += part.count;
      size.instances += 1;
      sizes.set(part.key, size);
    }
  const batches = new Map<string, THREE.BatchedMesh>();
  for (const [key, size] of sizes) {
    const batch = new THREE.BatchedMesh(
      size.instances,
      Math.max(3, size.vertices),
      Math.max(3, size.indices),
      material(size.color, size.opacity),
    );
    batch.name = `batch:${key}`;
    batch.userData.materialKey = key;
    // Per-instance culling is what keeps huge models cheap when zoomed in.
    batch.perObjectFrustumCulled = true;
    batch.sortObjects = size.opacity < 1;
    batches.set(key, batch);
  }
  const slots = new Map<string, BatchSlot[]>();
  for (const part of parts) {
    const batch = batches.get(part.key)!;
    const geometry = compactPart(part);
    const geometryId = batch.addGeometry(geometry);
    geometry.dispose();
    const instance = batch.addInstance(geometryId);
    batch.setMatrixAt(instance, part.base);
    // Materials are white; the instance colour carries the element colour so
    // selection can tint one element without a material of its own.
    const color = new THREE.Color(part.color);
    batch.setColorAt(instance, color);
    const list = slots.get(part.element.id) ?? [];
    list.push({ batch, instance, color, base: part.base });
    slots.set(part.element.id, list);
    if (await shouldYield()) {
      for (const b of batches.values()) b.dispose();
      return null;
    }
  }
  let bytes = 0;
  for (const batch of batches.values())
    for (const attribute of Object.values(batch.geometry.attributes))
      bytes += attribute.array.byteLength;
  for (const batch of batches.values()) bytes += batch.geometry.index?.array.byteLength ?? 0;
  return { batches, slots, bytes };
}

const SELECTED = new THREE.Color(0x06b6d4);
const tint = new THREE.Color();
const offsetMatrix = new THREE.Matrix4();
const instanceMatrix = new THREE.Matrix4();

/** Applies visibility, selection tint and an explode offset to an element's parts. */
export function applySlotState(
  slots: BatchSlot[] | undefined,
  visible: boolean,
  selected: boolean,
  offset: THREE.Vector3,
  /** Colour replacing the element's own (e.g. a version-comparison status). */
  override?: THREE.Color,
) {
  if (!slots) return;
  offsetMatrix.makeTranslation(offset);
  for (const slot of slots) {
    slot.batch.setVisibleAt(slot.instance, visible);
    if (!visible) continue;
    const base = override ?? slot.color;
    slot.batch.setColorAt(slot.instance, selected ? tint.copy(base).lerp(SELECTED, 0.65) : base);
    slot.batch.setMatrixAt(slot.instance, instanceMatrix.multiplyMatrices(offsetMatrix, slot.base));
  }
}
