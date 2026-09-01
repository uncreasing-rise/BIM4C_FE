export const API_ENDPOINTS = {
  services: {
    list: "/services",
    detail: (slug: string) => `/services/${encodeURIComponent(slug)}`,
  },
  projects: {
    list: "/projects",
    detail: (slug: string) => `/projects/${encodeURIComponent(slug)}`,
  },
  courses: {
    list: "/courses",
    detail: (slug: string) => `/courses/${encodeURIComponent(slug)}`,
  },
  posts: {
    list: "/posts",
    detail: (slug: string) => `/posts/${encodeURIComponent(slug)}`,
  },
  contact: { submit: "/contact" },
  courseRegistrations: { create: "/course-registrations" },
  newsletter: { subscribe: "/newsletter/subscriptions" },
} as const;
