import * as THREE from "three";
import { MeshBVH } from "three-mesh-bvh";
import type {
  BimClashItem,
  BimElementData,
  BimModelDefinition,
  ModelPlacement,
} from "./types";

interface PlacedModel {
  key: string;
  model: BimModelDefinition;
  placement: ModelPlacement;
}

type Bounds = { min: [number, number, number]; max: [number, number, number] };

interface Entry {
  owner: PlacedModel;
  element: BimElementData;
  bounds: Bounds;
}

/** One side of a clash test: a loaded file, optionally only some IFC types. */
export interface ClashSet {
  modelKey: string;
  /** IFC types to test; empty or absent means every element of the file. */
  types?: string[];
}

export interface ClashRules {
  /** "hard": the elements occupy the same space. "clearance": closer than `clearance`. */
  kind: "hard" | "clearance";
  /** Hard: overlap (m) required on every axis, so touching elements pass. */
  tolerance: number;
  /** Clearance: smallest allowed gap (m). */
  clearance: number;
  /** Skip pairs from the same discipline (a wall against a wall). */
  ignoreSameDiscipline: boolean;
}

export const DEFAULT_CLASH_RULES: ClashRules = {
  kind: "hard",
  tolerance: 0.01,
  clearance: 0.05,
  ignoreSameDiscipline: true,
};

export interface CandidateOptions {
  a?: ClashSet;
  b?: ClashSet;
  rules?: Partial<ClashRules>;
}

export interface ClashOptions extends CandidateOptions {
  /** Overlap (m) required on every axis; filters elements that merely touch. */
  tolerance?: number;
  maxResults?: number;
  /** Confirm candidates against the triangle meshes (default true). */
  verifyMeshes?: boolean;
  describe?: (clash: { volume: number; verified: boolean; kind: "hard" | "clearance"; distance: number }) => string;
  /** Awaited between candidates; return true to cancel. */
  shouldYield?: () => Promise<boolean>;
  onProgress?: (done: number, total: number) => void;
}

function boundsOf(element: BimElementData, placement: ModelPlacement): Bounds {
  const [x, y, z] = element.position;
  const [sx, sy, sz] = element.size.map((value) => Math.abs(value) / 2) as [
    number,
    number,
    number,
  ];
  const c = Math.cos(placement.rotationY);
  const s = Math.sin(placement.rotationY);
  const ex = Math.abs(c) * sx + Math.abs(s) * sz;
  const ez = Math.abs(s) * sx + Math.abs(c) * sz;
  const cx = placement.position[0] + c * x + s * z;
  const cz = placement.position[2] - s * x + c * z;
  return {
    min: [cx - ex, placement.position[1] + y - sy, cz - ez],
    max: [cx + ex, placement.position[1] + y + sy, cz + ez],
  };
}

function overlap(a: Bounds, b: Bounds, tolerance: number) {
  const size: [number, number, number] = [
    Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]),
    Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]),
    Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]),
  ];
  if (size.some((value) => value <= tolerance)) return null;
  return {
    volume: Math.max(0, size[0]) * Math.max(0, size[1]) * Math.max(0, size[2]),
    point: [
      (Math.max(a.min[0], b.min[0]) + Math.min(a.max[0], b.max[0])) / 2,
      (Math.max(a.min[1], b.min[1]) + Math.min(a.max[1], b.max[1])) / 2,
      (Math.max(a.min[2], b.min[2]) + Math.min(a.max[2], b.max[2])) / 2,
    ] as [number, number, number],
  };
}

/**
 * Candidate pairs by sweep-and-prune along x: sort once, then only compare
 * elements whose x-ranges overlap. Near-linear for building-shaped data,
 * instead of testing every pair.
 */
const inSet = (set: ClashSet | undefined, entry: Entry) =>
  !set ||
  (entry.owner.key === set.modelKey && (!set.types?.length || set.types.includes(entry.element.ifcType)));

/** Full rules from options (the old top-level `tolerance` still counts). */
export function clashRules(options: CandidateOptions & { tolerance?: number } = {}): ClashRules {
  return { ...DEFAULT_CLASH_RULES, ...(options.tolerance !== undefined ? { tolerance: options.tolerance } : {}), ...options.rules };
}

/**
 * Candidate pairs by sweep-and-prune along x: sort once, then only compare
 * elements whose x-ranges overlap. Near-linear for building-shaped data,
 * instead of testing every pair. With sets A and B only A×B pairs are
 * returned, the A element first; without them every pair is.
 */
