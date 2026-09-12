export type BimDiscipline = "architecture" | "structure" | "mep" | "clash";

export type BimTool =
  | "orbit"
  | "measure"
  | "section"
  | "explode"
  | "layers"
  | "clashes";

export type BimViewPreset =
  | "perspective"
  | "top"
  | "front"
  | "right"
  | "isometric";

export interface IfcPropertyItem {
  name: string;
  value: string | number;
  unit?: string;
}

export interface IfcPropertySet {
  name: string;
  properties: IfcPropertyItem[];
}

export interface BimElementData {
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
  geometryType?: "box" | "cylinder" | "duct" | "pipe" | "slab" | "truss";
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
  id: string;
  nameKey: "tower" | "steel" | "mep" | "villa";
  description: string;
  elementsCount: number;
  elements: BimElementData[];
  clashes: BimClashItem[];
  defaultCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
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
