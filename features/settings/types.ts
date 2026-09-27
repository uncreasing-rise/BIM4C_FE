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
