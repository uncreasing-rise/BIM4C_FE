import { adminRequest } from "./http-client";

export interface AnalyticsTotals {
  pageviews: number;
  visitors: number;
  sessions: number;
  avgSessionMs: number;
  pagesPerSession: number;
  engagementRate: number;
  convertedSessions: number;
}

export interface AnalyticsReport {
  range: { from: string; to: string };
  previousRange: { from: string; to: string };
  totals: AnalyticsTotals;
  previous: AnalyticsTotals;
  series: { day: string; pageviews: number; sessions: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number; avgMs: number | null; scroll: number | null }[];
  content: { type: string; slug: string; title: string | null; views: number; visitors: number; avgMs: number | null }[];
  sources: { source: string; medium: string; sessions: number; conversions: number }[];
  campaigns: { campaign: string; source: string; medium: string; sessions: number; conversions: number }[];
  referrers: { key: string; sessions: number }[];
  entries: { key: string; sessions: number; conversions: number }[];
  devices: { key: string | null; sessions: number }[];
  browsers: { key: string | null; sessions: number }[];
  systems: { key: string | null; sessions: number }[];
  countries: { key: string | null; sessions: number }[];
  locales: { key: string | null; sessions: number }[];
  clicks: { type: string; target: string | null; label: string | null; clicks: number; sessions: number }[];
  searches: { key: string; searches: number }[];
  forms: { key: string | null; submissions: number }[];
  heatmap: { dow: number; hour: number; views: number }[];
}

export interface AnalyticsRealtime {
  activeSessions: number;
  pages: { path: string; sessions: number }[];
  recent: {
    type: string;
    path: string;
    label: string | null;
    target: string | null;
    source: string;
    device: string;
    country: string | null;
    createdAt: string;
  }[];
}

export interface LeadAttribution {
  source: string;
  medium: string;
  campaign?: string;
  referrer?: string;
  landingPage?: string;
  pages?: string[];
}

export interface AnalyticsLeads {
  total: number;
  byKind: Record<string, number>;
  bySource: { source: string; medium: string; leads: number }[];
  items: {
    kind: "contact" | "course" | "appointment" | "newsletter";
    id: string;
    name: string | null;
    email: string;
    detail: string | null;
    createdAt: string;
    attribution: LeadAttribution | null;
  }[];
}

const range = (from: string, to: string) => `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

export const analyticsApi = {
  report: (from: string, to: string, signal?: AbortSignal) =>
    adminRequest<{ data: AnalyticsReport }>(`analytics/report?${range(from, to)}`, { signal, timeoutMs: 30000 }),
  realtime: (signal?: AbortSignal) => adminRequest<{ data: AnalyticsRealtime }>("analytics/realtime", { signal }),
  leads: (from: string, to: string, signal?: AbortSignal) =>
    adminRequest<{ data: AnalyticsLeads }>(`analytics/leads?${range(from, to)}`, { signal, timeoutMs: 30000 }),
};
