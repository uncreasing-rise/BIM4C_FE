import type { ApiErrorPayload } from "./types";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Yêu cầu không hợp lệ.",
  401: "Bạn cần đăng nhập để tiếp tục.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  409: "Dữ liệu đang bị xung đột.",
  422: "Dữ liệu chưa hợp lệ.",
  500: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
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
    payload = await response.json() as ApiErrorPayload;
  } catch {
    // Some upstream errors do not have a JSON body.
  }
  return new ApiError(response.status, payload.message || STATUS_MESSAGES[response.status] || "Có lỗi xảy ra khi kết nối máy chủ.", payload.code, payload.errors);
}

export function normalizeRequestError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === "AbortError") return new ApiError(408, "Yêu cầu đã quá thời gian chờ.", "REQUEST_TIMEOUT");
  return new ApiError(0, "Không thể kết nối đến máy chủ.", "NETWORK_ERROR");
}
