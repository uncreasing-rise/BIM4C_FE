export interface CompanyMetric {
  value: string;
  label_vi: string;
  label_en: string;
}

export interface SiteSettingsData {
  email: string;
  phone?: string;
  address?: string;
  metrics?: CompanyMetric[];
  socialLinks: Record<string, string>;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultSeoTitle_vi?: string;
  defaultSeoDescription_vi?: string;
  defaultOgImage?: string;
}
