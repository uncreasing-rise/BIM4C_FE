import { CONTACT_EMAIL } from "./routes";

export interface LegalSection { title: string; paragraphs: string[]; items?: string[]; }
export interface LegalDocument { slug: string; title: string; summary: string; updatedAt: string; sections: LegalSection[]; }

export const legalDocuments: LegalDocument[] = [
  { slug: "chinh-sach-bao-mat", title: "Privacy Policy", summary: "How BIM4C collects, uses and protects information when you visit our website or contact us.", updatedAt: "20 August 2026", sections: [
    { title: "Scope", paragraphs: ["This policy applies to the BIM4C website and online forms managed by BIM4C. By continuing to use the website, you confirm that you have read and understood this policy."] },
    { title: "Information we collect", paragraphs: ["We collect only the information needed when you actively submit an enquiry, register for a programme or subscribe to updates."], items: ["Name, email, phone number and organization.", "Your enquiry, programme interest or project information.", "Basic technical data such as browser, device and access logs."] },
    { title: "How we use information", paragraphs: ["We use information to respond to enquiries, provide services, improve the website and send content you requested. BIM4C does not sell personal information to third parties."] },
    { title: "Storage and security", paragraphs: ["BIM4C applies appropriate organizational and technical safeguards to reduce unauthorized access, loss or misuse. Data is retained only for as long as needed for the stated purpose or as required by law."] },
    { title: "Cookies", paragraphs: ["The website may use essential cookies to maintain functionality, remember preferences and measure content performance. You can manage cookies in your browser settings."] },
    { title: "Contact", paragraphs: [`Questions about privacy can be sent to ${CONTACT_EMAIL}. BIM4C will respond within a reasonable timeframe.`] },
  ] },
  { slug: "dieu-khoan-su-dung", title: "Terms of Use", summary: "The principles that apply when you access content and use features on the BIM4C website.", updatedAt: "20 August 2026", sections: [
    { title: "Acceptance", paragraphs: ["By accessing this website, you agree to follow these terms and applicable law. If you do not agree, please stop using the website."] },
    { title: "Content ownership", paragraphs: ["Content, imagery, design, trademarks and materials on this website belong to BIM4C or are lawfully used. You may reference them for personal, non-commercial purposes with attribution where sharing is permitted."] },
    { title: "Prohibited conduct", paragraphs: ["You must not affect the safety, stability or legal rights of BIM4C or any third party."], items: ["Copy or commercially exploit content without permission.", "Probe, interfere with or attempt unauthorized access to systems.", "Submit false information, malware, spam or unlawful content."] },
    { title: "Information and third-party links", paragraphs: ["Website information is provided for general reference and may change. Third-party links are provided for convenience; BIM4C does not control or accept responsibility for their content or policies."] },
    { title: "Limitation of liability", paragraphs: ["To the extent permitted by law, BIM4C is not liable for damage arising from misuse, technical interruption or reliance solely on general reference information on this website."] },
    { title: "Changes", paragraphs: ["BIM4C may update these terms to reflect changes in services or law. The new version takes effect when published on this page."] },
  ] },
  { slug: "bao-ve-du-lieu-ca-nhan", title: "Personal Data Protection", summary: "BIM4C's commitment and process for handling personal data transparently, purposefully and securely.", updatedAt: "20 August 2026", sections: [
    { title: "Processing principles", paragraphs: ["BIM4C processes personal data transparently, for defined purposes, within the necessary scope and in accordance with applicable data protection law."] },
    { title: "Data types and processing", paragraphs: ["Depending on your interaction, data may include identity, contact, professional and conversation information. Processing may include collection, storage, analysis, use, controlled sharing and deletion."] },
    { title: "Consent and withdrawal", paragraphs: ["Where required by law, BIM4C will ask for consent before processing. You may withdraw consent; withdrawal does not affect the lawfulness of earlier processing."] },
    { title: "Sharing data", paragraphs: ["Data is shared only with authorized staff, operational providers bound by confidentiality or government authorities with a lawful request."] },
    { title: "Your rights", paragraphs: ["Subject to applicable law, you may request the following rights regarding your data."], items: ["Access and request correction of your data.", "Request restriction, objection or deletion where eligible.", "Withdraw consent and request a copy of your data.", "Complain or seek compensation where lawful rights are affected."] },
    { title: "Making a request", paragraphs: [`Send a request to ${CONTACT_EMAIL}, with information needed to verify your identity and explain what you need. BIM4C may request reasonable additional information to prevent fraudulent requests.`] },
  ] },
];

export const getLegalDocument = (slug: string) => legalDocuments.find((document) => document.slug === slug);
export const PRIVACY_POLICY_SLUG = "chinh-sach-bao-mat";
export const PRIVACY_POLICY_VERSION = legalDocuments.find(({ slug }) => slug === PRIVACY_POLICY_SLUG)?.updatedAt ?? "";
