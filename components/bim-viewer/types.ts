import type { SerializedBVH } from "three-mesh-bvh";

export type BimDiscipline = "architecture" | "structure" | "mep" | "clash";

export type BimTool =
  "orbit" | "measure" | "section" | "explode" | "layers" | "clashes";

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
