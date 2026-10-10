import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailView } from "@/components/services/ServiceDetailView";
import { PublicDataFallback } from "@/components/shared/PublicDataFallback";
import { ROUTES } from "@/constants/routes";
import { getServiceBySlug, getServices } from "@/features/services/api/queries";
import { getContentMetadata } from "@/features/shared/seo/content-metadata";
import { selectRelatedContent } from "@/features/shared/selectors/related-content";
import { unavailableMetadata } from "@/lib/seo/listing";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  let entry;
  try {
    entry = await getServiceBySlug(slug);
  } catch {
    return unavailableMetadata(
      {
        vi: {
          title: "Dịch vụ BIM & công nghệ xây dựng",
          description: "Giải pháp tư vấn BIM, phối hợp mô hình và công nghệ xây dựng của BIM4C.",
        },
        en: {
          title: "BIM & construction technology service",
          description: "BIM consulting, model coordination and construction technology from BIM4C.",
        },
      },
      ROUTES.serviceDetail(slug),
    );
  }
  if (!entry) notFound();
  return await getContentMetadata(entry, ROUTES.serviceDetail(entry.slug));
}
export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let entry;
  try {
    entry = await getServiceBySlug(slug);
  } catch {
    return <PublicDataFallback title="Dịch vụ BIM & công nghệ xây dựng" description="Nội dung dịch vụ đang được cập nhật. Vui lòng thử lại sau." />;
  }
  if (!entry) notFound();
  const services = await getServices({ limit: 6 }).catch(() => []);
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
