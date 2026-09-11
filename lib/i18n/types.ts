import type { Locale } from "./config";

export interface Dictionary {
  common: {
    talkToExpert: string;
    contact: string;
    ourWork: string;
    exploreExpertise: string;
    discussProject: string;
    viewDetails: string;
    readMore: string;
    learnMore: string;
    all: string;
    search: string;
    searchPlaceholder: string;
    filterByCategory: string;
    filterByStatus: string;
    filterByLocation: string;
    filterByYear: string;
    back: string;
    skipToContent: string;
    loading: string;
    noResults: string;
    publishedAt: string;
    duration: string;
    level: string;
    instructor: string;
    curriculum: string;
    learningOutcomes: string;
    scopeOfServices: string;
    deliverables: string;
    projectOverview: string;
    projectDetails: string;
    investor: string;
    location: string;
    scale: string;
    year: string;
    status: string;
    relatedProjects: string;
    relatedServices: string;
    relatedCourses: string;
    relatedPosts: string;
    share: string;
  };
  navigation: {
    home: string;
    about: string;
    services: string;
    projects: string;
    courses: string;
    blog: string;
    contact: string;
    legal: string;
    terms: string;
    privacy: string;
    exploreBim4c: string;
    tagline: string;
  };
  hero: {
    badge: string;
    titleMain: string;
    titleHighlight: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    featureBimStrategy: string;
    featureCoordination: string;
    featureDigitalHandover: string;
    cardTag: string;
    cardTagline: string;
  };
  expertiseStrip: {
    bimConsulting: { title: string; desc: string };
    training: { title: string; desc: string };
    design: { title: string; desc: string };
    supervision: { title: string; desc: string };
  };
  deliveryProcess: {
    eyebrow: string;
    title: string;
    description: string;
    step1: { title: string; desc: string };
    step2: { title: string; desc: string };
    step3: { title: string; desc: string };
    step4: { title: string; desc: string };
  };
  partners: {
    eyebrow: string;
    title: string;
    description: string;
  };
  consultation: {
    eyebrow: string;
    title: string;
    description: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    serviceLabel: string;
    messageLabel: string;
    submitButton: string;
    submitting: string;
    successMessage: string;
  };
  footer: {
    description: string;
    exploreTitle: string;
    newsletterTitle: string;
    newsletterDesc: string;
    emailPlaceholder: string;
    subscribeButton: string;
    consentText: string;
    privacyLink: string;
    copyright: string;
    termsLink: string;
    privacyPolicyLink: string;
  };
  aboutPage: {
    eyebrow: string;
    heroTitle: string;
    heroDesc: string;
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
    values: {
      integrity: { title: string; desc: string };
      innovation: { title: string; desc: string };
      collaboration: { title: string; desc: string };
      sustainability: { title: string; desc: string };
    };
    teamEyebrow: string;
    teamTitle: string;
    teamDesc: string;
    ctaEyebrow: string;
    ctaTitle: string;
  };
}

export interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}
