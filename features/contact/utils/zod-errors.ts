import type { Locale } from "@/lib/i18n/config";

/**
 * Structural shape of a zod validation error. Matching on shape (rather than
 * `instanceof ZodError`) works for both the classic and `zod/mini` APIs, whose
 * error classes differ.
 */
export interface ValidationIssues {
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>;
}

export function isValidationError(error: unknown): error is ValidationIssues {
  return (
    typeof error === "object" &&
    error !== null &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}

const enToViZodMessages: Record<string, string> = {
  "Please enter your full name.": "Vui lòng nhập họ và tên của bạn.",
  "Please enter a valid email address.": "Vui lòng nhập địa chỉ email hợp lệ.",
  "Please enter at least 10 characters.": "Vui lòng nhập ít nhất 10 ký tự nội dung.",
  "Please enter a valid phone number.": "Vui lòng nhập số điện thoại hợp lệ.",
  "You must agree to the Privacy Policy.": "Bạn cần đồng ý với Chính sách bảo mật.",
  "You must agree to receive updates.": "Bạn cần đồng ý nhận thông tin cập nhật.",
  "This programme is not valid.": "Chương trình đào tạo này không hợp lệ.",
};

export function getZodFieldErrors<FieldName extends string>(
  error: ValidationIssues,
  locale: Locale = "en",
): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field as FieldName]) {
      const msg = issue.message;
      errors[field as FieldName] =
        locale === "vi" ? enToViZodMessages[msg] ?? msg : msg;
    }
  }

  return errors;
}

