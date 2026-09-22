import type { PageResult } from "../types";
import { adminRequest, buildQueryString } from "./http-client";

export interface AdminRecord {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status?: string;
  isActive?: boolean;
  createdAt: string;
  course?: { title: string };
  consent?: boolean;
  consentGiven?: boolean | null;
  consentAt?: string | null;
  privacyPolicyVersion?: string | null;
  consentSource?: string | null;
}

export type RecordKind =
  | "contacts"
  | "course-registrations"
  | "newsletter/subscriptions";

export const recordsApi = {
  list: (
    kind: RecordKind,
    search: string,
    status: string,
    page: number,
    signal?: AbortSignal,
  ) => {
    const qs = buildQueryString({
      page,
      search: search.trim() || undefined,
      status: status || undefined,
    });
    return adminRequest<PageResult<AdminRecord>>(
      `${kind}${qs ? `?${qs}` : ""}`,
      { signal },
    );
  },

  update: (kind: RecordKind, id: string, body: unknown) =>
    adminRequest<{ data: AdminRecord }>(`${kind}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (kind: RecordKind, id: string) =>
    adminRequest<void>(`${kind}/${id}`, { method: "DELETE" }),
};

/** Backward-compatible export */
export const adminRecordsApi = recordsApi;
