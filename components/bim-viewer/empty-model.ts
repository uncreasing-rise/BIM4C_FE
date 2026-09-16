import type { BimModelDefinition } from "./types";
export const EMPTY_BIM_MODEL: BimModelDefinition = {
  id: "empty",
  description: "",
  elementsCount: 0,
  elements: [],
  clashes: [],
  defaultCamera: { position: [10, 10, 10], target: [0, 0, 0] },
};
