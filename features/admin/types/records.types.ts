export type RecordDomainType = "contact" | "course" | "newsletter";

export type SubmissionStatus =
  | "NEW"
  | "PROCESSING"
  | "RESOLVED"
  | "SPAM"
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";

export interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  serviceCategory?: string | null;
  subject?: string | null;
  message: string;
  status: SubmissionStatus;
  consentGiven: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string | null;
  jobTitle?: string | null;
  courseName?: string | null;
  courseSlug?: string | null;
  experienceLevel?: string | null;
  message?: string | null;
  status: SubmissionStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: boolean;
  source?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
