export interface CompanyMetric {
  value: string;
  label_vi: string;
  label_en: string;
}

export interface SiteSettingsData {
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  brochureUrl?: string;
  metrics?: CompanyMetric[];
  socialLinks: Record<string, string>;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage?: string;
}

export const DEFAULT_METRICS: CompanyMetric[] = [
  { value: "50+", label_vi: "Dự án BIM & Quản lý", label_en: "BIM & Management Projects" },
  { value: "100+", label_vi: "Kỹ sư & Chuyên gia", label_en: "Engineers & Specialists" },
  { value: "05+", label_vi: "Năm phát triển", label_en: "Years of Growth" },
  { value: "98%", label_vi: "Hài lòng đối tác", label_en: "Partner Satisfaction" },
];
