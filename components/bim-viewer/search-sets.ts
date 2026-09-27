/**
 * Element search shared by the model browser and saved search sets. A search
 * set stores the criteria, not the result, so it keeps working after the
 * model is updated (like Navisworks/Autodesk search sets).
 */
import type { BimElementData } from "./types";

export interface SearchCriteria {
  query: string;
  discipline: string; // "all" or a discipline
  storey: string; // "all" or a storey name
}

export interface SearchSet extends SearchCriteria {
  id: string;
  name: string;
}

export function elementMatches(
  element: BimElementData,
  filename: string | undefined,
  { query, discipline, storey }: SearchCriteria,
  locale = "vi",
): boolean {
  if (discipline !== "all" && element.discipline !== discipline) return false;
  if (storey !== "all" && element.storey !== storey) return false;
  const q = query.trim().toLocaleLowerCase(locale);
  if (!q) return true;
  return [
    filename,
    element.name,
    element.ifcType,
    element.storey,
    element.guid,
    element.material,
    ...element.psets.flatMap((pset) => [pset.name, ...pset.properties.map((p) => `${p.name} ${p.value}`)]),
  ].some((value) => value && value.toLocaleLowerCase(locale).includes(q));
}

export const hasCriteria = (c: SearchCriteria) => Boolean(c.query.trim()) || c.discipline !== "all" || c.storey !== "all";
