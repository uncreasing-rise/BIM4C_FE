import { env, assertApiEnvironment } from "@/lib/config/env";
import { ApiError, createApiError, normalizeRequestError } from "./errors";
import type { HttpMethod, RequestOptions } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  if (options.body !== undefined && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  return headers;
}

async function request<T>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<T> {
  assertApiEnvironment();
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeoutController.signal]) : timeoutController.signal;

  try {
    const response = await fetch(`${env.apiUrl}${endpoint}`, {
      ...options,
      method,
      headers: buildHeaders(options),
      body: options.body instanceof FormData ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body),
      signal,
    });
    if (!response.ok) throw await createApiError(response);
    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new ApiError(502, "Máy chủ trả về định dạng phản hồi không hợp lệ.", "INVALID_RESPONSE");
    }
    try {
      return await response.json() as T;
    } catch {
      throw new ApiError(502, "Máy chủ trả về JSON không hợp lệ.", "INVALID_JSON");
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError" && options.signal?.aborted) {
      throw new ApiError(499, "Yêu cầu đã bị hủy.", "REQUEST_ABORTED");
    }
    throw normalizeRequestError(error);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>("GET", endpoint, options),
  post: <T>(endpoint: string, body?: unknown | FormData, options?: RequestOptions) => request<T>("POST", endpoint, { ...options, body }),
  put: <T>(endpoint: string, body?: unknown | FormData, options?: RequestOptions) => request<T>("PUT", endpoint, { ...options, body }),
  patch: <T>(endpoint: string, body?: unknown | FormData, options?: RequestOptions) => request<T>("PATCH", endpoint, { ...options, body }),
  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>("DELETE", endpoint, options),
};
