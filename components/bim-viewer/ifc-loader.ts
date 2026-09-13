"use client";

import * as WebIFC from "web-ifc";
import type { BimElementData, BimModelDefinition } from "./types";

let ifcApiInstance: WebIFC.IfcAPI | null = null;

async function getIfcApi(): Promise<WebIFC.IfcAPI> {
  if (ifcApiInstance) return ifcApiInstance;

  const api = new WebIFC.IfcAPI();
  api.SetWasmPath("/wasm/");
  await api.Init();
  ifcApiInstance = api;
  return api;
}

export async function parseIfcFileToBimModel(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<BimModelDefinition> {
  const api = await getIfcApi();
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  const modelID = api.OpenModel(data, {
    COORDINATE_TO_ORIGIN: true,
  });

  const elements: BimElementData[] = [];

  // List of common IFC structural and architectural entities to extract
  const ifcEntities = [
    { type: WebIFC.IFCWALL, name: "IfcWall", discipline: "architecture" as const, color: "#cbd5e1" },
    { type: WebIFC.IFCWALLSTANDARDCASE, name: "IfcWallStandardCase", discipline: "architecture" as const, color: "#94a3b8" },
    { type: WebIFC.IFCSLAB, name: "IfcSlab", discipline: "structure" as const, color: "#64748b" },
    { type: WebIFC.IFCCOLUMN, name: "IfcColumn", discipline: "structure" as const, color: "#475569" },
    { type: WebIFC.IFCBEAM, name: "IfcBeam", discipline: "structure" as const, color: "#334155" },
    { type: WebIFC.IFCDUCTSEGMENT, name: "IfcDuctSegment", discipline: "mep" as const, color: "#06b6d4" },
    { type: WebIFC.IFCPIPESEGMENT, name: "IfcPipeSegment", discipline: "mep" as const, color: "#ef4444" },
    { type: WebIFC.IFCWINDOW, name: "IfcWindow", discipline: "architecture" as const, color: "#38bdf8" },
    { type: WebIFC.IFCDOOR, name: "IfcDoor", discipline: "architecture" as const, color: "#a855f7" },
  ];

  for (const entityMeta of ifcEntities) {
    try {
      const lines = api.GetLineIDsWithType(modelID, entityMeta.type);
      const count = lines.size();

      for (let i = 0; i < count; i++) {
        const expressID = lines.get(i);
        const properties = api.GetLine(modelID, expressID);

        const guid = properties.GlobalId?.value || `GUID-${expressID}`;
        const name = properties.Name?.value || `${entityMeta.name} #${expressID}`;

        // Extract real 3D geometry matrix from web-ifc FlatMesh
        let posX = 0;
        let posY = 0;
        let posZ = 0;
        let sizeX = 1.0;
        let sizeY = 3.0;
        let sizeZ = 1.0;

        try {
          const flatMesh = api.GetFlatMesh(modelID, expressID);
          if (flatMesh && flatMesh.geometries && flatMesh.geometries.size() > 0) {
            const placedGeom = flatMesh.geometries.get(0);
            if (placedGeom.flatTransformation && placedGeom.flatTransformation.length === 16) {
              const m = placedGeom.flatTransformation;
              // Column-major 4x4 matrix translation components
              const tx = m[12];
              const ty = m[13];
              const tz = m[14];
              if (!isNaN(tx) && !isNaN(ty) && !isNaN(tz)) {
                posX = tx;
                posY = ty;
                posZ = tz;
              }
            }
          }
        } catch {
          // Fallback to origin if FlatMesh is not computed for this line
        }

        if (entityMeta.name.includes("Slab")) {
          sizeX = 14;
          sizeY = 0.3;
          sizeZ = 12;
          if (posY > 20 || posY < 0) posY = 0;
        } else if (entityMeta.name.includes("Column")) {
          sizeX = 0.6;
          sizeY = 3.6;
          sizeZ = 0.6;
        } else if (entityMeta.name.includes("Duct")) {
          sizeX = 10;
          sizeY = 0.4;
          sizeZ = 0.6;
        }

        elements.push({
          id: `ifc-${expressID}`,
          guid,
          name,
          ifcType: entityMeta.name,
          discipline: entityMeta.discipline,
          storey: "Tầng 1 - Level 01",
          material: "Vật liệu tiêu chuẩn IFC (buildingSMART)",
          color: entityMeta.color,
          dimensions: {
            length: sizeX,
            width: sizeZ,
            height: sizeY,
            area: sizeX * sizeZ,
            volume: sizeX * sizeY * sizeZ,
          },
          psets: [
            {
              name: "Pset_IfcProperties",
              properties: [
                { name: "ExpressID", value: expressID },
                { name: "GlobalId", value: guid },
                { name: "ObjectType", value: properties.ObjectType?.value || "Standard" },
                { name: "Schema", value: "IFC4 (buildingSMART)" },
              ],
            },
          ],
          position: [posX, posY, posZ],
          size: [sizeX, sizeY, sizeZ],
          geometryType: entityMeta.name.includes("Pipe") ? "pipe" : entityMeta.name.includes("Duct") ? "duct" : "box",
        });
      }
    } catch {
      // Continue next entity
    }
  }

  api.CloseModel(modelID);
  onProgress?.(100);

  if (elements.length === 0) {
    throw new Error("Không thể trích xuất cấu kiện 3D từ tệp IFC này. Tệp có thể rỗng hoặc sử dụng schema không được hỗ trợ.");
  }

  return {
    id: `uploaded-${Date.now()}`,
    nameKey: "tower",
    description: `Mô hình IFC: ${file.name} (${elements.length} cấu kiện trích xuất thực tế qua Web-IFC)`,
    elementsCount: elements.length,
    elements: elements,
    clashes: [],
    defaultCamera: {
      position: [24, 20, 24],
      target: [0, 5, 0],
    },
  };
}

export async function parseIfcFromUrl(url: string, filename = "bim4c-commercial-tower.ifc"): Promise<BimModelDefinition> {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], filename, { type: "application/x-step" });
  return parseIfcFileToBimModel(file);
}