export function clashCandidates(models: PlacedModel[], options: number | (CandidateOptions & { tolerance?: number }) = {}) {
  const opts = typeof options === "number" ? { tolerance: options } : options;
  const rules = clashRules(opts);
  // Clearance: boxes up to `clearance` apart are candidates too.
  const threshold = rules.kind === "clearance" ? -rules.clearance : rules.tolerance;
  const entries: (Entry & { inA: boolean; inB: boolean })[] = [];
  for (const owner of models)
    for (const element of owner.model.elements) {
      const entry = { owner, element, bounds: boundsOf(element, owner.placement) };
      const inA = inSet(opts.a, entry);
      const inB = inSet(opts.b, entry);
      if (inA || inB) entries.push({ ...entry, inA, inB });
    }
  entries.sort((a, b) => a.bounds.min[0] - b.bounds.min[0]);
  const pairs: { a: Entry; b: Entry; volume: number; point: [number, number, number] }[] = [];
  for (let i = 0; i < entries.length; i++) {
    const x = entries[i];
    for (let j = i + 1; j < entries.length; j++) {
      const y = entries[j];
      if (y.bounds.min[0] >= x.bounds.max[0] - threshold) break;
      const forward = x.inA && y.inB;
      if (!forward && !(x.inB && y.inA)) continue;
      // Coordination checks look for conflicts between disciplines, in the
      // same file (MEP through a beam) or across federated files.
      if (rules.ignoreSameDiscipline && x.element.discipline === y.element.discipline) continue;
      const hit = overlap(x.bounds, y.bounds, threshold);
      if (hit) pairs.push(forward ? { a: x, b: y, ...hit } : { a: y, b: x, ...hit });
    }
  }
  return pairs;
}

const volumeOf = (e: BimElementData) =>
  e.size.reduce((x, y) => x * Math.max(Math.abs(y), 0.001), 1);

function severity(volume: number, a: BimElementData, b: BimElementData): BimClashItem["severity"] {
  const ratio = volume / Math.min(volumeOf(a), volumeOf(b));
  return ratio > 0.25 ? "high" : ratio > 0.05 ? "medium" : "low";
}

const RANK = { high: 0, medium: 1, low: 2 } as const;

// ---- Triangle-level confirmation ------------------------------------------

interface ElementMesh {
  geometry: THREE.BufferGeometry;
  bvh: MeshBVH;
}
const meshCache = new WeakMap<BimElementData, ElementMesh | null>();

/** Element geometry with its BVH, sharing the parsed buffers (no copies). */
function meshOf(e: BimElementData): ElementMesh | null {
  if (meshCache.has(e)) return meshCache.get(e)!;
  let mesh: ElementMesh | null = null;
  const d = e.geometryData;
  if (d && d.indices.length) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(d.positions instanceof Float32Array ? d.positions : new Float32Array(d.positions), 3),
    );
    geometry.setIndex(
      new THREE.BufferAttribute(
        d.indices instanceof Uint32Array || d.indices instanceof Uint16Array ? d.indices : new Uint32Array(d.indices),
        1,
      ),
    );
    const bvh = d.bvh
      ? MeshBVH.deserialize(d.bvh, geometry, { setIndex: false })
      : new MeshBVH(geometry);
    // intersectsGeometry uses the other side's tree when it has one.
    geometry.boundsTree = bvh;
    mesh = { geometry, bvh };
  }
  meshCache.set(e, mesh);
  return mesh;
}

const worldOf = (e: BimElementData, placement: ModelPlacement) =>
  new THREE.Matrix4()
    .makeRotationY(placement.rotationY)
    .setPosition(...placement.position)
    .multiply(new THREE.Matrix4().makeTranslation(...e.position));

// An oblique direction, so the parity ray does not run along model edges.
const PARITY_DIRECTION = new THREE.Vector3(1, 0.1234, 0.4567).normalize();
const parityRay = new THREE.Ray();

/** Point-in-closed-mesh test: an odd number of surface crossings means inside. */
function containsPoint(mesh: ElementMesh, point: THREE.Vector3): boolean {
  parityRay.set(point, PARITY_DIRECTION);
  const hits = mesh.bvh.raycast(parityRay, THREE.DoubleSide);
  // Hits on a shared edge are reported once per adjoining triangle.
  const distances = hits.map((h) => h.distance).sort((x, y) => x - y);
  let crossings = 0;
  for (let i = 0; i < distances.length; i++)
    if (i === 0 || distances[i] - distances[i - 1] > 1e-6) crossings++;
  return crossings % 2 === 1;
}

const firstVertex = ({ geometry }: ElementMesh, matrix: THREE.Matrix4) =>
  new THREE.Vector3()
    .fromBufferAttribute(geometry.getAttribute("position") as THREE.BufferAttribute, geometry.index ? geometry.index.getX(0) : 0)
    .applyMatrix4(matrix);

/**
 * Whether the two elements really occupy the same space: their surfaces cross,
 * or one lies wholly inside the other (a pipe embedded in a wall has no
 * crossing triangles at all). Bounding boxes of a duct passing through a
 * sleeve, or of diagonal members, overlap without any real conflict.
 * Elements without triangle data fall back to their boxes.
 */
export function meshesIntersect(a: Entry, b: Entry): boolean {
  const ga = meshOf(a.element);
  const gb = meshOf(b.element);
  if (!ga || !gb) return true;
  const worldA = worldOf(a.element, a.owner.placement);
  const worldB = worldOf(b.element, b.owner.placement);
  const bToA = worldA.clone().invert().multiply(worldB);
  if (ga.bvh.intersectsGeometry(gb.geometry, bToA)) return true;
  const aToB = bToA.clone().invert();
  return (
    containsPoint(ga, firstVertex(gb, bToA)) ||
    containsPoint(gb, firstVertex(ga, aToB))
  );
}

