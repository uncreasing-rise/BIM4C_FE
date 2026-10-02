/**
 * ThatOpen Fragments as the viewer's drawing engine for converted models.
 *
 * Fragments draws with levels of detail and screen-space tiles culled in a
 * worker, so a 6-million-triangle federation stays interactive on integrated
 * graphics. The viewer's own tools (picking, snapping, measuring, walking,
 * clashes) still work on per-element triangles: those are fetched from the
 * Fragments model in the background ("hydration", see hydrateElements) and
 * kept once, in the element's geometryData, without the old draw batches.
 *
 * Fragments local IDs are the IFC express IDs, so element `ifc-<id>` is local
 * ID `<id>`. Its coordinates are NOT the parser's (web-ifc
 * COORDINATE_TO_ORIGIN) frame: the IfcImporter recentres each file its own
 * way, a constant shift that differs per file. The shift is measured on load
 * (see frameOffset) and taken out of the drawing, triangles and grids, so
 * everything shares the parser frame the element data, storeys and
 * federation placement use.
 */
import * as THREE from "three";
import { FragmentsModels, RenderedFaces, type FragmentsModel, type MaterialDefinition, type RawMaterial } from "@thatopen/fragments";
import { mergeParts, type GeometryPart } from "./ifc-parser";
import type { BimElementData, BimModelDefinition } from "./types";

export const FRAGMENTS_WORKER_URL = "/fragments/worker.mjs";

/** Element id → Fragments local ID (IFC express ID); null for non-IFC ids. */
export function localIdOf(elementId: string): number | null {
  const match = /^ifc-(\d+)$/.exec(elementId.slice(elementId.lastIndexOf("/") + 1));
  return match ? Number(match[1]) : null;
}

/** How one element is drawn: hidden, as the file has it, or with a highlight. */
export interface ElementLook {
  visible: boolean;
  /** Replacing colour (hex), or undefined to keep the file's. */
  color?: string;
  /** 0–1; undefined keeps the file's opacity. */
  opacity?: number;
}

const lookKey = (look: ElementLook) =>
  look.visible ? (look.color === undefined && look.opacity === undefined ? "default" : `${look.color ?? ""}|${look.opacity ?? ""}`) : "hidden";

interface ModelState {
  model: FragmentsModel;
  /** Local ID → look key last sent to the worker. */
  applied: Map<number, string>;
  /** Serialises state updates: a newer one waits for the one in flight. */
  queue: Promise<void>;
  /** The model's material palette, read on the first geometry request. */
  materials?: Map<number, RawMaterial>;
  /** Fragments frame minus parser frame (see frameOffset). */
  offset: THREE.Vector3;
}

/** An element's bounding-box centre in the parser frame, to measure the frame shift with. */
export interface FrameAnchor {
  localId: number;
  centre: [number, number, number];
}

export class FragmentsEngine {
  private models: FragmentsModels | null = null;
  private readonly states = new Map<string, ModelState>();
  private planes: THREE.Plane[] = [];
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null = null;

  constructor(
    /** Called whenever Fragments changed what is on screen (tiles loaded, looks applied). */
    private readonly onChange: () => void,
  ) {}

  private get engine() {
    if (!this.models) {
      this.models = new FragmentsModels(new URL(FRAGMENTS_WORKER_URL, location.href).href);
      // Models are placed by the viewer's federation, never moved to the first one.
      this.models.settings.autoCoordinate = false;
      // New materials (one per colour / highlight) are clipped like the rest.
      this.models.models.materials.list.onItemSet.add(({ value }) => {
        (value as THREE.Material).clippingPlanes = this.planes;
        (value as THREE.Material).needsUpdate = true;
      });
    }
    return this.models;
  }

  get size() {
    return this.states.size;
  }

  has(key: string) {
    return this.states.has(key);
  }

  model(key: string) {
    return this.states.get(key)?.model ?? null;
  }

  async load(
    key: string,
    bytes: Uint8Array,
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    anchors: FrameAnchor[] = [],
  ) {
    this.camera = camera;
    // A copy: the worker takes ownership of what it is given, and the
    // original stays in the page's model (cache, reloading, exports).
    const model = await this.engine.load(bytes.slice(), { modelId: key, camera });
    model.getClippingPlanesEvent = () => this.planes;
    for (const event of [model.tiles.onItemSet, model.tiles.onItemUpdated, model.tiles.onItemDeleted])
      (event as { add: (handler: () => void) => void }).add(this.onChange);
    const state: ModelState = { model, applied: new Map(), queue: Promise.resolve(), offset: new THREE.Vector3() };
    this.states.set(key, state);
    // Measured while the offset is still zero, so geometry() reports the raw frame.
    state.offset.copy(await this.frameOffset(key, anchors));
    model.object.position.copy(state.offset).negate();
    await this.update(true);
    this.onChange();
    return model;
  }

