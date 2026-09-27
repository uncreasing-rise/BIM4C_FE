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
import { trackEvent, visitAttribution } from "@/lib/analytics/tracker";

/** Records a sent form and returns the result unchanged. */
function sent(form: string, result: MutationResult): MutationResult {
  trackEvent("form_submit", { label: form });
  return result;
}

function parseMutationResult(
  response: unknown,
  fallbackMessage: string,
): MutationResult {
  if (typeof response === "object" && response !== null) {
    const res = response as Record<string, unknown>;
    if (res.success === false) {
      throw new ApiError(
        400,
        typeof res.message === "string"
          ? res.message
          : "Request was not successful",
        "MUTATION_FAILED",
      );
    }
    const message =
      typeof res.message === "string" && res.message.trim()
        ? res.message
        : fallbackMessage;
    const delivery = res.notification as MutationResult["notification"];
    return {
      success: true,
      message,
      notification:
        delivery && ["sent", "failed", "skipped"].includes(delivery.customer)
          ? delivery
          : undefined,
    };
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
  return sent("contact", parseMutationResult(
    await apiClient.post<unknown>(
      API_ENDPOINTS.contact.submit,
      {
        ...payload,
        locale: input.locale ?? "vi",
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        attribution: visitAttribution(),
      },
      {
        signal,
        cache: "no-store",
        timeoutMs: 30000,
      },
    ),
    "Thank you. Your enquiry has been received. Our team will usually reply within one business day.",
  ));
}

export async function registerCourse(
  input: CourseRegistrationInput,
  signal?: AbortSignal,
): Promise<MutationResult> {
  const payload = courseRegistrationSchema.parse(input);
  return sent("course", parseMutationResult(
    await apiClient.post<unknown>(
      API_ENDPOINTS.courseRegistrations.create,
      {
        ...payload,
        locale: input.locale ?? "vi",
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        attribution: visitAttribution(),
      },
      { signal, cache: "no-store", timeoutMs: 30000 },
    ),
    "Thank you. We have received your programme enquiry and will contact you with the next steps.",
  ));
}

export async function subscribeNewsletter(
  input: NewsletterSubscriptionInput,
  signal?: AbortSignal,
): Promise<MutationResult> {
  const payload = newsletterSchema.parse(input);
  return sent("newsletter", parseMutationResult(
    await apiClient.post<unknown>(
      API_ENDPOINTS.newsletter.subscribe,
      {
        ...payload,
        locale: input.locale ?? "vi",
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        attribution: visitAttribution(),
      },
      {
        signal,
        cache: "no-store",
        timeoutMs: 30000,
      },
    ),
    "You are subscribed to BIM4C insights. Thank you for joining us.",
  ));
}
