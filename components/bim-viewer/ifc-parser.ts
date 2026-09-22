import * as IFC from "web-ifc";
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  Matrix3,
  Matrix4,
  Vector3,
} from "three";
import { MeshBVH } from "three-mesh-bvh";
import type {
  BimElementData,
  BimGeometryData,
  BimModelDefinition,
  IfcPropertyItem,
  IfcPropertySet,
} from "./types";

type Line = Record<string, unknown>;
const object = (v: unknown): Line =>
  v && typeof v === "object" ? (v as Line) : {};
const value = (v: unknown): unknown => object(v).value ?? v;
const string = (v: unknown): string => (v == null ? "" : String(value(v)));
const refs = (v: unknown): number[] =>
  (Array.isArray(v) ? v : v == null ? [] : [v])
    .map((x) => Number(value(x)))
    .filter(Number.isFinite);

/** Runs in a dedicated worker. No model data leaves the browser. */
export function parseIfcData(
  api: IFC.IfcAPI,
  data: Uint8Array,
  filename: string,
  progress: (n: number) => void = () => {},
): BimModelDefinition {
  if (!data.length) throw new Error("IFC_FILE_EMPTY");
  const decoder = new TextDecoder();
  if (
    !decoder.decode(data.subarray(0, 1024)).includes("ISO-10303-21;") ||
    !decoder
      .decode(data.subarray(Math.max(0, data.length - 1024)))
      .includes("END-ISO-10303-21;")
  )
    throw new Error("IFC_INVALID");
  const modelID = api.OpenModel(data, { COORDINATE_TO_ORIGIN: true });
  if (modelID < 0 || !api.IsModelOpen(modelID)) throw new Error("IFC_INVALID");
  const diagnostics = {
    missingGeometry: 0,
    failedGeometry: 0,
    failedProperties: 0,
  };
  const elements: BimElementData[] = [];
  const cache = new Map<number, Line>();
  const read = (id: number): Line => {
    if (!cache.has(id)) cache.set(id, api.GetLine(modelID, id) as Line);
    return cache.get(id) ?? {};
  };
  const ids = (type: number, inherited = false) => {
    const vector = api.GetLineIDsWithType(modelID, type, inherited);
    return Array.from({ length: vector.size() }, (_, i) => vector.get(i));
  };
  const typeName = (node: Line) => api.GetNameFromTypeCode(Number(node.type));
  try {
    const schema = api.GetModelSchema(modelID);
    const parents = new Map<number, number>();
    const psets = new Map<number, number[]>();
    const materials = new Map<number, number[]>();
    const types = new Map<number, number>();
    const append = (
      map: Map<number, number[]>,
      key: number,
      values: number[],
    ) => map.set(key, [...(map.get(key) ?? []), ...values]);
    for (const id of ids(IFC.IFCRELAGGREGATES)) {
      const r = read(id);
      for (const child of refs(r.RelatedObjects))
        parents.set(child, refs(r.RelatingObject)[0]);
    }
    for (const id of ids(IFC.IFCRELCONTAINEDINSPATIALSTRUCTURE)) {
      const r = read(id);
      for (const child of refs(r.RelatedElements))
        parents.set(child, refs(r.RelatingStructure)[0]);
    }
    for (const id of ids(IFC.IFCRELDEFINESBYPROPERTIES)) {
      const r = read(id);
      for (const child of refs(r.RelatedObjects))
        append(psets, child, refs(r.RelatingPropertyDefinition));
    }
    for (const id of ids(IFC.IFCRELDEFINESBYTYPE)) {
      const r = read(id);
      for (const child of refs(r.RelatedObjects))
        types.set(child, refs(r.RelatingType)[0]);
    }
    for (const id of ids(IFC.IFCRELASSOCIATESMATERIAL)) {
      const r = read(id);
      for (const child of refs(r.RelatedObjects))
        append(materials, child, refs(r.RelatingMaterial));
    }
    const unitLabel = (id: number, seen = new Set<number>()): string => {
      if (seen.has(id)) return "";
      seen.add(id);
      const u = read(id);
      if (u.Name)
        return [string(u.Prefix), string(u.Name)].filter(Boolean).join(" ");
      if (u.Elements)
        return refs(u.Elements)
          .map((e) => {
            const n = read(e);
            return `${unitLabel(refs(n.Unit)[0], seen)}^${string(n.Exponent)}`;
          })
          .join(" · ");
      return string(u.UnitType);
    };
    const defaultUnits = new Map<string, string>();
    for (const id of ids(IFC.IFCUNITASSIGNMENT))
      for (const uid of refs(read(id).Units))
        defaultUnits.set(string(read(uid).UnitType), unitLabel(uid));
    const formatValue = (v: unknown): string | number => {
      if (v == null) return "—";
      if (Array.isArray(v)) return v.map((x) => formatValue(x)).join(", ");
      if (object(v).type === IFC.REF) {
        const n = read(Number(value(v)));
        return string(n.Name) || string(n.Identification) || `#${value(v)}`;
      }
      const scalar = value(v);
      return typeof scalar === "number"
        ? scalar
        : typeof scalar === "boolean"
          ? String(scalar)
          : typeof scalar === "object"
            ? JSON.stringify(scalar)
            : String(scalar);
    };
    const propertyItems = (
      id: number,
      prefix = "",
      seen = new Set<number>(),
    ): IfcPropertyItem[] => {
      if (seen.has(id)) return [];
      seen.add(id);
      const p = read(id);
      const name = prefix + (string(p.Name) || `#${id}`);
      const children = refs(p.HasProperties ?? p.HasQuantities);
      if (children.length)
        return children.flatMap((c) => propertyItems(c, `${name}.`, seen));
      const values = Object.entries(p).filter(
        ([key]) => /Value(s)?$/.test(key) && key !== "Unit",
      );
      const unitType = /LengthValue/.test(values[0]?.[0] ?? "")
        ? "LENGTHUNIT"
        : /AreaValue/.test(values[0]?.[0] ?? "")
          ? "AREAUNIT"
          : /VolumeValue/.test(values[0]?.[0] ?? "")
            ? "VOLUMEUNIT"
            : "";
      const unit = p.Unit
        ? unitLabel(refs(p.Unit)[0])
        : defaultUnits.get(unitType);
      if (!values.length)
        return [
          {
            name,
            value: formatValue(p.PropertyReference ?? p.Description),
            unit,
          },
        ];
      return values.map(([key, v]) => ({
        name: values.length > 1 ? `${name}.${key}` : name,
        value: formatValue(v),
        unit,
      }));
    };
    const readPsets = (id: number): IfcPropertySet[] => {
      const type = types.get(id);
      const related = [
        ...(psets.get(id) ?? []),
        ...(type ? refs(read(type).HasPropertySets) : []),
      ];
      return [...new Set(related)].map((pid) => {
        const p = read(pid);
        return {
          name: `${string(p.Name) || typeName(p)} (#${pid})`,
          properties: refs(p.HasProperties ?? p.Quantities).flatMap((x) =>
            propertyItems(x),
          ),
        };
      });
    };
    const materialNames = (id: number, seen = new Set<number>()): string[] => {
      if (seen.has(id)) return [];
      seen.add(id);
      const n = read(id);
      const names =
        Number(n.type) === IFC.IFCMATERIAL && n.Name ? [string(n.Name)] : [];
      for (const key of [
        "Material",
        "Materials",
        "MaterialLayers",
        "ForLayerSet",
        "MaterialProfiles",
        "ForProfileSet",
        "MaterialConstituents",
      ])
        for (const child of refs(n[key]))
          names.push(...materialNames(child, seen));
      return names;
    };
    const mep = new Set(ids(IFC.IFCDISTRIBUTIONELEMENT, true));
    const candidates = new Set(ids(IFC.IFCELEMENT, true));
    progress(10);
    api.StreamAllMeshes(modelID, (flat, index, total) => {
      if (!flat.geometries.size()) return;
      const expressID = flat.expressID;
      candidates.delete(expressID);
      const parts: {
        positions: Float32Array;
        normals: Float32Array;
        indices: Uint32Array;
        color: string;
        opacity: number;
      }[] = [];
      const bounds = new Box3();
      try {
        for (let i = 0; i < flat.geometries.size(); i++) {
          const placed = flat.geometries.get(i);
          const geometry = api.GetGeometry(modelID, placed.geometryExpressID);
          try {
            const raw = api.GetVertexArray(
              geometry.GetVertexData(),
              geometry.GetVertexDataSize(),
            );
            const indices = api.GetIndexArray(
              geometry.GetIndexData(),
              geometry.GetIndexDataSize(),
            );
            if (
              !raw.length ||
              !indices.length ||
              raw.length % 6 ||
              indices.length % 3
            )
              throw new Error("Invalid mesh");
            const matrix = new Matrix4().fromArray(placed.flatTransformation);
            const normalMatrix = new Matrix3().getNormalMatrix(matrix);
            const positions = new Float32Array(raw.length / 2);
            const normals = new Float32Array(raw.length / 2);
            const point = new Vector3();
            const normal = new Vector3();
            for (let v = 0, p = 0; v < raw.length; v += 6, p += 3) {
              point.set(raw[v], raw[v + 1], raw[v + 2]).applyMatrix4(matrix);
              if (![point.x, point.y, point.z].every(Number.isFinite))
                throw new Error("Invalid vertex");
              bounds.expandByPoint(point);
              point.toArray(positions, p);
              normal
                .set(raw[v + 3], raw[v + 4], raw[v + 5])
                .applyNormalMatrix(normalMatrix)
                .toArray(normals, p);
            }
            if (indices.some((v) => v >= positions.length / 3))
              throw new Error("Invalid index");
            if (matrix.determinant() < 0)
              for (let n = 0; n < indices.length; n += 3)
                [indices[n + 1], indices[n + 2]] = [
                  indices[n + 2],
                  indices[n + 1],
                ];
            parts.push({
              positions,
              normals,
              indices,
              color: `#${new Color(placed.color.x, placed.color.y, placed.color.z).getHexString()}`,
              opacity: placed.color.w,
            });
          } finally {
            geometry.delete();
          }
        }
    } catch {
        diagnostics.failedGeometry++;
        return;
      }
      if (!parts.length) return;
      const center = bounds.getCenter(new Vector3());
      const size = bounds.getSize(new Vector3());
      const positions = new Float32Array(
        parts.reduce((n, p) => n + p.positions.length, 0),
      );
      const normals = new Float32Array(positions.length);
      const indices = new Uint32Array(
        parts.reduce((n, p) => n + p.indices.length, 0),
      );
      const groups: NonNullable<BimGeometryData["groups"]> = [];
      let vOffset = 0,
        iOffset = 0;
      for (const part of parts) {
        for (let i = 0; i < part.positions.length; i += 3) {
          positions[vOffset + i] = part.positions[i] - center.x;
          positions[vOffset + i + 1] = part.positions[i + 1] - center.y;
          positions[vOffset + i + 2] = part.positions[i + 2] - center.z;
        }
        normals.set(part.normals, vOffset);
        for (let i = 0; i < part.indices.length; i++)
          indices[iOffset + i] = part.indices[i] + vOffset / 3;
        groups.push({
          start: iOffset,
          count: part.indices.length,
          color: part.color,
          opacity: part.opacity,
        });
        vOffset += part.positions.length;
        iOffset += part.indices.length;
      }
      const accelerationGeometry = new BufferGeometry();
      accelerationGeometry.setAttribute(
        "position",
        new BufferAttribute(positions, 3),
      );
      accelerationGeometry.setIndex(new BufferAttribute(indices, 1));
      groups.forEach((g, i) =>
        accelerationGeometry.addGroup(g.start, g.count, i),
      );
      const bvh = MeshBVH.serialize(new MeshBVH(accelerationGeometry), {
        cloneBuffers: false,
      });
      accelerationGeometry.dispose();
      const p = read(expressID);
      const ifcType = typeName(p);
      const spatialPath: NonNullable<BimElementData["spatialPath"]> = [];
      let parent = parents.get(expressID);
      const visited = new Set<number>();
      while (parent != null && !visited.has(parent)) {
        visited.add(parent);
        const n = read(parent);
        spatialPath.unshift({
          id: parent,
          type: typeName(n),
          name: string(n.Name) || `#${parent}`,
        });
        parent = parents.get(parent);
      }
      let properties: IfcPropertySet[] = [];
      let material = "";
      try {
        properties = readPsets(expressID);
        const type = types.get(expressID);
        material = [
          ...new Set(
            [
              ...(materials.get(expressID) ?? []),
              ...(type ? (materials.get(type) ?? []) : []),
            ].flatMap((x) => materialNames(x)),
          ),
        ].join(", ");
      } catch {
        diagnostics.failedProperties++;
      }
      elements.push({
        id: `ifc-${expressID}`,
        source: "ifc",
        guid: string(p.GlobalId),
        name: string(p.Name) || `${ifcType} #${expressID}`,
        ifcType,
        discipline: mep.has(expressID)
          ? "mep"
          : /SLAB|COLUMN|BEAM|FOOTING|PILE|MEMBER|PLATE|REINFORC/.test(
                ifcType.toUpperCase(),
              )
            ? "structure"
            : "architecture",
        storey:
          spatialPath.findLast(
            (n) => n.type.toUpperCase() === "IFCBUILDINGSTOREY",
          )?.name ?? "",
        spatialPath,
        material,
        color: parts[0].color,
        dimensionsSource: "bounds",
        dimensions: { length: size.x, height: size.y, width: size.z },
        position: center.toArray(),
        size: size.toArray(),
        geometryType: "custom",
        geometryData: { positions, normals, indices, groups, bvh },
        psets: [
          {
            name: "IFC",
            properties: [
              { name: "ExpressID", value: expressID },
              { name: "GlobalId", value: string(p.GlobalId) },
              { name: "Schema", value: schema },
              ...(p.ObjectType
                ? [{ name: "ObjectType", value: string(p.ObjectType) }]
                : []),
            ],
          },
          ...properties,
        ],
      });
      progress(
        Math.min(95, 10 + Math.round(((index + 1) / Math.max(1, total)) * 85)),
      );
    });
    diagnostics.missingGeometry = candidates.size;
    if (!elements.length) throw new Error("IFC_NO_GEOMETRY");
    const bounds = new Box3();
    for (const e of elements) {
      const center = new Vector3(...e.position),
        half = new Vector3(...e.size).multiplyScalar(0.5);
      bounds.expandByPoint(center.clone().sub(half));
      bounds.expandByPoint(center.add(half));
    }
    const target = bounds.getCenter(new Vector3());
    const distance = bounds.getSize(new Vector3()).length() * 1.5 || 10;
    progress(100);
    return {
      id: `uploaded-${Date.now()}`,
      source: "ifc",
      filename,
      schema,
      diagnostics,
      description: filename,
      elementsCount: elements.length,
      elements,
      clashes: [],
      bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
      defaultCamera: {
        position: target
          .clone()
          .add(new Vector3(distance, distance * 0.7, distance))
          .toArray(),
        target: target.toArray(),
      },
    };
  } finally {
    cache.clear();
    api.CloseModel(modelID);
  }
}