  async remove(key: string) {
    const state = this.states.get(key);
    if (!state) return;
    this.states.delete(key);
    state.model.object.removeFromParent();
    await this.models?.disposeModel(key);
    this.onChange();
  }

  /**
   * Streams tiles for the current view; call when the camera moved. Tile
   * changes report through onChange, so this never asks for a frame itself
   * (the render loop calls it: that would never settle).
   */
  async update(force = false) {
    if (!this.models || !this.states.size) return;
    await this.models.update(force);
  }

  useCamera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    if (camera === this.camera) return;
    this.camera = camera;
    for (const { model } of this.states.values()) model.useCamera(camera);
    void this.update(true).then(this.onChange);
  }

  /** The section planes: materials clip by them and the worker culls what they remove. */
  setClippingPlanes(planes: THREE.Plane[]) {
    this.planes = planes;
    if (!this.models) return;
    for (const material of this.models.models.materials.list.values()) {
      (material as THREE.Material).clippingPlanes = planes;
      (material as THREE.Material).needsUpdate = true;
    }
    void this.update(true).then(this.onChange);
  }

  /**
   * Applies each element's look, sending only what changed since the last
   * call, grouped so a selection of thousands is a handful of messages.
   */
  applyLooks(key: string, looks: Map<number, ElementLook>) {
    const state = this.states.get(key);
    if (!state) return Promise.resolve();
    const run = async () => {
      const hide: number[] = [];
      const show: number[] = [];
      const reset: number[] = [];
      const styled = new Map<string, { look: ElementLook; ids: number[] }>();
      for (const [id, look] of looks) {
        const next = lookKey(look);
        const previous = state.applied.get(id) ?? "default";
        if (next === previous) continue;
        state.applied.set(id, next);
        if (next === "hidden") {
          hide.push(id);
          continue;
        }
        if (previous === "hidden") show.push(id);
        if (next === "default") reset.push(id);
        else {
          const group = styled.get(next) ?? { look, ids: [] };
          group.ids.push(id);
          styled.set(next, group);
        }
      }
      if (!hide.length && !show.length && !reset.length && !styled.size) return;
      const { model } = state;
      const calls: Promise<unknown>[] = [];
      if (hide.length) calls.push(model.setVisible(hide, false));
      if (show.length) calls.push(model.setVisible(show, true));
      if (reset.length) calls.push(model.resetHighlight(reset));
      for (const { look, ids } of styled.values()) calls.push(model.highlight(ids, material(look)));
      await Promise.all(calls);
      await this.update(true);
      this.onChange();
    };
    state.queue = state.queue.then(run, run);
    return state.queue;
  }

  /**
   * The constant shift from the parser frame to this model's Fragments frame:
   * per anchor, its Fragments bounding-box centre minus its parser one, then
   * the median per axis (an element the two engines triangulate differently
   * cannot skew it). Zero without anchors or geometry.
   */
  private async frameOffset(key: string, anchors: FrameAnchor[]) {
    const offset = new THREE.Vector3();
    if (!anchors.length) return offset;
    const parts = await this.geometry(key, anchors.map((a) => a.localId)).catch(() => new Map<number, GeometryPart[]>());
    const shifts: [number[], number[], number[]] = [[], [], []];
    const box = new THREE.Box3();
    const point = new THREE.Vector3();
    for (const anchor of anchors) {
      const list = parts.get(anchor.localId);
      if (!list) continue;
      box.makeEmpty();
      for (const part of list)
        for (let i = 0; i < part.positions.length; i += 3)
          box.expandByPoint(point.fromArray(part.positions, i));
      if (box.isEmpty()) continue;
      box.getCenter(point);
      for (let axis = 0; axis < 3; axis++) shifts[axis].push(point.getComponent(axis) - anchor.centre[axis]);
    }
    if (!shifts[0].length) return offset;
    const median = (values: number[]) => values.sort((a, b) => a - b)[values.length >> 1];
    return offset.set(median(shifts[0]), median(shifts[1]), median(shifts[2]));
  }

  /** Hides or shows the whole model (the models panel's eye). */
  setModelVisible(key: string, visible: boolean) {
    const state = this.states.get(key);
    if (state) state.model.object.visible = visible;
  }

  /**
   * Triangles of the given elements in the model (parser) frame, one part per
   * Fragments sample, missing ids left out.
   */
  async geometry(key: string, localIds: number[]): Promise<Map<number, GeometryPart[]>> {
    const state = this.states.get(key);
    const out = new Map<number, GeometryPart[]>();
    if (!state || !localIds.length) return out;
    const data = await state.model.getItemsGeometry(localIds);
    // Each part's own colour: sample → material (the whole palette is read once).
    const sampleIds = [...new Set(data.flat().map((m) => m?.sampleId).filter((id): id is number => id !== undefined))];
    const samples = sampleIds.length ? await state.model.getSamples(sampleIds).catch(() => null) : null;
    state.materials ??= await state.model.getMaterials().catch(() => new Map());
    const look = (sampleId?: number) => {
      const material = sampleId === undefined ? undefined : state.materials?.get(samples?.get(sampleId)?.material ?? -1);
      if (!material) return null;
      // Stored as bytes or as 0–1 depending on the exporter.
      const byte = Math.max(material.r, material.g, material.b, material.a) > 1;
      const n = (v: number) => (byte ? v / 255 : v);
      return { color: `#${new THREE.Color(n(material.r), n(material.g), n(material.b)).getHexString()}`, opacity: Math.min(1, Math.max(0.05, n(material.a))) };
    };
    const point = new THREE.Vector3();
    data.forEach((meshes, i) => {
      const parts: GeometryPart[] = [];
      for (const mesh of meshes ?? []) {
        if (!mesh.positions?.length || !mesh.indices?.length) continue;
        // From the worker the transform is a plain { elements } object, not a Matrix4.
        const transform = new THREE.Matrix4().fromArray((mesh.transform as { elements: number[] }).elements);
        const positions = new Float32Array(mesh.positions.length);
        for (let v = 0; v < positions.length; v += 3) {
          point.set(mesh.positions[v], mesh.positions[v + 1], mesh.positions[v + 2]).applyMatrix4(transform).sub(state.offset);
          positions[v] = point.x;
          positions[v + 1] = point.y;
          positions[v + 2] = point.z;
        }
        const indices = Uint32Array.from(mesh.indices);
        // A mirroring transform flips the winding.
        if (transform.determinant() < 0)
          for (let n = 0; n < indices.length; n += 3) [indices[n + 1], indices[n + 2]] = [indices[n + 2], indices[n + 1]];
        // No material found: an empty colour, which hydration replaces with the element's.
        parts.push({ positions, indices, ...(look(mesh.sampleId) ?? { color: "", opacity: 1 }) });
      }
      if (parts.length) out.set(localIds[i], parts);
    });
    return out;
  }

  /**
   * The model's column grids (IfcGrid) as lines in the model frame, or null
   * when it has none. Each axis line carries `userData.tag` (its label).
   */
  async grids(key: string): Promise<THREE.Group | null> {
    const state = this.states.get(key);
    if (!state) return null;
    try {
      const group = await state.model.getGrids();
      // Drawn in the Fragments frame: shift into the parser frame like the model.
      group.position.copy(state.offset).negate();
      // A drawing's grid grey, readable on light and dark backgrounds.
      state.model.getGridMaterial().color.set(0x64748b);
      let lines = 0;
      group.traverse((object) => {
        if ((object as THREE.Line).isLine) lines++;
      });
      return lines ? group : null;
    } catch {
      return null;
    }
  }

  /**
   * Nearest element under the pointer across all models, straight from
   * Fragments (for selecting before an element's triangles are hydrated).
   */
  async raycast(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera, mouse: THREE.Vector2, dom: HTMLCanvasElement) {
    let best: { key: string; localId: number; point: THREE.Vector3; distance: number } | null = null;
    await Promise.all(
      [...this.states].map(async ([key, { model }]) => {
        if (!model.object.visible) return;
        const hit = await model.raycast({ camera, mouse, dom });
        if (hit && (!best || hit.distance < best.distance))
          best = { key, localId: hit.localId, point: hit.point, distance: hit.distance };
      }),
    );
    return best as { key: string; localId: number; point: THREE.Vector3; distance: number } | null;
  }

  async dispose() {
    this.states.clear();
    await this.models?.dispose();
    this.models = null;
  }
}

