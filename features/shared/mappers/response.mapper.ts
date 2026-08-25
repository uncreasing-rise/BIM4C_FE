import type { ApiResponse } from "@/lib/api/types";

export function unwrapData<T>(response: ApiResponse<T> | T): T {
  return typeof response === "object" && response !== null && "data" in response
    ? (response as ApiResponse<T>).data
    : response as T;
}