/**
 * Smallest gap between the two elements' surfaces (0 when they intersect),
 * or null when it is larger than `max`. Without triangles: the box gap.
 */
export function meshGap(a: Entry, b: Entry, max: number): number | null {
  if (meshesIntersect(a, b)) return 0;
  const ga = meshOf(a.element);
  const gb = meshOf(b.element);
  if (!ga || !gb) {
    let gap = 0;
    for (let i = 0; i < 3; i++) {
      const d = Math.max(a.bounds.min[i] - b.bounds.max[i], b.bounds.min[i] - a.bounds.max[i], 0);
      gap += d * d;
    }
    gap = Math.sqrt(gap);
    return gap <= max ? gap : null;
  }
  const worldA = worldOf(a.element, a.owner.placement);
  const bToA = worldA.clone().invert().multiply(worldOf(b.element, b.owner.placement));
  const hit = () => ({ point: new THREE.Vector3(), distance: Infinity, faceIndex: 0 });
  const found = ga.bvh.closestPointToGeometry(gb.geometry, bToA, hit(), hit(), 0, max);
  return found && found.distance <= max ? found.distance : null;
}

const defaultDescribe = ({ volume, verified, kind, distance }: { volume: number; verified: boolean; kind: "hard" | "clearance"; distance: number }) =>
  kind === "clearance"
    ? `Clearance ${(distance * 1000).toFixed(0)} mm. Review before acting.`
    : `${verified ? "Mesh-verified" : "Bounding-box"} overlap (${volume.toFixed(3)} m³). Review before acting.`;

/** Clearance severity: the closer, the worse; touching is high. */
function gapSeverity(distance: number, clearance: number): BimClashItem["severity"] {
  const ratio = distance / Math.max(clearance, 1e-9);
  return ratio < 0.25 ? "high" : ratio < 0.6 ? "medium" : "low";
}

/** Fast browser-side coordination pass, ranked most severe first. */
export async function detectClashes(
  models: PlacedModel[],
  options: ClashOptions = {},
): Promise<BimClashItem[]> {
  const {
    maxResults = 500,
    verifyMeshes = true,
    describe = defaultDescribe,
    shouldYield = async () => false,
    onProgress,
  } = options;
  const rules = clashRules(options);
  const candidates = clashCandidates(models, options);
  const clashes: { clash: BimClashItem; volume: number }[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const { a, b, volume, point } = candidates[i];
    const verified = verifyMeshes && Boolean(a.element.geometryData && b.element.geometryData);
    const clearance = rules.kind === "clearance";
    const gap = clearance ? (verifyMeshes ? meshGap(a, b, rules.clearance) : 0) : 0;
    const found = clearance ? gap !== null : !verifyMeshes || meshesIntersect(a, b);
    if (found) {
      const distance = gap ?? 0;
      clashes.push({ volume: clearance ? -distance : volume, clash: {
        id: `local-${a.element.id}-${b.element.id}`,
        title: `${a.element.name || a.element.ifcType} × ${b.element.name || b.element.ifcType}`,
        description: describe({ volume, verified, kind: rules.kind, distance }),
        severity: clearance ? gapSeverity(distance, rules.clearance) : severity(volume, a.element, b.element),
        kind: rules.kind,
        ...(clearance ? { distance } : {}),
        modelA: a.owner.key,
        modelB: b.owner.key,
        typeA: a.element.ifcType,
        typeB: b.element.ifcType,
        disciplineA: a.element.discipline,
        elementA: a.element.id,
        disciplineB: b.element.discipline,
        elementB: b.element.id,
        point,
        status: "open",
      } });
    }
    onProgress?.(i + 1, candidates.length);
    if (await shouldYield()) break;
  }
  return ranked(clashes, maxResults);
}

function ranked(list: { clash: BimClashItem; volume: number }[], max: number) {
  return list
    .sort((x, y) => RANK[x.clash.severity] - RANK[y.clash.severity] || y.volume - x.volume)
    .slice(0, max)
    .map(({ clash }) => clash);
}

/** Synchronous bounding-box-only pass (no mesh confirmation), ranked. */
export function detectAabbClashes(models: PlacedModel[], tolerance = 0.01): BimClashItem[] {
  const list = clashCandidates(models, tolerance).map(({ a, b, volume, point }) => ({
    volume,
    clash: {
      id: `local-${a.element.id}-${b.element.id}`,
      title: `${a.element.name || a.element.ifcType} × ${b.element.name || b.element.ifcType}`,
      description: defaultDescribe({ volume, verified: false, kind: "hard", distance: 0 }),
      severity: severity(volume, a.element, b.element),
      disciplineA: a.element.discipline,
      elementA: a.element.id,
      disciplineB: b.element.discipline,
      elementB: b.element.id,
      point,
      status: "open" as const,
    },
  }));
  return ranked(list, 500);
}
