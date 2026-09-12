import type { ContentEntry } from "@/types/content";

export interface Project extends ContentEntry {
  id?: string;
  category: string;
  location: string;
  location_vi?: string | null;
  year: string;
  investor?: string;
  investor_vi?: string | null;
  expectedCompletion?: string;
  expectedCompletion_vi?: string | null;
  scale?: string;
  scale_vi?: string | null;
  contractPackage?: string;
  contractPackage_vi?: string | null;
  status: string;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  location?: string;
  year?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  signal?: AbortSignal;
}
