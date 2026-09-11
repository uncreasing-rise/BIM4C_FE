import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { AboutView } from "@/components/sections/AboutView";

export const metadata: Metadata = pageMetadata(
  "About",
  "Meet BIM4C: connecting construction expertise, BIM workflows and project information.",
  ROUTES.about,
);

export default function AboutPage() {
  return (
    <main>
      <AboutView />
    </main>
  );
}

