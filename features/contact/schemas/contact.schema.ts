// zod/mini is the tree-shakable zod v4 API. These forms render on every public
// page (the newsletter form lives in the footer), and the classic API adds
// ~60 KB gzipped to each page's client bundle.
import * as z from "zod/mini";

const trimmed = () => z.string().check(z.trim());

export const contactSchema = z.object({
  name: trimmed().check(z.minLength(2, "Please enter your full name.")),
  email: z.email("Please enter a valid email address."),
  phone: z.optional(trimmed()),
  company: z.optional(trimmed()),
  message: trimmed().check(z.minLength(10, "Please enter at least 10 characters.")),
  consent: z.literal(true, { error: "You must agree to the Privacy Policy." }),
});

export const courseRegistrationSchema = z.object({
  courseId: trimmed().check(z.minLength(1, "This programme is not valid.")),
  name: trimmed().check(z.minLength(2, "Please enter your full name.")),
  email: z.email("Please enter a valid email address."),
  phone: trimmed().check(z.minLength(8, "Please enter a valid phone number.")),
  consent: z.literal(true, { error: "You must agree to the Privacy Policy." }),
});

export const newsletterSchema = z.object({
  email: z.email("Please enter a valid email address."),
  consent: z.literal(true, { error: "You must agree to receive updates." }),
});
