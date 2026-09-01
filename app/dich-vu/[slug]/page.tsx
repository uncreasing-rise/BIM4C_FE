import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/shared/DetailPage";
import { ROUTES } from "@/constants/routes";
import { getServiceBySlug } from "@/features/services/api/queries";

export function generateStaticParams() {
  return [];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const entry = await getServiceBySlug((await params).slug);
  return entry
    ? { title: `${entry.title} | BIM4C`, description: entry.description }
    : {};
}
export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const entry = await getServiceBySlug((await params).slug);
  if (!entry) notFound();
  return (
    <DetailPage
      entry={entry}
      kind="service"
      backHref={ROUTES.services}
      backLabel="Tất cả dịch vụ"
    />
  );
}
