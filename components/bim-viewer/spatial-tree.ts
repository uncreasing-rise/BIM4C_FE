import type { BimElementData, FederatedModel } from "./types";

export interface SpatialNode {
  id: string;
  name: string;
  children: SpatialNode[];
  elements: BimElementData[];
  count: number;
}

export function buildSpatialTree(items: { model: FederatedModel; element: BimElementData }[]): SpatialNode[] {
  const roots: SpatialNode[] = [];
  const index = new Map<string, SpatialNode>();
  for (const { model, element } of items) {
    let parent = index.get(model.key);
    if (!parent) {
      parent = { id: model.key, name: model.model.filename ?? model.key, children: [], elements: [], count: 0 };
      roots.push(parent);
      index.set(model.key, parent);
    }
    parent.count++;
    const path = element.spatialPath?.length ? element.spatialPath : [{ id: 0, type: "", name: element.storey || "—" }];
    for (const entry of path) {
      const id: string = `${parent.id}/${entry.id}:${entry.type}:${entry.name}`;
      let child = index.get(id);
      if (!child) {
        child = { id, name: `${entry.name || entry.type}${entry.name && entry.type ? ` · ${entry.type}` : ""}`, children: [], elements: [], count: 0 };
        parent.children.push(child);
        index.set(id, child);
      }
      child.count++;
      parent = child;
    }
    parent.elements.push(element);
  }
  return roots;
}
