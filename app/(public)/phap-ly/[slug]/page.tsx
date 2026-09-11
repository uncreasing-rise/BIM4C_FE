import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalDocument, legalDocuments } from "@/constants/legal-content";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo/listing";
import { LegalDetailView } from "@/components/sections/LegalDetailView";

export function generateStaticParams() {
  return legalDocuments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const document = getLegalDocument((await params).slug);
  if (!document) notFound();
  return pageMetadata(
    document.title,
    document.summary,
    ROUTES.legalDetail(document.slug),
  );
}

export default async function LegalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const document = getLegalDocument(slug);
  if (!document) notFound();

  return <LegalDetailView slug={slug} />;
}
