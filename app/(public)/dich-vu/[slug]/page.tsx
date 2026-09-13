import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailView } from "@/components/services/ServiceDetailView";
import { ROUTES } from "@/constants/routes";
import { getServiceBySlug, getServices } from "@/features/services/api/queries";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";

// The root layout reads the locale cookie, so this detail route must not be
// treated as an ISR/SSG entry during the Server Components render.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const entry = await getServiceBySlug((await params).slug);
  if (!entry) notFound();
  return getContentMetadata(entry, ROUTES.serviceDetail(entry.slug));
}
export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [entry, services] = await Promise.all([
    getServiceBySlug(slug),
    getServices({ limit: 6 }),
  ]);
  if (!entry) notFound();
  return (
    <main>
      <ServiceDetailView
        entry={entry}
        related={selectRelatedContent(entry, services)}
        backHref={ROUTES.services}
      />
    </main>
  );
}
