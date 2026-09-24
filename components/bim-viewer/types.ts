import type { SerializedBVH } from "three-mesh-bvh";

export type BimDiscipline = "architecture" | "structure" | "mep" | "clash";

export type BimTool =
  | "orbit"
  | "models"
  | "measure"
  | "section"
  | "explode"
  | "layers"
  | "clashes";

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
  status: "open" | "resolved" | "in_review";
}

export interface BimModelDefinition {
  source?: "ifc";
  filename?: string;
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

export type SnapKind = "vertex" | "midpoint" | "edge" | "face";

export interface MeasurePoint extends MeasurementPoint {
  snap: SnapKind;
}

export type MeasureMode = "distance" | "point";

export interface Measurement {
  id: string;
  mode: MeasureMode;
  /** Scene coordinates; one point for "point", two for "distance". */
  points: MeasurePoint[];
}

export interface SnapSettings {
  vertex: boolean;
  midpoint: boolean;
  edge: boolean;
}
