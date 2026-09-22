import type { PageResult } from "../types";
import { adminRequest, buildQueryString } from "./http-client";

export interface AdminMedia {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string;
}

export const mediaApi = {
  list: (search = "", signal?: AbortSignal) => {
    const qs = buildQueryString({ search: search.trim() || undefined });
    return adminRequest<PageResult<AdminMedia>>(`media${qs ? `?${qs}` : ""}`, {
      signal,
    });
  },

  upload: (file: File, alt: string) => {
    const body = new FormData();
    body.set("file", file);
    body.set("alt", alt);
    return adminRequest<{ data: AdminMedia }>("media/upload", {
      method: "POST",
      body,
    });
  },

  update: (id: string, alt: string) =>
    adminRequest<{ data: AdminMedia }>(`media/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ alt }),
    }),

  remove: (id: string) =>
    adminRequest<void>(`media/${id}`, { method: "DELETE" }),
};

/** Backward-compatible export */
export const adminMediaApi = mediaApi;
