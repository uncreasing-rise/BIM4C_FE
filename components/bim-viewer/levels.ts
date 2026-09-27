/**
 * Building levels (IfcBuildingStorey) with their extents in the scene, for the
 * Levels panel: floor plan cuts, isolating a floor, selecting its elements.
 */
import type { BimElementData, ModelPlacement } from "./types";

export interface BimLevel {
  /** Model key + storey express id, unique across federated files. */
  id: string;
  name: string;
  modelKey: string;
  modelName: string;
  ids: string[];
  /** Scene elevation (y) of the lowest / highest element on the level. */
  bottom: number;
  top: number;
}

interface LevelSource {
  key: string;
  model: { filename?: string; elements: BimElementData[] };
  placement: ModelPlacement;
}

/** Levels of every model, lowest first. Elements outside any storey are skipped. */
export function computeLevels(models: LevelSource[]): BimLevel[] {
  const levels = new Map<string, BimLevel>();
  for (const { key, model, placement } of models)
    for (const element of model.elements) {
      const storey = element.spatialPath?.findLast((n) => n.type.toUpperCase() === "IFCBUILDINGSTOREY");
      if (!storey) continue;
      const id = `${key}/${storey.id}`;
      const lift = placement.position[1];
      const bottom = element.position[1] - Math.abs(element.size[1]) / 2 + lift;
      const top = element.position[1] + Math.abs(element.size[1]) / 2 + lift;
      const level = levels.get(id);
      if (level) {
        level.ids.push(element.id);
        level.bottom = Math.min(level.bottom, bottom);
        level.top = Math.max(level.top, top);
      } else
        levels.set(id, {
          id,
          name: storey.name,
          modelKey: key,
          modelName: model.filename ?? key,
          ids: [element.id],
          bottom,
          top,
        });
    }
  return [...levels.values()].sort((a, b) => a.bottom - b.bottom || a.name.localeCompare(b.name));
}

/**
 * Height of a floor-plan cut: 1.2 m above the level's floor (the usual plan
 * cut height), but never above the level itself. The floor is taken as the
 * most common element base (columns, walls, doors start there), not the
 * lowest one, which is usually the slab soffit below the floor.
 */
export function planCutHeight(level: BimLevel, elements: Map<string, BimElementData>, lift = 0): number {
  const bottoms = level.ids
    .map((id) => elements.get(id))
    .filter((e): e is BimElementData => Boolean(e))
    .map((e) => e.position[1] - Math.abs(e.size[1]) / 2 + lift)
    .sort((a, b) => a - b);
  // The floor is where most elements start: the most common rounded bottom.
  const counts = new Map<number, number>();
  for (const b of bottoms) counts.set(Math.round(b * 10) / 10, (counts.get(Math.round(b * 10) / 10) ?? 0) + 1);
  const floor = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? level.bottom;
  return Math.min(floor + 1.2, level.top - 0.05);
}
