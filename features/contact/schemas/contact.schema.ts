import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  message: z.string().trim().min(10, "Please enter at least 10 characters."),
  consent: z.literal(true, { error: "You must agree to the Privacy Policy." }),
});

export const courseRegistrationSchema = z.object({
  courseId: z.string().trim().min(1, "This programme is not valid."),
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  phone: z.string().trim().min(8, "Please enter a valid phone number."),
  consent: z.literal(true, { error: "You must agree to the Privacy Policy." }),
});

export const newsletterSchema = z.object({
  email: z.email("Please enter a valid email address."),
  consent: z.literal(true, { error: "You must agree to receive updates." }),
});
