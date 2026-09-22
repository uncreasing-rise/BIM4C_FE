import { env } from "@/lib/config/env";

const DEFAULT_TIMEOUT_MS = 15_000;

export interface AdminRequestInit extends RequestInit {
  timeoutMs?: number;
}

export async function adminRequest<T>(
  path: string,
  init?: AdminRequestInit,
): Promise<T> {
  const cleanPath = path.replace(/^\/+/, "");
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(!isFormData && init?.body ? { "Content-Type": "application/json" } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    init?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(`${env.apiUrl}/admin/${cleanPath}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string | string[];
        code?: string;
        errors?: Record<string, string[]>;
      } | null;

      let errorMessage = "";
      if (Array.isArray(body?.message)) {
        errorMessage = body.message.join("; ");
      } else if (typeof body?.message === "string") {
        errorMessage = body.message;
      } else {
        errorMessage = `Admin API error (${response.status})`;
      }

      if (body?.errors && typeof body.errors === "object") {
        const details = Object.entries(body.errors)
          .map(([key, errors]) => `${key}: ${Array.isArray(errors) ? errors.join(", ") : String(errors)}`)
          .join("; ");
        if (details) errorMessage += ` - ${details}`;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (timeoutController.signal.aborted && !init?.signal?.aborted) {
      throw new Error("Request timeout. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function buildQueryString(
  input?: Record<string, unknown> | object | null,
): string {
  if (!input || typeof input !== "object") return "";
  const q = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, String(value));
    }
  });
  return q.toString();
}
