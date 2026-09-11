import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { ContactPageView } from "@/components/sections/ContactPageView";

export const metadata: Metadata = pageMetadata(
  "Contact",
  "Talk with BIM4C about consulting, BIM delivery, training and digital construction.",
  ROUTES.contact,
);

export default function ContactPage() {
  return <ContactPageView />;
}
