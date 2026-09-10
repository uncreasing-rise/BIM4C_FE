import type { Metadata } from "next";
import { ConsultationSection } from "@/components/sections/ConsultationSection";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { PageHero } from "@/components/shared/PageHero";

export const metadata: Metadata = pageMetadata(
  "Contact",
  "Talk with BIM4C about consulting, BIM delivery, training and digital construction.",
  ROUTES.contact,
);

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your project."
        description="Tell us where you are in your project. Together, we will define the right BIM support and next steps."
        image="/images/news-bim-training.webp"
      />
      <ConsultationSection />
    </main>
  );
}
