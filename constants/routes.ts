export const CONTACT_EMAIL = "Bim4c.lab@gmail.com";

export const ROUTES = {
  profile: "/documents/hsnl-bim4c-2026.pdf",
  home: "/",
  about: "/gioi-thieu",
  services: "/dich-vu",
  serviceDetail: (slug: string) => `/dich-vu/${slug}`,
  projects: "/du-an",
  projectDetail: (slug: string) => `/du-an/${slug}`,
  courses: "/khoa-hoc",
  courseDetail: (slug: string) => `/khoa-hoc/${slug}`,
  blog: "/blog",
  blogDetail: (slug: string) => `/blog/${slug}`,
  technical: "/chuyen-mon",
  technicalDetail: (slug: string) => `/chuyen-mon/${slug}`,
  news: "/tin-tuc",
  newsDetail: (slug: string) => `/tin-tuc/${slug}`,
  legal: "/phap-ly",
  legalDetail: (slug: string) => `/phap-ly/${slug}`,
  contact: "/lien-he",
  bimViewer: "/bim-viewer",
  contactEmail: `mailto:${CONTACT_EMAIL}`,
} as const;
