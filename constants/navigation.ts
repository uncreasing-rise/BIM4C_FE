import { ROUTES } from "./routes";

export const MAIN_NAVIGATION = [
  { label: "About", href: ROUTES.about },
  { label: "Solutions", href: ROUTES.services },
  { label: "Projects", href: ROUTES.projects },
  { label: "Academy", href: ROUTES.courses },
  { label: "Insights", href: ROUTES.blog },
] as const;

export const HEADER_MENUS = {
  about: [
    { label: "Overview", href: ROUTES.about },
    { label: "Our approach", href: ROUTES.about },
    { label: "Capabilities", href: ROUTES.services },
    { label: "Clients and partners", href: "/#partners" },
  ],
  services: [
    { label: "BIM consulting", href: ROUTES.serviceDetail("tu-van-bim") },
    { label: "Training", href: ROUTES.serviceDetail("dao-tao") },
    { label: "Design", href: ROUTES.serviceDetail("thiet-ke") },
    {
      label: "Construction advisory",
      href: ROUTES.serviceDetail("tu-van-giam-sat"),
    },
  ],
  projects: [
    "High-rise",
    "Residential",
    "Industrial",
    "Infrastructure",
    "MEP",
  ].map((label) => ({ label, href: ROUTES.projects })),
} as const;
