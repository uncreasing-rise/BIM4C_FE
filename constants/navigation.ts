import { ROUTES } from "./routes";

export type NavigationItem = { vi: string; en: string; href: string };

export const ABOUT_MENU_ITEMS: NavigationItem[] = [
  { vi: "Giới thiệu BIM4C", en: "About BIM4C", href: `${ROUTES.about}#about-us` },
  { vi: "Tầm nhìn & Sứ mệnh", en: "Vision & mission", href: `${ROUTES.about}#vision-mission` },
  { vi: "Giá trị cốt lõi", en: "Core values", href: `${ROUTES.about}#core-values` },
  { vi: "Vì sao chọn BIM4C", en: "Why BIM4C", href: `${ROUTES.about}#why-bim4c` },
  { vi: "Đội ngũ", en: "Team", href: `${ROUTES.about}#team` },
  { vi: "Đối tác", en: "Partners", href: `${ROUTES.about}#partners` },
];

export const MAIN_NAVIGATION = [
  { key: "about", href: ROUTES.about },
  { key: "services", href: ROUTES.services },
  { key: "projects", href: ROUTES.projects },
  { key: "courses", href: ROUTES.courses },
  { key: "technical", href: ROUTES.technical },
  { key: "news", href: ROUTES.news },
] as const;
