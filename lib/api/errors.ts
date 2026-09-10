import type { ApiErrorPayload } from "./types";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check your request and try again.",
  401: "Please sign in to continue.",
  403: "You do not have permission to perform this action.",
  404: "The requested information could not be found.",
  409: "This information has changed. Please refresh and try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  422: "Please check the information you entered.",
  500: "The service is temporarily unavailable. Please try again shortly.",
  502: "The service is temporarily unavailable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The request timed out. Please try again shortly.",
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isNotFoundError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 404;
}

export async function createApiError(response: Response): Promise<ApiError> {
  let payload: ApiErrorPayload = {};
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    // Some upstream errors do not have a JSON body.
  }
  return new ApiError(
    response.status,
    (typeof payload.message === "string" && !/[À-ỹĐđ]/u.test(payload.message)
      ? payload.message
      : undefined) ||
      STATUS_MESSAGES[response.status] ||
      "We could not complete your request. Please try again.",
    payload.code,
    payload.errors,
  );
}

export function normalizeRequestError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === "AbortError")
    return new ApiError(
      408,
      "The request timed out. Please check your connection and try again.",
      "REQUEST_TIMEOUT",
    );
  return new ApiError(
    0,
    "Unable to connect. Please check your connection and try again.",
    "NETWORK_ERROR",
  );
}
