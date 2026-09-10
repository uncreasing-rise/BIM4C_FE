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
import { PRIVACY_POLICY_VERSION } from "@/constants/legal-content";

function parseMutationResult(
  response: unknown,
  message: string,
): MutationResult {
  if (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    response.success === true &&
    "message" in response &&
    typeof response.message === "string"
  ) {
    return { success: true, message };
  }

  throw new ApiError(
    502,
    "We could not confirm your request. Please try again or contact us directly.",
    "INVALID_RESPONSE",
  );
}

export async function submitContactForm(
  input: ContactFormInput,
  signal?: AbortSignal,
): Promise<MutationResult> {
  const payload = contactSchema.parse(input);
  return parseMutationResult(
    await apiClient.post<unknown>(
      API_ENDPOINTS.contact.submit,
      { ...payload, privacyPolicyVersion: PRIVACY_POLICY_VERSION },
      {
        signal,
        cache: "no-store",
      },
    ),
    "Thank you. Your enquiry has been received. Our team will usually reply within one business day.",
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
      { ...payload, privacyPolicyVersion: PRIVACY_POLICY_VERSION },
      { signal, cache: "no-store" },
    ),
    "Thank you. We have received your programme enquiry and will contact you with the next steps.",
  );
}

export async function subscribeNewsletter(
  input: NewsletterSubscriptionInput,
  signal?: AbortSignal,
): Promise<MutationResult> {
  const payload = newsletterSchema.parse(input);
  return parseMutationResult(
    await apiClient.post<unknown>(
      API_ENDPOINTS.newsletter.subscribe,
      { ...payload, privacyPolicyVersion: PRIVACY_POLICY_VERSION },
      {
        signal,
        cache: "no-store",
      },
    ),
    "You are subscribed to BIM4C insights. Thank you for joining us.",
  );
}
