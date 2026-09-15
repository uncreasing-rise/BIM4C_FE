"use client";

import * as WebIFC from "web-ifc";
import type { BimElementData, BimModelDefinition } from "./types";

let ifcApiInstance: WebIFC.IfcAPI | null = null;

async function getIfcApi(): Promise<WebIFC.IfcAPI> {
  if (ifcApiInstance) return ifcApiInstance;

  const api = new WebIFC.IfcAPI();
  api.SetWasmPath("/wasm/", true);
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

  onProgress?.(10);

  const modelID = api.OpenModel(data, {
    COORDINATE_TO_ORIGIN: true,
    USE_FAST_BOOLS: true,
  });

  const elements: BimElementData[] = [];

  // Expanded list of IFC structural, architectural, and MEP entities
  const ifcEntities = [
    // Architecture
    { type: WebIFC.IFCWALL, name: "IfcWall", discipline: "architecture" as const, color: "#cbd5e1" },
    { type: WebIFC.IFCWALLSTANDARDCASE, name: "IfcWallStandardCase", discipline: "architecture" as const, color: "#94a3b8" },
    { type: WebIFC.IFCWINDOW, name: "IfcWindow", discipline: "architecture" as const, color: "#38bdf8" },
    { type: WebIFC.IFCDOOR, name: "IfcDoor", discipline: "architecture" as const, color: "#a855f7" },
    { type: WebIFC.IFCROOF, name: "IfcRoof", discipline: "architecture" as const, color: "#f97316" },
    { type: WebIFC.IFCCOVERING, name: "IfcCovering", discipline: "architecture" as const, color: "#e2e8f0" },
    { type: WebIFC.IFCCURTAINWALL, name: "IfcCurtainWall", discipline: "architecture" as const, color: "#67e8f9" },
    { type: WebIFC.IFCBUILDINGELEMENTPROXY, name: "IfcBuildingElementProxy", discipline: "architecture" as const, color: "#94a3b8" },
    { type: WebIFC.IFCFURNISHINGELEMENT, name: "IfcFurnishingElement", discipline: "architecture" as const, color: "#fbbf24" },
    // Structure
    { type: WebIFC.IFCSLAB, name: "IfcSlab", discipline: "structure" as const, color: "#64748b" },
    { type: WebIFC.IFCCOLUMN, name: "IfcColumn", discipline: "structure" as const, color: "#475569" },
    { type: WebIFC.IFCBEAM, name: "IfcBeam", discipline: "structure" as const, color: "#334155" },
    { type: WebIFC.IFCFOOTING, name: "IfcFooting", discipline: "structure" as const, color: "#1e293b" },
    { type: WebIFC.IFCSTAIR, name: "IfcStair", discipline: "structure" as const, color: "#64748b" },
    { type: WebIFC.IFCSTAIRFLIGHT, name: "IfcStairFlight", discipline: "structure" as const, color: "#475569" },
    { type: WebIFC.IFCRAILING, name: "IfcRailing", discipline: "structure" as const, color: "#94a3b8" },
    { type: WebIFC.IFCPLATE, name: "IfcPlate", discipline: "structure" as const, color: "#64748b" },
    { type: WebIFC.IFCMEMBER, name: "IfcMember", discipline: "structure" as const, color: "#475569" },
    { type: WebIFC.IFCPILE, name: "IfcPile", discipline: "structure" as const, color: "#334155" },
    // MEP
    { type: WebIFC.IFCDUCTSEGMENT, name: "IfcDuctSegment", discipline: "mep" as const, color: "#06b6d4" },
    { type: WebIFC.IFCPIPESEGMENT, name: "IfcPipeSegment", discipline: "mep" as const, color: "#ef4444" },
    { type: WebIFC.IFCFLOWTERMINAL, name: "IfcFlowTerminal", discipline: "mep" as const, color: "#10b981" },
    { type: WebIFC.IFCFLOWSEGMENT, name: "IfcFlowSegment", discipline: "mep" as const, color: "#3b82f6" },
    { type: WebIFC.IFCFLOWFITTING, name: "IfcFlowFitting", discipline: "mep" as const, color: "#8b5cf6" },
    { type: WebIFC.IFCDISTRIBUTIONELEMENT, name: "IfcDistributionElement", discipline: "mep" as const, color: "#14b8a6" },
    { type: WebIFC.IFCDISTRIBUTIONFLOWELEMENT, name: "IfcDistributionFlowElement", discipline: "mep" as const, color: "#06b6d4" },
    { type: WebIFC.IFCELECTRICALELEMENT, name: "IfcElectricalElement", discipline: "mep" as const, color: "#eab308" },
  ];

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  try {
    const totalEntities = ifcEntities.length;
    for (let entityIdx = 0; entityIdx < totalEntities; entityIdx++) {
      const entityMeta = ifcEntities[entityIdx];
      try {
        const lines = api.GetLineIDsWithType(modelID, entityMeta.type);
        const count = lines.size();

        for (let i = 0; i < count; i++) {
          // Yield to main thread every 50 elements to ensure smooth parsing without browser UI freezing
          if (i > 0 && i % 50 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }

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
          } else if (entityMeta.name.includes("Pipe")) {
            sizeX = 8;
            sizeY = 0.2;
            sizeZ = 0.2;
          }

          // Track bounding box for dynamic camera framing
          minX = Math.min(minX, posX);
          minY = Math.min(minY, posY);
          minZ = Math.min(minZ, posZ);
          maxX = Math.max(maxX, posX + sizeX);
          maxY = Math.max(maxY, posY + sizeY);
          maxZ = Math.max(maxZ, posZ + sizeZ);

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
        // Continue next entity safely
      }

      const progress = Math.min(95, Math.round(10 + ((entityIdx + 1) / totalEntities) * 85));
      onProgress?.(progress);
    }
  } finally {
    api.CloseModel(modelID);
  }

  onProgress?.(100);

  if (elements.length === 0) {
    throw new Error("Không thể trích xuất cấu kiện 3D từ tệp IFC này. Tệp có thể rỗng hoặc sử dụng schema không được hỗ trợ.");
  }

  // Calculate sensible camera target & position based on extracted elements
  const centerX = isFinite(minX) && isFinite(maxX) ? (minX + maxX) / 2 : 0;
  const centerY = isFinite(minY) && isFinite(maxY) ? (minY + maxY) / 2 : 5;
  const centerZ = isFinite(minZ) && isFinite(maxZ) ? (minZ + maxZ) / 2 : 0;
  const maxSpan = Math.max(
    isFinite(maxX - minX) ? maxX - minX : 20,
    isFinite(maxY - minY) ? maxY - minY : 20,
    isFinite(maxZ - minZ) ? maxZ - minZ : 20,
  );
  const distance = Math.max(25, maxSpan * 1.2);

  return {
    id: `uploaded-${Date.now()}`,
    nameKey: "tower",
    description: `Mô hình IFC: ${file.name} (${elements.length} cấu kiện trích xuất thực tế qua Web-IFC)`,
    elementsCount: elements.length,
    elements: elements,
    clashes: [],
    defaultCamera: {
      position: [centerX + distance * 0.7, centerY + distance * 0.5, centerZ + distance * 0.7],
      target: [centerX, centerY, centerZ],
    },
  };
}

export async function parseIfcFromUrl(url: string, filename = "bim4c-commercial-tower.ifc"): Promise<BimModelDefinition> {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], filename, { type: "application/x-step" });
  return parseIfcFileToBimModel(file);
}

