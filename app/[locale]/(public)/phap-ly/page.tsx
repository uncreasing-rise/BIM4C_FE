import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { pageMeta } from "@/lib/seo/page-meta";
import { getRequestLocale } from "@/lib/i18n/request";
import { LegalPageView } from "@/components/sections/LegalPageView";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = pageMeta("legal", await getRequestLocale());
  return pageMetadata(title, description, ROUTES.legal);
}

export default function LegalPage() {
  return <LegalPageView />;
}
