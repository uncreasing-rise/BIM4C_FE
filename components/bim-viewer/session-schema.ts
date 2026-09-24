import { z } from "zod";

const id = z.string().min(1).max(512);
const ids = z.array(id).max(100000);
const vector = z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]);
const point = z.object({
  modelKey: id.optional(),
  guid: z.string().max(512).optional(),
  localPoint: vector.optional(),
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
  snap: z.enum(["vertex", "midpoint", "edge", "face"]),
});
const measurement = z.discriminatedUnion("mode", [
  z.object({ id, mode: z.literal("angle"), points: z.tuple([point, point, point]) }),
  z.object({ id, mode: z.literal("triangle"), points: z.tuple([point, point, point]) }),
  z.object({ id, mode: z.literal("point"), points: z.tuple([point]) }),
  z.object({
    id,
    mode: z.literal("distance"),
    points: z.tuple([point, point]),
  }),
]);

export const sessionSchema = z
  .object({
    version: z.literal(1).optional(),
    hiddenElements: ids.optional(),
    measurements: z.array(measurement).max(10000).optional(),
    savedViews: z
      .array(
        z.object({
          id,
          name: z.string().max(256),
          preset: z.enum(["perspective", "top", "front", "right", "isometric"]),
          modelKey: id.optional(),
          elementIds: ids,
          camera: z.object({ position: vector, target: vector, up: vector.refine((v) => Math.hypot(...v) > 0), fov: z.number().min(1).max(179) }).optional(),
          clip: z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite(), minX: z.number().finite(), minY: z.number().finite(), minZ: z.number().finite(), enabled: z.boolean() }).refine((b) => b.x >= b.minX && b.y >= b.minY && b.z >= b.minZ).optional(),
          hiddenElements: ids.optional(),
          layers: z.object({ architecture: z.boolean(), structure: z.boolean(), mep: z.boolean(), clash: z.boolean() }).optional(),
          explode: z.number().min(0).max(2).optional(),
        }),
      )
      .max(1000)
      .optional(),
    issues: z
      .array(
        z.object({
          id,
          title: z.string().max(512),
          description: z.string().max(10000),
          elementIds: ids,
          clashId: id.optional(),
          status: z.enum(["open", "resolved"]),
          createdAt: z.string().max(64),
        }),
      )
      .max(10000)
      .optional(),
    layers: z
      .object({
        architecture: z.boolean(),
        structure: z.boolean(),
        mep: z.boolean(),
        clash: z.boolean(),
      })
      .optional(),
    explode: z.number().finite().min(0).max(2).optional(),
  })
  .refine(
    (value) => Object.keys(value).some((key) => key !== "version"),
    "Empty session",
  );
