export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

export interface CourseRegistrationInput {
  courseId: string;
  name: string;
  email: string;
  phone: string;
}

export interface NewsletterSubscriptionInput {
  email: string;
  consent: boolean;
}

export interface MutationResult {
  success: true;
  message: string;
}
