import { z } from "zod";

export const displaySettingsSchema = z.object({
  edges: z.boolean().optional(),
  ambientOcclusion: z.boolean().optional(),
  projection: z.enum(["perspective", "orthographic"]).optional(),
  environment: z.enum(["classic", "light", "neutral", "dark"]).optional(),
  grid: z.boolean().optional(),
  sectionCaps: z.boolean().optional(),
  ifcGrids: z.boolean().optional(),
  minimap: z.boolean().optional(),
});

/** Measurement display units, a viewer preference like the display settings. */
export const measureUnitsSchema = z.object({
  unit: z.enum(["m", "cm", "mm", "ft", "in"]),
  precision: z.number().int().min(0).max(6),
});

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
  snap: z.enum(["vertex", "center", "midpoint", "edge", "face"]),
  normal: vector.optional(),
});
// Open-ended measurements hold at most MAX_MEASURE_POINTS (measurement-math.ts).
const outline = (min: number) => z.array(point).min(min).max(1000);
const measurement = z.discriminatedUnion("mode", [
  z.object({ id, mode: z.literal("angle"), points: z.tuple([point, point, point]) }),
  z.object({ id, mode: z.literal("triangle"), points: z.tuple([point, point, point]) }),
  z.object({ id, mode: z.literal("arc"), points: z.tuple([point, point, point]) }),
  z.object({ id, mode: z.literal("point"), points: z.tuple([point]) }),
  z.object({ id, mode: z.literal("polyline"), points: outline(2) }),
  z.object({ id, mode: z.literal("polygon"), points: outline(3) }),
  z.object({ id, mode: z.literal("multipoint"), points: outline(2) }),
  z.object({ id, mode: z.literal("accumulate"), points: outline(2).refine((p) => p.length % 2 === 0) }),
  z.object({ id, mode: z.literal("shortest"), points: z.tuple([point, point]) }),
  z.object({
    id,
    mode: z.literal("distance"),
    points: z.tuple([point, point]),
  }),
]);

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);
const clashStatus = z.enum(["open", "in_review", "approved", "resolved"]);
/** Appearance profile and manual looks (see appearance.ts): definitions, never element ids. */
const appearance = z.object({
  profile: z
    .object({
      source: z.discriminatedUnion("kind", [
        z.object({ kind: z.literal("field"), field: z.enum(["ifcType", "storey", "material", "discipline", "model", "name"]) }),
        z.object({ kind: z.literal("property"), name: z.string().min(1).max(256) }),
      ]),
      mode: z.enum(["values", "ranges"]),
      bands: z.number().int().min(1).max(12),
      colors: z.record(z.string().max(512), hexColor),
      hidden: z.array(z.string().max(512)).max(10000),
    })
    .nullable()
    .optional(),
  manual: z
    .array(z.object({ guid: z.string().min(1).max(64), color: hexColor.optional(), opacity: z.number().min(0).max(1).optional() }))
    .max(100000)
    .optional(),
});

const camera = z.object({ position: vector, target: vector, up: vector.refine((v) => Math.hypot(...v) > 0), fov: z.number().min(1).max(179) });
const clipBox = z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite(), minX: z.number().finite(), minY: z.number().finite(), minZ: z.number().finite(), enabled: z.boolean(), planeAxis: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(), flip: z.boolean().optional(), rotation: z.tuple([z.number().finite(), z.number().finite(), z.number().finite(), z.number().finite()]).refine((q) => Math.abs(Math.hypot(...q) - 1) < 1e-3).optional() }).refine((b) => b.x >= b.minX && b.y >= b.minY && b.z >= b.minZ);

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
          camera: camera.optional(),
          clip: clipBox.optional(),
          hiddenElements: ids.optional(),
          isolatedElements: ids.optional(),
          markup: z
            .array(
              z.object({
                id,
                kind: z.enum(["pen", "arrow", "rect", "ellipse", "text"]),
                color: z.string().regex(/^#[0-9a-f]{3,8}$/i),
                width: z.number().min(1).max(20),
                points: z.array(z.tuple([z.number().finite(), z.number().finite()])).min(1).max(5000),
                text: z.string().max(500).optional(),
              }),
            )
            .max(500)
            .optional(),
          layers: z.object({ architecture: z.boolean(), structure: z.boolean(), mep: z.boolean(), clash: z.boolean() }).optional(),
          explode: z.number().min(0).max(2).optional(),
          projection: z.enum(["perspective", "orthographic"]).optional(),
          models: z
            .array(
              z.object({
                key: id,
                visible: z.boolean(),
                alignment: z.enum(["shared", "origin"]),
                offset: z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite(), rotationDeg: z.number().finite() }),
              }),
            )
            .max(100)
            .optional(),
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
          /** Viewpoint captured when the issue was raised (or imported from BCF). */
          camera: camera.optional(),
          clip: clipBox.optional(),
          /** BCF topic identity, kept so a re-export updates the same topic. */
          bcfGuid: z.string().max(64).optional(),
          type: z.string().max(64).optional(),
          author: z.string().max(256).optional(),
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
    clashStatus: z.record(z.string().max(512), clashStatus).optional(),
    // Clash review (clash-review.ts): assignment, notes, history, runs.
    clashReview: z
      .record(
        z.string().max(512),
        z.object({
          assignee: z.string().max(128).optional(),
          note: z.string().max(4000).optional(),
          history: z
            .array(
              z.object({
                at: z.string().max(40),
                status: clashStatus.optional(),
                assignee: z.string().max(128).optional(),
                note: z.string().max(4000).optional(),
                by: z.string().max(128).optional(),
                auto: z.boolean().optional(),
              }),
            )
            .max(50),
        }),
      )
      .optional(),
    clashRuns: z
      .array(
        z.object({
          at: z.string().max(40),
          label: z.string().max(512),
          total: z.number().int().min(0),
          added: z.number().int().min(0),
          active: z.number().int().min(0),
          resolved: z.number().int().min(0),
        }),
      )
      .max(30)
      .optional(),
    /** Clash ids of the last run, and which of them were new then. */
    clashLastIds: z.array(z.string().max(512)).max(100000).optional(),
    clashNew: z.array(z.string().max(512)).max(100000).optional(),
    selectionSets: z
      .array(z.object({ id, name: z.string().max(256), guids: z.array(z.string().max(64)).max(100000) }))
      .max(500)
      .optional(),
    appearance: appearance.optional(),
    searchSets: z
      .array(
        z.object({
          id,
          name: z.string().max(256),
          query: z.string().max(512),
          discipline: z.string().max(32),
          storey: z.string().max(512),
        }),
      )
      .max(500)
      .optional(),
  })
  .refine(
    (value) => Object.keys(value).some((key) => key !== "version"),
    "Empty session",
  );
