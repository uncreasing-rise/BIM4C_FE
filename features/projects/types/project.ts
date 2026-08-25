import type { ContentEntry } from "@/types/content";

export interface Project extends ContentEntry {
  id?: string;
  category: string;
  location: string;
  year: string;
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

