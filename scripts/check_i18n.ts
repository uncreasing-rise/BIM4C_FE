import { viDictionary } from "../lib/i18n/dictionaries/vi";
import { enDictionary } from "../lib/i18n/dictionaries/en";

function compareObjects(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
  path = "",
) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  for (const k of keys1) {
    const currentPath = path ? `${path}.${k}` : k;
    if (!(k in obj2)) {
      console.log("Missing in EN:", currentPath);
    } else if (
      typeof obj1[k] === "object" &&
      obj1[k] !== null &&
      !Array.isArray(obj1[k]) &&
      typeof obj2[k] === "object" &&
      obj2[k] !== null &&
      !Array.isArray(obj2[k])
    ) {
      compareObjects(
        obj1[k] as Record<string, unknown>,
        obj2[k] as Record<string, unknown>,
        currentPath,
      );
    }
  }

  for (const k of keys2) {
    const currentPath = path ? `${path}.${k}` : k;
    if (!(k in obj1)) {
      console.log("Extra in EN / Missing in VI:", currentPath);
    }
  }
}

console.log("Comparing VI (source) with EN:");
compareObjects(
  viDictionary as unknown as Record<string, unknown>,
  enDictionary as unknown as Record<string, unknown>,
);

console.log("\nChecking array lengths & types:");
if (viDictionary.detailPage.deliverables.length !== enDictionary.detailPage.deliverables.length) {
  console.log(`detailPage.deliverables mismatch: VI=${viDictionary.detailPage.deliverables.length}, EN=${enDictionary.detailPage.deliverables.length}`);
}

console.log("Check complete.");
