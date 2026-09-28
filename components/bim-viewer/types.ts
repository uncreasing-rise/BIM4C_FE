import type { SerializedBVH } from "three-mesh-bvh";

export type BimDiscipline = "architecture" | "structure" | "mep" | "clash";

export type BimTool =
  | "orbit"
  | "models"
  | "measure"
  | "section"
  | "explode"
  | "layers"
  | "clashes"
  | "views"
  | "display"
  | "compare"
  | "walk"
  | "markup"
  | "quantities"
  | "appearance"
  | "levels";

export type BimViewPreset =
  "perspective" | "top" | "front" | "right" | "isometric";

export interface IfcPropertyItem {
  name: string;
  value: string | number;
  unit?: string;
}

export interface IfcPropertySet {
  name: string;
  properties: IfcPropertyItem[];
}

export interface BimGeometryData {
  bvh?: SerializedBVH;
  positions: Float32Array | number[];
  normals?: Float32Array | number[];
  indices: Uint32Array | Uint16Array | number[];
  groups?: { start: number; count: number; color: string; opacity: number }[];
}

export interface BimElementData {
  source?: "ifc";
  /** Key of the federated model this element belongs to. */
  modelKey?: string;
  spatialPath?: { id: number; type: string; name: string }[];
  dimensionsSource?: "bounds";
  id: string;
  guid: string;
  name: string;
  ifcType: string;
  discipline: BimDiscipline;
  storey: string;
  material: string;
  color: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    area?: number;
    volume?: number;
  };
  psets: IfcPropertySet[];
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  quaternion?: [number, number, number, number];
  geometryType?:
    "box" | "cylinder" | "duct" | "pipe" | "slab" | "truss" | "custom";
  geometryData?: BimGeometryData;
}

export interface BimClashItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  disciplineA: string;
  elementA: string;
  disciplineB: string;
  elementB: string;
  point: [number, number, number];
  /** Navisworks' lifecycle: active, reviewed, approved (accepted as is), resolved. */
  status: "open" | "in_review" | "approved" | "resolved";
  /** Local checks: which test found it and between which files and types. */
  kind?: "hard" | "clearance";
  /** Clearance tests: gap between the two elements (m), 0 when they touch. */
  distance?: number;
  modelA?: string;
  modelB?: string;
  typeA?: string;
  typeB?: string;
}

export interface BimModelDefinition {
  source?: "ifc";
  filename?: string;
  /** SHA-256 of the file bytes: the file’s identity for saved sessions. */
  contentHash?: string;
  /**
   * The model as ThatOpen Fragments (see fragments-engine.ts). When present,
   * elements carry no geometryData from the parser: Fragments draws, and
   * triangles are fetched from it on demand (picking, clashes, quantities).
   */
  fragments?: Uint8Array;
  schema?: string;
  diagnostics?: {
    missingGeometry: number;
    failedGeometry: number;
    failedProperties: number;
  };
  bounds?: BimBounds;
  coordination?: BimCoordination;
  mapConversion?: BimMapConversion;
  id: string;
  description: string;
  elementsCount: number;
  elements: BimElementData[];
  clashes: BimClashItem[];
  defaultCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
}

export interface BimBounds {
  min: [number, number, number];
  max: [number, number, number];
}

export interface BimClipPlanes {
  x: number;
  y: number;
  z: number;
  minX: number;
  minY: number;
  minZ: number;
  enabled: boolean;
  /**
   * Single section plane on this scene axis (0 = x/east, 1 = y/elevation,
   * 2 = z/south) instead of a box. The plane is the box's max face on that
   * axis, or its min face when `flip` keeps the other side.
   */
  planeAxis?: 0 | 1 | 2;
  flip?: boolean;
  /**
   * Orientation of the box (quaternion x, y, z, w). The min/max values are
   * then coordinates in the box's own frame: local = rotation⁻¹ · scene.
   * Absent: aligned with the scene axes.
   */
  rotation?: [number, number, number, number];
}

export interface MeasurementPoint {
  x: number;
  y: number;
  z: number;
}

export interface ActiveMeasurement {
  p1: MeasurementPoint;
  p2?: MeasurementPoint;
  distance?: number;
  deltaX?: number;
  deltaY?: number;
  deltaZ?: number;
}

