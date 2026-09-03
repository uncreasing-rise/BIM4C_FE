import { ZodError } from "zod";

export function getZodFieldErrors<FieldName extends string>(
  error: ZodError,
): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field as FieldName]) {
      errors[field as FieldName] = issue.message;
    }
  }

  return errors;
}
