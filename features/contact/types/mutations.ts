export interface ContactFormInput {
  locale?: "vi" | "en";
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  consent: boolean;
}

export interface CourseRegistrationInput {
  locale?: "vi" | "en";
  courseId: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

export interface NewsletterSubscriptionInput {
  locale?: "vi" | "en";
  email: string;
  consent: boolean;
}

export interface MutationResult {
  success: true;
  message: string;
  notification?: {
    customer: "sent" | "failed" | "skipped";
    admin?: "sent" | "failed" | "skipped";
  };
}