/** IfcMapConversion: project (engineering) coordinates → map E/N/H. Lengths in metres. */
export interface BimMapConversion {
  eastings: number;
  northings: number;
  orthogonalHeight: number;
  /** Rotation of the project X axis from grid north-east axes (radians, CCW). */
  rotation: number;
  scale: number;
  crsName?: string;
}

/**
 * How web-ifc moved the model near the origin (COORDINATE_TO_ORIGIN). The
 * model's true origin in scene axes is `-translation`; kept in float64 so large
 * survey coordinates never pass through float32 vertex buffers.
 */
export interface BimCoordination {
  translation: [number, number, number];
}

export type ModelAlignment = "shared" | "origin";

/** A loaded model plus how it is placed in the federated scene. */
export interface FederatedModel {
  key: string;
  model: BimModelDefinition;
  visible: boolean;
  alignment: ModelAlignment;
  /** Manual correction in IFC axes (metres) and rotation about vertical (degrees). */
  offset: { x: number; y: number; z: number; rotationDeg: number };
}

/** Resolved scene transform of a federated model (scene axes, Y up). */
export interface ModelPlacement {
  position: [number, number, number];
  rotationY: number;
}

export type SnapKind = "vertex" | "center" | "midpoint" | "edge" | "face";

export interface MeasurePoint extends MeasurementPoint {
  modelKey?: string;
  guid?: string;
  localPoint?: [number, number, number];
  snap: SnapKind;
  /** Surface normal where the point was picked (scene axes), for perpendicular/parallel locks. */
  normal?: [number, number, number];
}

/**
 * Measure tools, as in Navisworks: point to point (distance), point to
 * multiple points, point line (polyline), accumulate, angle, area (polygon),
 * single point and shortest distance between two objects; plus a 3-point
 * triangle area.
 */
export type MeasureMode =
  | "distance"
  | "multipoint"
  | "polyline"
  | "accumulate"
  | "angle"
  | "polygon"
  | "point"
  | "triangle"
  | "shortest"
  | "arc";

/** Constrains the next point: along an IFC axis, or along / across the previous point's surface normal. */
export type MeasureLock = "x" | "y" | "z" | "perpendicular" | "parallel" | null;

export interface MeasureUnits {
  unit: "m" | "cm" | "mm" | "ft" | "in";
  /** Decimal places. */
  precision: number;
}

export interface Measurement {
  id: string;
  mode: MeasureMode;
  /**
   * Scene metres: one point, two distance/shortest endpoints, three
   * angle/triangle vertices, a polyline/polygon outline, a base followed by
   * its targets (multipoint), or consecutive segment pairs (accumulate).
   */
  points: MeasurePoint[];
}

export interface BimSavedView {
  camera?: { position: [number, number, number]; target: [number, number, number]; up: [number, number, number]; fov: number };
  clip?: BimClipPlanes;
  hiddenElements?: string[];
  /** Elements shown solid while everything else is ghosted. */
  isolatedElements?: string[];
  /** Markup drawn over this viewpoint (see markup.ts). */
  markup?: import("./markup").MarkupShape[];
  layers?: Record<BimDiscipline, boolean>;
  explode?: number;
  projection?: "perspective" | "orthographic";
  /** Per-file visibility and placement, restored for files still open. */
  models?: Pick<FederatedModel, "key" | "visible" | "alignment" | "offset">[];
  id: string;
  name: string;
  preset: BimViewPreset;
  modelKey?: string;
  elementIds: string[];
}

/**
 * A named, explicit selection. Stored by IFC GlobalId, which survives
 * reloading files in another order (element ids do not).
 */
export interface BimSelectionSet {
  id: string;
  name: string;
  guids: string[];
}

export interface BimLocalIssue {
  id: string;
  title: string;
  description: string;
  elementIds: string[];
  clashId?: string;
  status: "open" | "resolved";
  createdAt: string;
  /** Viewpoint captured when the issue was raised (or imported from BCF). */
  camera?: BimSavedView["camera"];
  clip?: BimClipPlanes;
  /** BCF topic identity, kept so a re-export updates the same topic. */
  bcfGuid?: string;
  /** BCF topic type ("Issue", "Clash", …). */
  type?: string;
  author?: string;
}

export interface SnapSettings {
  vertex: boolean;
  /** Centres of circular edges (pipe ends, holes, round columns). */
  center: boolean;
  midpoint: boolean;
  edge: boolean;
}
