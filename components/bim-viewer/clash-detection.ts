import type {
  BimClashItem,
  BimElementData,
  BimModelDefinition,
  ModelPlacement,
} from "./types";

interface PlacedModel {
  key: string;
  model: BimModelDefinition;
  placement: ModelPlacement;
}

type Bounds = { min: [number, number, number]; max: [number, number, number] };

function boundsOf(element: BimElementData, placement: ModelPlacement): Bounds {
  const [x, y, z] = element.position;
  const [sx, sy, sz] = element.size.map((value) => Math.abs(value) / 2) as [
    number,
    number,
    number,
  ];
  const c = Math.cos(placement.rotationY);
  const s = Math.sin(placement.rotationY);
  const ex = Math.abs(c) * sx + Math.abs(s) * sz;
  const ez = Math.abs(s) * sx + Math.abs(c) * sz;
  const cx = placement.position[0] + c * x + s * z;
  const cz = placement.position[2] - s * x + c * z;
  return {
    min: [cx - ex, placement.position[1] + y - sy, cz - ez],
    max: [cx + ex, placement.position[1] + y + sy, cz + ez],
  };
}

function overlap(a: Bounds, b: Bounds) {
  const size: [number, number, number] = [
    Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0]),
    Math.min(a.max[1], b.max[1]) - Math.max(a.min[1], b.min[1]),
    Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2]),
  ];
  if (size.some((value) => value <= 0.001)) return null;
  return {
    size,
    volume: size[0] * size[1] * size[2],
    point: [
      (Math.max(a.min[0], b.min[0]) + Math.min(a.max[0], b.max[0])) / 2,
      (Math.max(a.min[1], b.min[1]) + Math.min(a.max[1], b.max[1])) / 2,
      (Math.max(a.min[2], b.min[2]) + Math.min(a.max[2], b.max[2])) / 2,
    ] as [number, number, number],
  };
}

/** Fast browser-side coordination pass. It intentionally uses element AABBs. */
export function detectAabbClashes(models: PlacedModel[]): BimClashItem[] {
  const elements = models.flatMap((owner) =>
    owner.model.elements.map((element) => ({
      owner,
      element,
      bounds: boundsOf(element, owner.placement),
    })),
  );
  const clashes: BimClashItem[] = [];
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];
      if (
        a.owner.key === b.owner.key ||
        a.element.discipline === b.element.discipline
      )
        continue;
      const hit = overlap(a.bounds, b.bounds);
      if (!hit) continue;
      const smallest = Math.min(
        a.element.size.reduce((x, y) => x * Math.max(Math.abs(y), 0.001), 1),
        b.element.size.reduce((x, y) => x * Math.max(Math.abs(y), 0.001), 1),
      );
      const ratio = hit.volume / smallest;
      clashes.push({
        id: `local-${a.element.id}-${b.element.id}`,
        title: `${a.element.name || a.element.ifcType} × ${b.element.name || b.element.ifcType}`,
        description: `Local AABB overlap (${hit.volume.toFixed(3)} m³). Results are approximate and should be reviewed.`,
        severity: ratio > 0.25 ? "high" : ratio > 0.05 ? "medium" : "low",
        disciplineA: a.element.discipline,
        elementA: a.element.id,
        disciplineB: b.element.discipline,
        elementB: b.element.id,
        point: hit.point,
        status: "open",
      });
      if (clashes.length >= 500) return clashes;
    }
  }
  return clashes;
}
