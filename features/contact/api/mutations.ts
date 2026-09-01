import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import {
  contactSchema,
  courseRegistrationSchema,
  newsletterSchema,
} from "../schemas/contact.schema";
import type {
  ContactFormInput,
  CourseRegistrationInput,
  MutationResult,
  NewsletterSubscriptionInput,
} from "../types/mutations";

function parseMutationResult(response: unknown): MutationResult {
  if (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    response.success === true &&
    "message" in response &&
    typeof response.message === "string"
  ) {
    return { success: true, message: response.message };
  }

  throw new ApiError(
    502,
    "Phản hồi từ máy chủ không đúng định dạng.",
    "INVALID_RESPONSE",
  );
}

export async function submitContactForm(
  input: ContactFormInput,
  signal?: AbortSignal,
): Promise<MutationResult> {
  const payload = contactSchema.parse(input);
  return parseMutationResult(
    await apiClient.post<unknown>(API_ENDPOINTS.contact.submit, payload, {
      signal,
      cache: "no-store",
    }),
  );
}

export async function registerCourse(
  input: CourseRegistrationInput,
  signal?: AbortSignal,
): Promise<MutationResult> {
  const payload = courseRegistrationSchema.parse(input);
  return parseMutationResult(
    await apiClient.post<unknown>(
      API_ENDPOINTS.courseRegistrations.create,
      payload,
      { signal, cache: "no-store" },
    ),
  );
}

export async function subscribeNewsletter(
  input: NewsletterSubscriptionInput,
  signal?: AbortSignal,
): Promise<MutationResult> {
  const payload = newsletterSchema.parse(input);
  return parseMutationResult(
    await apiClient.post<unknown>(API_ENDPOINTS.newsletter.subscribe, payload, {
      signal,
      cache: "no-store",
    }),
  );
}
