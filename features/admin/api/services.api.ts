import type {
  AdminServiceContent,
  PageResult,
  ServiceFilterQuery,
} from "../types";
import { serializeServicePayload } from "../serializers/services.serializer";
import { adminRequest, buildQueryString } from "./http-client";

export const servicesApi = {
  /** Danh sách dịch vụ có phân trang và bộ lọc */
  list: (query: ServiceFilterQuery = {}, signal?: AbortSignal) => {
    const qs = buildQueryString(query);
    return adminRequest<PageResult<AdminServiceContent>>(`services${qs ? `?${qs}` : ""}`, {
      signal,
    });
  },

  /** Chi tiết dịch vụ */
  getById: (id: string, signal?: AbortSignal) =>
    adminRequest<{ data: AdminServiceContent }>(`services/${id}`, { signal }),

  /** Tạo mới dịch vụ */
  create: (payload: Partial<AdminServiceContent>) =>
    adminRequest<{ data: AdminServiceContent }>("services", {
      method: "POST",
      body: JSON.stringify(serializeServicePayload(payload)),
    }),

  /** Cập nhật dịch vụ */
  update: (id: string, payload: Partial<AdminServiceContent>) =>
    adminRequest<{ data: AdminServiceContent }>(`services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(serializeServicePayload(payload)),
    }),

  /** Xóa dịch vụ */
  remove: (id: string) =>
    adminRequest<void>(`services/${id}`, { method: "DELETE" }),

  /** Thao tác hàng loạt */
  bulk: (ids: string[], action: "publish" | "archive" | "delete") =>
    adminRequest<{ success: true; affected: number }>("services/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action }),
    }),
};
