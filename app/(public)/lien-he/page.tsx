import type { Metadata } from "next";
import { ConsultationSection } from "@/components/sections/ConsultationSection";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";

export const metadata: Metadata = pageMetadata("Contact", "Talk with BIM4C about consulting, BIM delivery, training and digital construction.", ROUTES.contact);

export default function ContactPage() {
  return (
    <main>
      <ConsultationSection />
    </main>
  );
}
