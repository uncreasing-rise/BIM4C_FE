import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { pageMeta } from "@/lib/seo/page-meta";
import { getRequestLocale } from "@/lib/i18n/request";
import { ContactPageView } from "@/components/sections/ContactPageView";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = pageMeta("contact", await getRequestLocale());
  return pageMetadata(title, description, ROUTES.contact);
}

export default function ContactPage() {
  return <ContactPageView />;
}
