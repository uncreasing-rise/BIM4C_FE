import { z } from "zod";

const number = z.number().finite();
const vec = z.tuple([number, number, number]);
const text = z.string().max(100_000);
const element = z.object({
  id: text.min(1), guid: text, name: text, ifcType: text,
  discipline: z.enum(["architecture", "structure", "mep", "clash"]),
  storey: text, material: text, color: z.string().regex(/^#[0-9a-f]{6}$/i),
  position: vec, size: z.tuple([number.nonnegative(), number.nonnegative(), number.nonnegative()]),
  psets: z.array(z.object({ name: text, properties: z.array(z.object({
    name: text, value: z.union([text, number]), unit: text.optional(),
  })).max(100_000) })).max(10_000),
  dimensions: z.object({ length: number.optional(), width: number.optional(), height: number.optional(), area: number.optional(), volume: number.optional() }).optional(),
  rotation: vec.optional(), quaternion: z.tuple([number, number, number, number]).optional(),
  spatialPath: z.array(z.object({ id: number, type: text, name: text })).max(1000).optional(),
  source: z.literal("ifc").optional(), dimensionsSource: z.literal("bounds").optional(),
  geometryType: z.enum(["box", "cylinder", "duct", "pipe", "slab", "truss", "custom"]).optional(),
});

/** Packages contain metadata only; geometry is supplied by Fragments. */
export const packageModelSchema = z.object({
  id: text, description: text, filename: text.optional(), schema: text.optional(),
  source: z.literal("ifc").optional(), contentHash: z.string().regex(/^[0-9a-f]{64}$/).optional(),
  elementsCount: z.number().int().nonnegative(), elements: z.array(element).min(1).max(1_000_000),
  clashes: z.array(z.object({
    id: text, title: text, description: text, severity: z.enum(["high", "medium", "low"]),
    disciplineA: text, elementA: text, disciplineB: text, elementB: text, point: vec,
    status: z.enum(["open", "in_review", "approved", "resolved"]),
    kind: z.enum(["hard", "clearance"]).optional(), distance: number.nonnegative().optional(),
    modelA: text.optional(), modelB: text.optional(), typeA: text.optional(), typeB: text.optional(),
  })).max(100_000),
  defaultCamera: z.object({ position: vec, target: vec }),
  bounds: z.object({ min: vec, max: vec }).refine(b => b.min.every((v, i) => v <= b.max[i])).optional(),
  coordination: z.object({ translation: vec }).optional(),
  mapConversion: z.object({ eastings: number, northings: number, orthogonalHeight: number, rotation: number, scale: number.positive(), crsName: text.optional() }).optional(),
  diagnostics: z.object({ missingGeometry: number.nonnegative(), failedGeometry: number.nonnegative(), failedProperties: number.nonnegative() }).optional(),
}).refine(m => m.elementsCount === m.elements.length && new Set(m.elements.map(e => e.id)).size === m.elements.length);
