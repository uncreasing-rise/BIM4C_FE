import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/shared/DetailPage";
import { ROUTES } from "@/constants/routes";
import { getServiceBySlug, getServices } from "@/features/services/api/queries";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";

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
    ? getContentMetadata(entry, ROUTES.serviceDetail(entry.slug))
    : {};
}
export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [entry, services] = await Promise.all([getServiceBySlug(slug), getServices()]);
  if (!entry) notFound();
  return (
    <main>
      <DetailPage
        entry={entry}
        kind="service"
        related={selectRelatedContent(entry, services)}
        backHref={ROUTES.services}
        backLabel="Tất cả dịch vụ"
      />
    </main>
  );
}
