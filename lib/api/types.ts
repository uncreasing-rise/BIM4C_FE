export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  body?: unknown | FormData;
  timeoutMs?: number;
  token?: string | null;
}
