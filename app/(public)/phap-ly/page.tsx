import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { LegalPageView } from "@/components/sections/LegalPageView";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
  "Legal",
  "BIM4C privacy, terms of use and personal data protection information.",
  ROUTES.legal,
  );
}

export default function LegalPage() {
  return <LegalPageView />;
}
