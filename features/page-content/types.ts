/**
 * Editable page copy served by `/page-content`. Every field is optional:
 * admins may clear or delete any block, and the UI hides what is missing.
 */
type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

interface TitledText {
  title: string;
  text: string;
}

interface PageContentShape {
  "home.hero": {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
  };
  company: {
    copyright: string;
    enterpriseInfo: {
      companyName: string;
      internationalName: string;
      shortName: string;
      headquarters: string;
      legalRepresentative: string;
      certificationsTitle: string;
      autodeskCert: string;
    };
  };
  about: {
    eyebrow: string;
    heroTitle: string;
    heroDesc: string;
    letter: { title: string; subtitle: string; paragraphs: string[] };
    visionMission: { vision: TitledText; mission: TitledText };
    workMethod: {
      eyebrow: string;
      title: string;
      intro: string;
      items: TitledText[];
    };
    operation: { eyebrow: string; title: string; items: TitledText[] };
    whyChoose: {
      eyebrow: string;
      title: string;
      intro: string;
      items: TitledText[];
    };
    trackRecord: {
      eyebrow: string;
      title: string;
      metrics: { value: string; label: string; subtext: string }[];
    };
    whoWeAreEyebrow: string;
    whoWeAreTitle: string;
    whoWeAreP1: string;
    whoWeAreP2: string;
    check1: string;
    check2: string;
    check3: string;
    guidesEyebrow: string;
    guidesTitle: string;
    guidesDesc: string;
    values: Record<string, { title: string; desc: string }>;
    teamEyebrow: string;
    teamTitle: string;
    teamDesc: string;
    teamMembers: { name: string; role: string; spec: string; image: string }[];
    ctaEyebrow: string;
    ctaTitle: string;
  };
  "courses.learning": { eyebrow: string; title: string; items: TitledText[] };
  "services.guide": {
    eyebrow: string;
    title: string;
    desc: string;
    items: {
      label: string;
      slug: string;
      title: string;
      description: string;
      preparation: string;
    }[];
  };
  "services.faq": {
    eyebrow: string;
    title: string;
    desc: string;
    items: { question: string; answer: string }[];
  };
  contact: {
    commitments: string[];
    officesTitle: string;
    office: { title: string; address: string; phone: string; note: string };
    map: { eyebrow: string; title: string; desc: string; workingHours: string };
  };
  detail: {
    trustSignals: {
      ndaTitle: string;
      ndaDesc: string;
      slaTitle: string;
      slaDesc: string;
      expertTitle: string;
      expertDesc: string;
    };
    b2bTraining: { title: string; desc: string; action: string };
  };
}

export type PageContentKey = keyof PageContentShape;
export type PageContentBlock<K extends PageContentKey> = DeepPartial<
  PageContentShape[K]
>;

/** Raw API payload: one `{ vi, en }` pair per stored block. */
export type PageContentMap = Partial<{
  [K in PageContentKey]: { vi?: PageContentBlock<K>; en?: PageContentBlock<K> };
}>;
