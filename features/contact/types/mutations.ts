export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  consent: boolean;
}

export interface CourseRegistrationInput {
  courseId: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

export interface NewsletterSubscriptionInput {
  email: string;
  consent: boolean;
}

export interface MutationResult {
  success: true;
  message: string;
}