const material = (look: ElementLook): MaterialDefinition => {
  const opacity = look.opacity ?? 1;
  return {
    color: new THREE.Color(look.color ?? "#ffffff"),
    renderedFaces: RenderedFaces.TWO,
    opacity,
    transparent: opacity < 1,
    // Only an opacity change keeps the file's colour.
    preserveOriginalMaterial: look.color === undefined,
  };
};

// ---- Hydration: per-element triangles for the viewer's own tools --------

interface Hydration {
  done: Promise<void>;
  resolve: () => void;
  reject: (reason: unknown) => void;
  started: boolean;
  failed: boolean;
}
const hydrations = new WeakMap<BimModelDefinition, Hydration>();
const HYDRATE_BATCH = 300;

const hydration = (model: BimModelDefinition) => {
  let entry = hydrations.get(model);
  if (!entry) {
    let resolve!: () => void;
    let reject!: (reason: unknown) => void;
    const done = new Promise<void>((r, j) => { resolve = r; reject = j; });
    // A model may fail before a tool subscribes. Keep the rejection available
    // to future callers without producing an unhandled rejection meanwhile.
    void done.catch(() => {});
    entry = { done, resolve, reject, started: false, failed: false };
    hydrations.set(model, entry);
  }
  return entry;
};

/**
 * Fetches every element's triangles from the Fragments model into its
 * geometryData (centred on the element's position, like the parser's), in
 * batches, calling `onBatch` after each so picking can include them. Safe to
 * call repeatedly: one hydration per model.
 */
