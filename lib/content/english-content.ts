import translations from "./english-translations.json";
import { toEnglishLabel } from "../utils/public-labels";

const dictionary: Record<string, string> = translations;
const serviceSummaries: Record<string, string> = {
  "tu-van-bim":
    "Set your BIM direction with clear information requirements, delivery standards and a practical implementation plan.",
  "dao-tao":
    "Equip your team to apply BIM at work through role-based learning, project exercises and practical assessment.",
  "thiet-ke":
    "Coordinate architecture, structures and MEP to improve buildability and keep project documentation consistent.",
  "tu-van-giam-sat":
    "Keep site quality, safety and progress visible through structured inspections and clear reporting.",
  "bim-coordination":
    "Connect discipline models, prioritize clashes and track issues from review to verified resolution.",
  "digital-twin-va-du-lieu-tai-san":
    "Prepare connected asset information for digital handover, maintenance and operational decision-making.",
};
const courseSummaries: Record<string, string> = {
  "bim-foundation":
    "Understand BIM fundamentals, model information and the coordination workflows used by construction teams.",
  "bim-coordination":
    "Develop the skills to federate models, manage clashes and lead multidisciplinary coordination reviews.",
  "bim-management":
    "Turn business objectives into BIM requirements, delivery plans and measurable implementation goals.",
  "revit-structure-professional":
    "Build coordinated structural models and manage model quality and construction documentation in Revit.",
  "navisworks-clash-detection":
    "Set up federated models, configure clash checks and turn review findings into actionable project issues.",
  "cde-iso-19650":
    "Design information requirements, naming conventions and approval workflows for a common data environment.",
};
const technicalFields = new Set([
  "id",
  "slug",
  "url",
  "image",
  "videoUrl",
  "canonicalUrl",
  "seoImage",
  "publishedAt",
  "createdAt",
  "updatedAt",
  "authorName",
  "instructor",
  "relatedIds",
  "type",
  "status",
  "imageLayout",
]);

/** Translate the existing editorial catalogue without changing IDs, links or authored English.
 * Exact source matching deliberately leaves newly edited content intact.
 * New CMS content should be authored in English; add reviewed translations here for legacy copy.
 */
export function englishContent<T extends { title: string }>(entry: T): T {
  const title = toEnglishLabel(entry.title);
  const translate = (value: unknown, key = ""): unknown => {
    if (technicalFields.has(key)) return value;
    if (typeof value === "string") {
      const direct = toEnglishLabel(value);
      if (direct !== value) return direct;
      const exact = dictionary[value];
      if (exact) return exact.replaceAll("{{title}}", title);
      const template = value
        .split(entry.title)
        .join("{{title}}")
        .split(entry.title.toLowerCase())
        .join("{{title}}");
      const translated = dictionary[template];
      if (translated) return translated.replaceAll("{{title}}", title);
      return value;
    }
    if (Array.isArray(value)) return value.map((item) => translate(item, key));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([field, item]) => [
          field,
          translate(item, field),
        ]),
      );
    }
    return value;
  };
  const result = translate(entry) as T;
  // Replace only the generic legacy summaries; preserve subsequent editorial changes.
  const content = result as T & { slug?: string; description?: string };
  const source = entry as T & { description?: string };
  if (
    content.slug &&
    source.description?.startsWith("Giải pháp ") &&
    source.description.endsWith("của từng tổ chức hoặc dự án.")
  ) {
    content.description = serviceSummaries[content.slug] ?? content.description;
  }
  if (
    content.slug &&
    source.description?.startsWith("Chương trình ") &&
    source.description.endsWith("cho đội ngũ ngành xây dựng.")
  ) {
    content.description = courseSummaries[content.slug] ?? content.description;
  }
  return result;
}
