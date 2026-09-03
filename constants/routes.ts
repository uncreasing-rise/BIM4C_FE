export const CONTACT_EMAIL = "info@bim4c.vn";

export const ROUTES = {
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
  legal: "/phap-ly",
  legalDetail: (slug: string) => `/phap-ly/${slug}`,
  contact: "/lien-he",
  contactEmail: `mailto:${CONTACT_EMAIL}`,
} as const;
