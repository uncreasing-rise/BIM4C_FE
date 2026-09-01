import type { PageResult } from "../types";
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
async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? "Media API thất bại");
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}
export const adminMediaApi = {
  list: async (search = "") =>
    parse<PageResult<AdminMedia>>(
      await fetch(`/api/admin/media?search=${encodeURIComponent(search)}`, {
        cache: "no-store",
      }),
    ),
  upload: async (file: File, alt: string) => {
    const body = new FormData();
    body.set("file", file);
    body.set("alt", alt);
    return parse<{ data: AdminMedia }>(
      await fetch("/api/admin/media/upload", { method: "POST", body }),
    );
  },
  update: async (id: string, alt: string) =>
    parse<{ data: AdminMedia }>(
      await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt }),
      }),
    ),
  remove: async (id: string) =>
    parse<void>(await fetch(`/api/admin/media/${id}`, { method: "DELETE" })),
};