export function hydrateElements(
  engine: FragmentsEngine,
  key: string,
  model: BimModelDefinition,
  onBatch: (elements: BimElementData[]) => void,
  isCancelled: () => boolean,
): Promise<void> {
  if (hydrations.get(model)?.failed) hydrations.delete(model);
  const entry = hydration(model);
  if (entry.started) return entry.done;
  entry.started = true;
  void (async () => {
    const pending = model.elements.filter((e) => !e.geometryData && localIdOf(e.id) !== null);
    for (let i = 0; i < pending.length; i += HYDRATE_BATCH) {
      if (isCancelled()) {
        // Stopped with the model's removal: a later load starts again.
        throw new DOMException("Cancelled", "AbortError");
      }
      const batch = pending.slice(i, i + HYDRATE_BATCH);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const done = await Promise.race([
        hydrateBatch(engine, key, batch),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("GEOMETRY_TIMEOUT")), 60_000); }),
      ]).finally(() => clearTimeout(timer));
      if (isCancelled()) throw new DOMException("Cancelled", "AbortError");
      onBatch(done);
      // Let the page breathe between batches.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    entry.resolve();
  })().catch((error: unknown) => {
    entry.started = false;
    entry.failed = true;
    entry.reject(error);
  });
  return entry.done;
}

async function hydrateBatch(engine: FragmentsEngine, key: string, batch: BimElementData[]) {
  const parts = await engine.geometry(key, batch.map((e) => localIdOf(e.id)!));
  const done: BimElementData[] = [];
  for (const element of batch) {
    const list = parts.get(localIdOf(element.id)!);
    if (!list || element.geometryData) continue;
    for (const part of list) part.color ||= element.color;
    element.geometryData = mergeParts(list, new THREE.Vector3(...element.position), false);
    done.push(element);
  }
  return done;
}

/**
 * Fetches these elements' triangles now, ahead of the background pass (the
 * element under the pointer while measuring, a clash test's two sets).
 */
export async function hydrateNow(engine: FragmentsEngine, key: string, elements: BimElementData[]) {
  const pending = elements.filter((e) => !e.geometryData && localIdOf(e.id) !== null);
  const done: BimElementData[] = [];
  for (let i = 0; i < pending.length; i += HYDRATE_BATCH)
    done.push(...(await hydrateBatch(engine, key, pending.slice(i, i + HYDRATE_BATCH))));
  return done;
}

/** Resolves once the model's elements carry their triangles (immediately for parser models). */
export function cancelHydration(model: BimModelDefinition) {
  const entry = hydrations.get(model);
  if (entry) {
    entry.failed = true;
    entry.reject(new DOMException("Cancelled", "AbortError"));
  }
}

export function hydrated(model: BimModelDefinition, signal?: AbortSignal): Promise<void> {
  signal?.throwIfAborted();
  const done = model.fragments ? hydration(model).done : Promise.resolve();
  if (!signal) return done;
  return new Promise<void>((resolve, reject) => {
    const abort = () => reject(signal.reason ?? new DOMException("Cancelled", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    done.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}
