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
if (viDictionary.aboutPage.letter.paragraphs.length !== enDictionary.aboutPage.letter.paragraphs.length) {
  console.log(`aboutPage.letter.paragraphs mismatch: VI=${viDictionary.aboutPage.letter.paragraphs.length}, EN=${enDictionary.aboutPage.letter.paragraphs.length}`);
}
if (viDictionary.aboutPage.workMethod.items.length !== enDictionary.aboutPage.workMethod.items.length) {
  console.log(`aboutPage.workMethod.items mismatch: VI=${viDictionary.aboutPage.workMethod.items.length}, EN=${enDictionary.aboutPage.workMethod.items.length}`);
}
if (viDictionary.aboutPage.whyChoose.items.length !== enDictionary.aboutPage.whyChoose.items.length) {
  console.log(`aboutPage.whyChoose.items mismatch: VI=${viDictionary.aboutPage.whyChoose.items.length}, EN=${enDictionary.aboutPage.whyChoose.items.length}`);
}
if (viDictionary.aboutPage.trackRecord.metrics.length !== enDictionary.aboutPage.trackRecord.metrics.length) {
  console.log(`aboutPage.trackRecord.metrics mismatch: VI=${viDictionary.aboutPage.trackRecord.metrics.length}, EN=${enDictionary.aboutPage.trackRecord.metrics.length}`);
}
if (viDictionary.aboutPage.teamMembers.length !== enDictionary.aboutPage.teamMembers.length) {
  console.log(`aboutPage.teamMembers mismatch: VI=${viDictionary.aboutPage.teamMembers.length}, EN=${enDictionary.aboutPage.teamMembers.length}`);
}
if (viDictionary.coursesPage.learningValues.length !== enDictionary.coursesPage.learningValues.length) {
  console.log(`coursesPage.learningValues mismatch: VI=${viDictionary.coursesPage.learningValues.length}, EN=${enDictionary.coursesPage.learningValues.length}`);
}
if (viDictionary.servicesPage.needs.length !== enDictionary.servicesPage.needs.length) {
  console.log(`servicesPage.needs mismatch: VI=${viDictionary.servicesPage.needs.length}, EN=${enDictionary.servicesPage.needs.length}`);
}
if (viDictionary.servicesPage.faqs.length !== enDictionary.servicesPage.faqs.length) {
  console.log(`servicesPage.faqs mismatch: VI=${viDictionary.servicesPage.faqs.length}, EN=${enDictionary.servicesPage.faqs.length}`);
}
if (viDictionary.contactPage.commitments.length !== enDictionary.contactPage.commitments.length) {
  console.log(`contactPage.commitments mismatch: VI=${viDictionary.contactPage.commitments.length}, EN=${enDictionary.contactPage.commitments.length}`);
}
if (viDictionary.detailPage.deliverables.length !== enDictionary.detailPage.deliverables.length) {
  console.log(`detailPage.deliverables mismatch: VI=${viDictionary.detailPage.deliverables.length}, EN=${enDictionary.detailPage.deliverables.length}`);
}

console.log("Check complete.");
